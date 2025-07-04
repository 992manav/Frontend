import React, { useEffect, useRef, useState } from "react";
import { Base64 } from "js-base64";

const MODEL = "models/gemini-2.0-flash-exp";
const API_KEY = "AIzaSyC3rZ0Xi_SEU1BFEJhHqRhxJc6-IAzIgFM";
const HOST = "generativelanguage.googleapis.com";
const WS_URL = `wss://${HOST}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`;

const GeminiLiveClient = () => {
  const ws = useRef(null);
  const [transcription, setTranscription] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const audioContext = useRef(null);
  const mediaStream = useRef(null);
  const processor = useRef(null);
  const source = useRef(null);

  useEffect(() => {
    connectWebSocket();
    return () => disconnectWebSocket();
  }, []);

  const connectWebSocket = () => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected");
      sendSetupMessage();
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error", error);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const parts = data?.serverContent?.modelTurn?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.text) {
            setTranscription((prev) => prev + part.text);
          }
        }
      }
    };
  };

  const disconnectWebSocket = () => {
    if (ws.current) {
      ws.current.close();
    }
  };

  const sendSetupMessage = () => {
    const setupMsg = {
      setup: {
        model: MODEL,
        generation_config: {
          response_modalities: ["TEXT"],
        },
      },
    };
    ws.current?.send(JSON.stringify(setupMsg));
  };

  const sendMediaChunk = (chunk) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    const base64Data = Base64.fromUint8Array(chunk);
    const message = {
      realtime_input: {
        media_chunks: [
          {
            mime_type: "audio/pcm",
            data: base64Data,
          },
        ],
      },
    };

    ws.current.send(JSON.stringify(message));
  };

  const startRecording = async () => {
    audioContext.current = new (window.AudioContext ||
      window.webkitAudioContext)({ sampleRate: 24000 });
    mediaStream.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    source.current = audioContext.current.createMediaStreamSource(
      mediaStream.current
    );

    processor.current = audioContext.current.createScriptProcessor(4096, 1, 1);
    source.current.connect(processor.current);
    processor.current.connect(audioContext.current.destination);

    processor.current.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const pcmData = new Int16Array(input.length);
      for (let i = 0; i < input.length; i++) {
        pcmData[i] = input[i] * 32767;
      }
      sendMediaChunk(pcmData);
    };

    setIsRecording(true);
  };

  const stopRecording = () => {
    processor.current?.disconnect();
    source.current?.disconnect();
    mediaStream.current?.getTracks().forEach((track) => track.stop());
    audioContext.current?.close();
    setIsRecording(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">
        Gemini Voice Client (React Only)
      </h1>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded mr-2"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={!isConnected}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Transcription:</h2>
        <p className="bg-gray-100 p-2 rounded mt-2 whitespace-pre-wrap">
          {transcription}
        </p>
      </div>
    </div>
  );
};

export default GeminiLiveClient;
