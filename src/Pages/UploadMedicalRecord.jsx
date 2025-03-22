import React, { useState } from "react";
import axios from "axios";
import Tesseract from "tesseract.js";
import toast from "react-hot-toast";

const UploadMedicalRecord = () => {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [prescriptions, setPrescriptions] = useState([""]);
  const [summary, setSummary] = useState({
    patient: "",
    doctor: [],
  });
  const [loading, setLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  const API_KEY = "AIzaSyA_hb7cq8vwzBx8qDVQVihCPDc1RDZ1Zho";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${API_KEY}`;

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type.startsWith("image/")) {
      setFile(uploadedFile);
      setFilePreview(URL.createObjectURL(uploadedFile));
    }
  };

  const handlePrescriptionChange = (index, value) => {
    const newPrescriptions = [...prescriptions];
    newPrescriptions[index] = value;
    setPrescriptions(newPrescriptions);
  };

  const addPrescriptionField = () => {
    setPrescriptions([...prescriptions, ""]);
  };

  const handleSummarize = async () => {
    if (!file && prescriptions.every((p) => p.trim() === "")) {
      alert("Please upload a medical record or enter prescriptions.");
      return;
    }

    setLoading(true);
    let extractedText = "";

    try {
      if (file) {
        const {
          data: { text },
        } = await Tesseract.recognize(file, "eng", {
          logger: (m) => {
            if (m.status === "recognizing text") {
              setOcrProgress(Math.round(m.progress * 100));
            }
          },
        });
        extractedText = text;
      }

      const prompt = `
      Analyze this medical information and create two separate summaries:

      MEDICAL RECORD:
      ${extractedText || "No medical record provided"}

      CURRENT PRESCRIPTIONS:
      ${prescriptions.filter((p) => p.trim()).join("\n") || "None"}

      === PATIENT SUMMARY ===
      [Use simple English (10th grade level)]
      - Health status in 1-2 sentences
      - Main issues in plain language
      - Key daily care instructions
      - Current Medidines information
      - Medicine used for what
      - Medication guidance
      - Warning signs to watch
      - Friendly, reassuring tone

      === DOCTOR'S ANALYSIS ===
      1. Diagnosis Highlights:
      - List confirmed diagnoses
      - Severity assessment
      - Underlying causes
      
      2. Prescription Review:
      - Current medication conflicts
      - Contraindicated drugs
      - Side effect risks
      - Dosage adjustments needed
      
      3. Management Plan:
      - Recommended tests
      - Alternative therapies
      - Monitoring parameters
      - Long-term strategies
      
      Format response EXACTLY as:
      **Patient Summary**
      [content]
      
      **Doctor's Analysis**
      [content]`;

      const response = await axios.post(API_URL, {
        contents: [{ parts: [{ text: prompt }] }],
      });

      const rawText =
        response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      formatSummary(rawText);
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to process request. Please try again.");
    } finally {
      setLoading(false);
      setOcrProgress(0);
    }
  };

  const formatSummary = (rawText) => {
    try {
      const patientSection = rawText
        .split("**Patient Summary**")[1]
        ?.split("**Doctor's Analysis**")[0]
        ?.trim();

      const doctorContent = rawText.split("**Doctor's Analysis**")[1]?.trim();
      console.log(doctorContent);
      async function sendDoctorContentToBackend() {
        try {
          const response = await axios.post(
            `http://localhost:3000/api/patient/setmedicalrecord`,
            {
              medicalHistory: doctorContent,
            },
            {
              withCredentials: true,
            }
          );

          toast.success("Medical history updated successfully!");
        } catch (error) {
          if (error.response) {
            console.error(
              "Error updating medical history:",
              error.response.data.message
            );
          } else if (error.request) {
            console.error("No response received:", error.request);
          } else {
            toast.error("Error:", error.message);
          }
        }
      }

      sendDoctorContentToBackend();

      const doctorSections = doctorContent.split(/\d+\.\s+/).slice(1);

      const formattedDoctor = doctorSections.map((section) => {
        const [titlePart, ...contentParts] = section.split(":");
        return {
          title: titlePart?.trim()?.replace(":", "") || "Section",
          content: contentParts.join(":").trim(),
        };
      });
      setPatientkisummary(patientSection);
      setSummary({
        patient: patientSection || "No patient summary available",
        doctor: formattedDoctor || [],
      });
    } catch (error) {
      console.error("Formatting error:", error);
      setSummary({
        patient: "Error formatting summary",
        doctor: [],
      });
    }
  };

  const clearForm = () => {
    setFile(null);
    setFilePreview(null);
    setPrescriptions([""]);
    setSummary({ patient: "", doctor: [] });
  };

  const [translatedPatientSummary, setTranslatedPatientSummary] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [patientkisummary, setPatientkisummary] = useState("");
  const handleTranslate = async (language) => {
    if (!summary.patient) {
      toast.error("No patient summary to translate");
      return;
    }

    try {
      setIsTranslating(true);
      setSelectedLanguage(language);
      setShowLanguageDropdown(false);

      const prompt = `Translate this medical summary to ${language} while keeping medical terms accurate. Maintain the original structure and formatting:\n\n${patientkisummary}`;

      const response = await axios.post(API_URL, {
        contents: [{ parts: [{ text: prompt }] }],
      });

      const translatedText =
        response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      setTranslatedPatientSummary(translatedText);
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-b from-[#ffcbc2] via-[#ffcbc2] to-[#FFFFFF]">
      <div className="flex max-w-6xl mx-auto  bg-white shadow-xl rounded-xl p-6">
        <div className="w-1/2 pr-6 border-r-2 border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-[#c94a4a]">
            Medical Record Analyzer
          </h2>

          <div className="mb-8">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Upload Medical Document (Image)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded-lg file:mr-4 file:py-2 file:px-4 cursor-pointer
                     file:rounded-lg file:border-0 file:text-sm file:font-semibold
                     file:bg-[#ffcbc2] file:text-[#c94a4a] hover:file:bg-[#ffcbc2]"
            />
            {filePreview && (
              <div className="mt-4 border rounded-lg overflow-hidden">
                <img
                  src={filePreview}
                  alt="Medical document preview"
                  className="w-full h-48 object-contain bg-gray-50 p-2"
                />
              </div>
            )}
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Current Medications
            </label>
            {prescriptions.map((prescription, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={`Medication ${index + 1}`}
                  value={prescription}
                  onChange={(e) =>
                    handlePrescriptionChange(index, e.target.value)
                  }
                />
              </div>
            ))}
            <button
              onClick={addPrescriptionField}
              className="text-[blue-600] hover:text-blue-800 text-sm mt-2 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Medication
            </button>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="bg-[#c94a4a] text-white px-6 py-3 rounded-lg hover:bg-[#e28484] 
                     disabled:bg-gray-400 flex-1 transition-colors flex items-center justify-center cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {ocrProgress > 0
                    ? `Processing Image (${ocrProgress}%)`
                    : "Analyzing..."}
                </div>
              ) : (
                "Summarise and Annalise "
              )}
            </button>
            <button
              onClick={clearForm}
              className="bg-gray-100 px-4 py-3 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="w-1/2 pl-6">
          <h3 className="text-2xl font-bold mb-6 text-[#c94a4a]">
            Analysis Results
          </h3>

          <div className="mb-8 bg-[#ffcbc2] rounded-xl p-5 shadow-inner">
            <div className="flex items-center gap-2 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#c94a4a]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <h4 className="text-lg font-semibold text-[#c94a4a]">
                Patient Summary
              </h4>
            </div>
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {summary.patient || "Patient summary will appear here..."}
            </div>
            <div className="mt-4">
              <div className="relative inline-block">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  disabled={!summary.patient}
                  className="bg-[#fed7d0] text-[#c94a4a] font-bold px-4 py-2 rounded-lg hover:bg-[#fb9d8c] 
                 flex items-center gap-2 text-sm disabled:opacity-50 border-[#c94a4a] border"
                >
                  {isTranslating ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                      ></svg>
                      Translating...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        />
                      </svg>
                      Translate Summary
                    </>
                  )}
                </button>

                {showLanguageDropdown && (
                  <div className="absolute z-10 mt-2 w-48 bg-white rounded-lg shadow-xl border">
                    <button
                      onClick={() => handleTranslate("Hindi")}
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 text-left"
                    >
                      हिन्दी (Hindi)
                    </button>
                    <button
                      onClick={() => handleTranslate("Gujarati")}
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 text-left"
                    >
                      ગુજરાતી (Gujarati)
                    </button>
                  </div>
                )}
              </div>

              {translatedPatientSummary && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      Translated to {selectedLanguage}
                    </span>
                    <button
                      onClick={() => setTranslatedPatientSummary("")}
                      className="text-[#c94a4a] hover:text-[#d66666] text-sm"
                    >
                      Show Original
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap text-gray-800">
                    {translatedPatientSummary}
                  </div>
                </div>
              )}
            </div>
            {/* // Update the Patient Summary display to: */}
            {/* <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {translatedPatientSummary ||
                summary.patient ||
                "Patient summary will appear here..."}
            </div> */}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-5 shadow-inner border border-gray-200 m-6">
        <div className="flex items-center gap-2 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-[#c94a4a]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <h4 className="text-lg font-semibold text-[#c94a4a]">
            Clinical Analysis
          </h4>
        </div>

        {summary.doctor.length > 0 ? (
          <div className="space-y-8">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
              <h5 className="font-medium text-blue-800 mb-3">
                {summary.doctor[0]?.title || "Diagnosis Overview"}
              </h5>
              <div className="whitespace-pre-wrap text-gray-800 text-sm">
                {summary.doctor[0]?.content}
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
              <h5 className="font-medium text-yellow-800 mb-3">
                {summary.doctor[1]?.title || "Medication Analysis"}
              </h5>
              <div className="whitespace-pre-wrap text-gray-800 text-sm">
                {summary.doctor[1]?.content}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
              <h5 className="font-medium text-green-800 mb-3">
                {summary.doctor[2]?.title || "Care Strategy"}
              </h5>
              <div className="whitespace-pre-wrap text-gray-800 text-sm">
                {summary.doctor[2]?.content}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 italic">
            Doctor's analysis will appear here...
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadMedicalRecord;
