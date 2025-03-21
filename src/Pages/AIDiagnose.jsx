import { useState, useEffect } from "react";

const API_KEY = "AIzaSyA_hb7cq8vwzBx8qDVQVihCPDc1RDZ1Zho";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${API_KEY}`;

const AIDiagnose = () => {
  const [formData, setFormData] = useState({
    symptoms: "",
    symptomDuration: "Hours",
    painLevel: 5,
    image: null,
    imagePreview: null,
    aiDiagnosis: "",
    confidenceScore: "",
    riskLevel: "",
    recommendation: "",
    prescription: "",
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [utterance, setUtterance] = useState(null);
  const [voices, setVoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const updateVoices = () => {
      setVoices(synth.getVoices());
    };

    synth.addEventListener("voiceschanged", updateVoices);
    updateVoices();

    return () => {
      synth.removeEventListener("voiceschanged", updateVoices);
    };
  }, []);

  useEffect(() => {
    if (utterance) {
      utterance.onend = () => setIsPlaying(false);
    }
  }, [utterance]);

  const speak = () => {
    const synth = window.speechSynthesis;
    const diagnosisText = formData.explanationMatch || "No diagnosis available";

    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
    } else {
      const newUtterance = new SpeechSynthesisUtterance(diagnosisText);
      const femaleVoice = voices.find((voice) => voice.name.includes("Female"));
      newUtterance.voice = femaleVoice || voices[0];
      newUtterance.rate = 0.9;

      setUtterance(newUtterance);
      synth.speak(newUtterance);
      setIsPlaying(true);
    }
  };
  const extractRecommendation = (text) => {
    const match = text.match(
      /\*\*Recommendation:\*\*(.*?)- \*\*Prescription:\*\*/s
    );
    console.log("kaut", match[1].replace(/\*/g, "").replace(/\n/g, " ").trim());
    return match
      ? match[1].replace(/\*/g, "").replace(/\n/g, " ").trim()
      : "No recommendation found";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: file, imagePreview: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeWithAI = async () => {
    if (!formData.symptoms.trim() && !formData.image) {
      alert("Please enter symptoms or upload an image.");
      return;
    }

    setIsLoading(true);

    try {
      let requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are an experienced medical doctor. Provide a structured diagnosis based on the given symptoms and image (if provided) and always give result for each field like you are doctor.

                **Response Format:**
                - **Diagnosis:** [Medical condition]
                - **Explain-Symptoms-Detected:** [Explanation]
                - **Risk Level:** [Low / Moderate / High]
                - **Confidence Score:** [Percentage]
                - **Recommendation:** [Home remedy or medical advice or  diet and therapy plans]
                - **Prescription:** [Medication or tablets name or medicine names ]

                **Patient Details:**
                - Symptoms: ${formData.symptoms}
                - Duration: ${formData.symptomDuration}
                - Pain Level (1-10): ${formData.painLevel}
                `,
              },
            ],
          },
        ],
      };

      if (formData.image) {
        const base64Image = await convertImageToBase64(formData.image);
        requestBody.contents[0].parts.push({
          inlineData: { mimeType: "image/jpeg", data: base64Image },
        });
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error?.message || "AI response error");

      const aiResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No diagnosis available.";

      console.log(aiResponse);

      const diagnosisMatch = aiResponse.match(/\*\*Diagnosis:\*\* (.+)/);
      const riskLevelMatch = aiResponse.match(/\*\*Risk Level:\*\* (.+)/);
      const confidenceMatch = aiResponse.match(
        /\*\*Confidence Score:\*\* (.+)/
      );
      const explanationMatch = aiResponse.match(
        /\*\*Explain-Symptoms-Detected:\*\* (.+)/
      );
      const recommendationMatch = extractRecommendation(aiResponse);

      const prescriptionMatch = aiResponse.match(/\*\*Prescription:\*\* (.+)/);

      setFormData((prevData) => ({
        ...prevData,
        aiDiagnosis: diagnosisMatch
          ? diagnosisMatch[1]
          : "No diagnosis available.",
        riskLevel: riskLevelMatch ? riskLevelMatch[1] : "Unknown",
        confidenceScore: confidenceMatch ? confidenceMatch[1] : "Unknown",
        recommendation: recommendationMatch
          ? recommendationMatch
          : "Consult a doctor for further guidance.",
        prescription: prescriptionMatch
          ? prescriptionMatch[1]
          : "No prescription available.",
        explanationMatch: explanationMatch ? explanationMatch[1] : "Unknown",
      }));
    } catch (error) {
      console.error("AI Analysis Error:", error);
      alert("An error occurred while processing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const extractValue = (text) => {
    const match = text.match(/\*\*Prescription:\*\* (.+)/);
    return match ? match[1] : "Unknown";
  };

  //console.log(()=>{extractRecommendation(aiResponse)});

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#ffcbc2] to-[#FFFFFF]">
      <h1
        className="text-3xl text-center mb-7 font-bold text-[#c94a4a] cursor-pointer hover:scale-110 transition duration-300 ease-in-out tracking-widest"
        style={{ fontFamily: "Pixelcraft, sans-serif" }}
      >
        Dhanvantari AI
      </h1>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b-2 border-slate-100 pb-4">
            Symptoms
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Symptoms Description
              </label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                className="w-full  px-4 py-3 bg-[#ffcbc2] border border-[#f47f62] rounded-lg focus:ring-2 focus:ring-[#f47f62] focus:border-[#f47f62] outline-none"
                rows="4"
                placeholder="Describe your symptoms..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Duration
                </label>
                <select
                  name="symptomDuration"
                  value={formData.symptomDuration}
                  onChange={handleChange}
                  className="w-full bg-[#ffcbc2] px-4 py-3 border border-[#f47f62] rounded-lg focus:ring-2 focus:ring-[#328cc8] focus:border-[#328cc8] outline-none"
                >
                  <option>Hours</option>
                  <option>Days</option>
                  <option>Weeks</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-5">
                  Pain Level: {formData.painLevel}
                </label>
                <input
                  type="range"
                  name="painLevel"
                  min="1"
                  max="10"
                  value={formData.painLevel}
                  onChange={handleChange}
                  className="w-full range range-accent accent-[#f8b4a3]  range-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload Image (Optional)
              </label>
              <div className="bg-[#ffcbc2] mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[#f47f62] border-dashed rounded-xl">
                <div className="space-y-1 text-center">
                  {formData.imagePreview ? (
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="mx-auto max-h-48 rounded-lg object-cover"
                    />
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-slate-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-slate-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#f47f62] hover:text-[#f47f62] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500">
                          <span className="p-2">Upload a file</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-slate-500">
                        PNG, JPG up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={analyzeWithAI}
              disabled={isLoading}
              className="w-full bg-[#f47f62] hover:bg-[#f09e89] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                "Analyze with AI"
              )}
            </button>
          </div>
        </div>


        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <h3 className="text-2xl font-bold text-slate-800 border-b-2 border-slate-100 pb-4">
            Diagnosis Results
          </h3>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-500 mb-2">
                Diagnosis
                {window.speechSynthesis && (
                  <button
                    onClick={speak}
                    className="ml-2 p-1.5 bg-teal-100 hover:bg-teal-200 rounded-full transition-colors"
                    aria-label={
                      isPlaying ? "Pause speech" : "Listen to diagnosis"
                    }
                  >
                    {isPlaying ? (
                      <svg
                        className="w-4 h-4 text-teal-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 text-teal-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                )}
              </h4>
              <p className="text-lg text-slate-800 font-medium">
                {formData.aiDiagnosis || "No diagnosis yet"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-500 mb-2">
                  Confidence
                </h4>
                <p className="text-lg text-teal-600 font-medium">
                  {formData.confidenceScore || "-"}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-500 mb-2">
                  Risk Level
                </h4>
                <div
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor:
                      formData.riskLevel === "High"
                        ? "#fecaca"
                        : formData.riskLevel === "Moderate"
                        ? "#fde68a"
                        : "#bbf7d0",
                    color:
                      formData.riskLevel === "High"
                        ? "#dc2626"
                        : formData.riskLevel === "Moderate"
                        ? "#d97706"
                        : "#059669",
                  }}
                >
                  {formData.riskLevel || "-"}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-500 mb-2">
                Recommendations
              </h4>
              <p className="text-slate-800 whitespace-pre-wrap">
                {formData.recommendation ||
                  "Submit your symptoms to get recommendations"}
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-500 mb-2">
                Prescription
              </h4>
              <p className="text-slate-800 whitespace-pre-wrap">
                {formData.prescription || "No prescription available yet"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDiagnose;