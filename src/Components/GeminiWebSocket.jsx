import { Base64 } from "js-base64";
import { TranscriptionService } from "./transcriptionService.js";
import { pcmToWav } from "./audioUtils.js";

const MODEL = "models/gemini-2.0-flash-exp";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const HOST = "generativelanguage.googleapis.com";
const WS_URL = `wss://${HOST}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`;

export class GeminiWebSocket {
  constructor(
    onMessage,
    onSetupComplete,
    onPlayingStateChange,
    onAudioLevelChange,
    onTranscription
  ) {
    this.ws = null;
    this.isConnected = false;
    this.isSetupComplete = false;
    this.onMessageCallback = onMessage;
    this.onSetupCompleteCallback = onSetupComplete;
    this.onPlayingStateChange = onPlayingStateChange;
    this.onAudioLevelChange = onAudioLevelChange;
    this.onTranscriptionCallback = onTranscription;
    this.audioContext = new AudioContext({ sampleRate: 24000 });
    this.audioQueue = [];
    this.isPlaying = false;
    this.currentSource = null;
    this.isPlayingResponse = false;
    this.transcriptionService = new TranscriptionService();
    this.accumulatedPcmData = [];
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      this.isConnected = true;
      this.sendInitialSetup();
    };

    this.ws.onmessage = async (event) => {
      try {
        let messageText;
        if (event.data instanceof Blob) {
          const arrayBuffer = await event.data.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          messageText = new TextDecoder("utf-8").decode(bytes);
        } else {
          messageText = event.data;
        }
        await this.handleMessage(messageText);
      } catch (error) {
        console.error("[WebSocket] Error processing message:", error);
      }
    };

    this.ws.onerror = (error) => console.error("[WebSocket] Error:", error);

    this.ws.onclose = (event) => {
      this.isConnected = false;
      if (!event.wasClean && this.isSetupComplete) {
        setTimeout(() => this.connect(), 1000);
      }
    };
  }

  sendInitialSetup() {
    const setupMessage = {
      setup: {
        model: MODEL,
        generation_config: {
          response_modalities: ["AUDIO"],
        },
      },
    };
    this.ws?.send(JSON.stringify(setupMessage));
  }

  sendMediaChunk(b64Data, mimeType) {
    if (!this.isConnected || !this.ws || !this.isSetupComplete) return;

    const message = {
      realtime_input: {
        media_chunks: [
          {
            mime_type: mimeType === "audio/pcm" ? "audio/pcm" : mimeType,
            data: b64Data,
          },
        ],
      },
    };

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error("[WebSocket] Error sending media chunk:", error);
    }
  }

  async playAudioResponse(base64Data) {
    if (!this.audioContext) return;

    try {
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const pcmData = new Int16Array(bytes.buffer);
      const float32Data = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        float32Data[i] = pcmData[i] / 32768.0;
      }

      this.audioQueue.push(float32Data);
      this.playNextInQueue();
    } catch (error) {
      console.error("[WebSocket] Error processing audio:", error);
    }
  }

  async playNextInQueue() {
    if (!this.audioContext || this.isPlaying || this.audioQueue.length === 0)
      return;

    try {
      this.isPlaying = true;
      this.isPlayingResponse = true;
      this.onPlayingStateChange?.(true);

      const float32Data = this.audioQueue.shift();

      let sum = 0;
      for (let i = 0; i < float32Data.length; i++)
        sum += Math.abs(float32Data[i]);
      const level = Math.min((sum / float32Data.length) * 100 * 5, 100);
      this.onAudioLevelChange?.(level);

      const audioBuffer = this.audioContext.createBuffer(
        1,
        float32Data.length,
        24000
      );
      audioBuffer.getChannelData(0).set(float32Data);

      this.currentSource = this.audioContext.createBufferSource();
      this.currentSource.buffer = audioBuffer;
      this.currentSource.connect(this.audioContext.destination);

      this.currentSource.onended = () => {
        this.isPlaying = false;
        this.currentSource = null;
        if (this.audioQueue.length === 0) {
          this.isPlayingResponse = false;
          this.onPlayingStateChange?.(false);
        }
        this.playNextInQueue();
      };

      this.currentSource.start();
    } catch (error) {
      console.error("[WebSocket] Error playing audio:", error);
      this.isPlaying = false;
      this.isPlayingResponse = false;
      this.onPlayingStateChange?.(false);
      this.currentSource = null;
      this.playNextInQueue();
    }
  }

  async handleMessage(message) {
    try {
      const messageData = JSON.parse(message);

      if (messageData.setupComplete) {
        this.isSetupComplete = true;
        this.onSetupCompleteCallback?.();
        return;
      }

      if (messageData.serverContent?.modelTurn?.parts) {
        for (const part of messageData.serverContent.modelTurn.parts) {
          if (part.inlineData?.mimeType === "audio/pcm;rate=24000") {
            this.accumulatedPcmData.push(part.inlineData.data);
            this.playAudioResponse(part.inlineData.data);
          }
        }
      }

      if (messageData.serverContent?.turnComplete === true) {
        if (this.accumulatedPcmData.length > 0) {
          try {
            const fullPcmData = this.accumulatedPcmData.join("");
            const wavData = await pcmToWav(fullPcmData, 24000);
            const transcription =
              await this.transcriptionService.transcribeAudio(
                wavData,
                "audio/wav"
              );
            this.onTranscriptionCallback?.(transcription);
            this.accumulatedPcmData = [];
          } catch (error) {
            console.error("[WebSocket] Transcription error:", error);
          }
        }
      }
    } catch (error) {
      console.error("[WebSocket] Error parsing message:", error);
    }
  }

  disconnect() {
    this.isSetupComplete = false;
    if (this.ws) {
      this.ws.close(1000, "Intentional disconnect");
      this.ws = null;
    }
    this.isConnected = false;
    this.accumulatedPcmData = [];
  }
}
