import React, { useState, useRef, useEffect } from "react";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
} from "@heygen/streaming-avatar";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./LiveAi.css"; // Import your CSS styles
const genAI = new GoogleGenerativeAI("AIzaSyA_hb7cq8vwzBx8qDVQVihCPDc1RDZ1Zho");
const LiveAi = () => {
  const videoRef = useRef(null);
  const userInputRef = useRef(null);
  const [avatar, setAvatar] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [medicalAdvice, setmedicalAdvice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);

  // Speech recognition setup
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Update input field with transcript
  useEffect(() => {
    console.log("🔄 Transcript updated:", transcript);
    if (userInputRef.current && transcript) {
      userInputRef.current.value = transcript;
    }
  }, [transcript]);

  // Update listening state
  useEffect(() => {
    setIsListening(listening);
  }, [listening]);

  // 🔹 Fetch HeyGen Token
  const fetchAccessToken = async () => {
    try {
      const apiKey =
        "YjI2OTc5ZjE0YjdiNDlkN2I4MmEyNzFjYWY0OTYyZDctMTc0MjU4MTE1NQ=="; // Get API key from .env
      if (!apiKey) {
        throw new Error("HeyGen API key is missing! Check your .env file.");
      }

      const response = await fetch(
        "https://api.heygen.com/v1/streaming.create_token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({}), // Empty body as per API
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          `Failed to get token: ${result.message || "Unknown error"}`
        );
      }

      console.log("✅ Token received:", result.data.token);
      return result.data.token;
    } catch (error) {
      console.error("❌ Error fetching token:", error);
      return null;
    }
  };

  // 🔹 Initialize Streaming Avatar
  const initializeAvatarSession = async () => {
    try {
      setIsAvatarLoading(true);
      const token = await fetchAccessToken();
      if (!token) return;

      const newAvatar = new StreamingAvatar({ token });
      setAvatar(newAvatar);

      const newSessionData = await newAvatar.createStartAvatar({
        quality: AvatarQuality.Medium,
        avatarName: "default",
        language: "Hindi",
      });

      setSessionData(newSessionData);
      setIsSessionActive(true);
      console.log("✅ Session started:", newSessionData);
      setIsAvatarLoading(false);
      // 🔹 Set up event listeners
      newAvatar.on(StreamingEvents.STREAM_READY, handleStreamReady);
      newAvatar.on(
        StreamingEvents.STREAM_DISCONNECTED,
        handleStreamDisconnected
      );
    } catch (error) {
      console.error("❌ Error initializing avatar session:", error);
    }
  };

  // 🔹 Handle Stream Ready
  const handleStreamReady = (event) => {
    if (event.detail && videoRef.current) {
      videoRef.current.srcObject = event.detail;
      videoRef.current.onloadedmetadata = () =>
        videoRef.current.play().catch(console.error);
    } else {
      console.error("❌ Stream is not available");
    }
  };

  // 🔹 Handle Stream Disconnection
  const handleStreamDisconnected = () => {
    console.log("⚠️ Stream disconnected");
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsSessionActive(false);
  };

  // 🔹 End Avatar Session
  const terminateAvatarSession = async () => {
    if (!avatar || !sessionData) return;

    try {
      await avatar.stopAvatar();
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setAvatar(null);
      setSessionData(null);
      setIsSessionActive(false);
    } catch (error) {
      console.error("❌ Error terminating avatar session:", error);
    }
  };

  // 🔹 Fetch legal Advice from Flask Backend
  const fetchMedicalAdvice = async () => {
    setIsLoading(true);

    try {
      const userQuery = userInputRef.current?.value || "Give me medical advice";
      const prompt = `Provide a medical diagnosis in ${selectedLanguage} and you are a Female Doctor based on the following symptoms: ${userQuery}`;
      console.log("📤 Streaming prompt to Gemini:", prompt);

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });
      const result = await model.generateContentStream({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const stream = result.stream; // ✅ this is async iterable

      let fullResponse = "";

      for await (const chunk of stream) {
        const textChunk = chunk.text();
        if (textChunk) {
          fullResponse += textChunk;

          if (avatar) {
            await avatar.speak({
              text: textChunk,
              taskType: TaskType.REPEAT,
            });
          }
        }
      }

      setmedicalAdvice(fullResponse);
    } catch (error) {
      console.error("❌ Streaming error:", error);
      // const fallback = getSamplemedicalAdvice();
      // setmedicalAdvice(fallback);

      // if (avatar) {
      //   await avatar.speak({
      //     text: fallback,
      //     taskType: TaskType.REPEAT,
      //   });
      // }
    } finally {
      setIsLoading(false);
      if (userInputRef.current) userInputRef.current.value = "";
      resetTranscript();
    }
  };
  useEffect(() => {
    const box = document.querySelector(".diagnosis-output");
    if (box) box.scrollTop = box.scrollHeight;
  }, [medicalAdvice]);

  // 🔹 Toggle Speech Recognition
  const toggleListening = () => {
    if (listening) {
      console.log("🛑 Stopping microphone...");
      SpeechRecognition.stopListening();
    } else {
      console.log("🎙️ Starting microphone...");
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  // 🔹 Handle Voice Input Completion
  const handleVoiceInputComplete = () => {
    console.log(
      "✅ Voice input complete. Stopping mic and sending transcript..."
    );
    SpeechRecognition.stopListening();

    if (transcript) {
      console.log("📝 Transcript captured:", transcript);
      fetchMedicalAdvice(); // Uses voice text to get AI response
    } else {
      console.log("⚠️ No transcript captured");
    }
  };

  // 🔹 Cleanup on Unmount
  useEffect(() => {
    return () => {
      if (avatar && sessionData) {
        avatar.stopAvatar().catch(console.error);
      }
      SpeechRecognition.abortListening();
    };
  }, [avatar, sessionData]);

  // 🔹 Handle Enter Key Press
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      fetchMedicalAdvice(); // Get legal advice instead of direct speaking
    }
  };

  // Display warning if browser doesn't support speech recognition
  if (!browserSupportsSpeechRecognition) {
    console.warn("🚫 Speech recognition not supported in this browser.");
    return (
      <div className="browser-warning">
        Your browser does not support speech recognition. Please try Chrome.
      </div>
    );
  }

  const stopAvatarSpeech = () => {
    if (avatar) {
      avatar.interrupt();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffcbc2] to-[#ffffff] flex flex-col items-center justify-start p-6 space-y-8">
      <h1 className="text-4xl font-bold text-[#c94a4a] text-center">
        🩺 AI Medical Diagnosis Assistant
      </h1>
      <div className="flex flex-wrap justify-center gap-4">
        <button
          className={`px-6 py-2 rounded-lg text-white font-semibold transition ${
            isSessionActive
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#c94a4a] hover:bg-[#b23e3e]"
          }`}
          onClick={initializeAvatarSession}
          disabled={isSessionActive}
        >
          Start Diagnosis Session
        </button>
        <button
          className={`px-6 py-2 rounded-lg text-white font-semibold transition ${
            !isSessionActive
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#ff7676] hover:bg-[#e65b5b]"
          }`}
          onClick={terminateAvatarSession}
          disabled={!isSessionActive}
        >
          End Session
        </button>
      </div>

      {/* Content Row */}
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-4xl items-start justify-center">
        {/* Video Display */}
        <div className="relative w-full lg:w-2/3 aspect-video min-h-[500px] rounded-xl overflow-hidden shadow-xl border border-[#f4b8af] bg-gray-100">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {!isSessionActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg">
              <span>Start session to activate your diagnosis assistant</span>
            </div>
          )}
        </div>

        {/* Diagnosis Output */}
        {medicalAdvice && (
          <div className="w-full lg:w-2/3 bg-white text-gray-800 p-4 rounded-xl shadow-md border border-[#f4b8af] max-h-[500px] overflow-y-auto whitespace-pre-wrap break-words">
            <h3 className="text-xl font-semibold mb-2 text-[#c94a4a]">
              🩺 AI Diagnosis Suggestion:
            </h3>
            <p className="text-sm leading-relaxed font-medium">
              {medicalAdvice}
            </p>
          </div>
        )}
      </div>

      {isAvatarLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
          <div className="flex flex-col items-center space-y-4">
            <span className="text-[#c94a4a] text-2xl font-bold">
              🎥 Starting Diagnosis Session...
            </span>
            <div className="h-16 w-16 border-8 border-[#f4b8af] border-t-[#c94a4a] rounded-full animate-spin"></div>
          </div>
        </div>
      )}
      {/* Controls */}

      {/* Input + Language + Ask Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-5xl">
        <input
          type="text"
          ref={userInputRef}
          placeholder="Describe your symptoms or medical concern..."
          aria-label="Text for avatar to respond"
          onKeyPress={handleKeyPress}
          className="w-full sm:flex-1 px-4 py-2 rounded-lg border border-[#f4b8af] focus:outline-none focus:ring-2 focus:ring-[#c94a4a]"
          disabled={isLoading}
        />
        <div className="flex items-center gap-2">
          <label
            htmlFor="language-select"
            className="text-[#b24a4a] font-medium"
          >
            Language:
          </label>
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#f4b8af] focus:outline-none focus:ring-2 focus:ring-[#c94a4a]"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
          </select>
        </div>
        <button
          className="bg-[#c94a4a] hover:bg-[#a73737] text-white px-5 py-2 rounded-lg disabled:bg-[#f4c4c4]"
          onClick={fetchMedicalAdvice}
          disabled={!isSessionActive || isLoading}
        >
          {isLoading ? "Analyzing..." : "Ask for Diagnosis"}
        </button>
      </div>

      {isSessionActive && (
        <button
          className="bg-[#ff9a9a] hover:bg-[#f07070] text-white px-4 py-2 rounded-lg font-semibold"
          onClick={stopAvatarSpeech}
          disabled={!isSessionActive}
        >
          🛑 Stop Speaking
        </button>
      )}

      {/* Voice Controls */}
      <div className="flex gap-4 justify-center">
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            isListening
              ? "bg-[#e65b5b] text-white"
              : "bg-[#faccb7] text-[#a93d3d] hover:bg-[#f8bfb2]"
          }`}
          onClick={toggleListening}
          disabled={!isSessionActive || isLoading}
        >
          {isListening ? "Stop Listening" : "Start Voice Input"}
        </button>

        {isListening && (
          <button
            className="bg-[#c9e265] hover:bg-[#b1d54b] text-[#434d26] px-4 py-2 rounded-lg"
            onClick={handleVoiceInputComplete}
            disabled={isLoading}
          >
            Send Voice Input
          </button>
        )}
      </div>

      {/* Listening Indicator */}
      {isListening && (
        <div className="text-center text-[#6b2e2e] mt-2">
          🎤 Listening... Please describe your symptoms
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div className="flex justify-center items-center mt-4 text-[#c94a4a] font-medium">
          🔄 Analyzing Symptoms...
          <div className="ml-3 h-5 w-5 border-4 border-[#f4b8af] border-t-[#c94a4a] rounded-full animate-spin"></div>
        </div>
      )}
    </main>
  );
};

export default LiveAi;
