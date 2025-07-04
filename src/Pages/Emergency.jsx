import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaCamera,
  FaUserCircle,
  FaPhoneAlt,
  FaFirstAid,
  FaHeartbeat,
  FaNotesMedical,
  FaAllergies,
  FaCircleNotch,
} from "react-icons/fa";
import axios from "axios";
import * as faceapi from "face-api.js";

const StaircaseText = ({ text, className = "" }) => {
  const characters = Array.from(text);
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.02 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      clipPath: "inset(0 0 0 0)",
      transition: { type: "tween", ease: "easeOut", duration: 1 },
    },
    hidden: {
      opacity: 0,
      clipPath: "inset(100% 0 0 0)",
      transition: { type: "tween", ease: "easeIn", duration: 1 },
    },
  };

  return (
    <motion.div
      className={className}
      whileInView="visible"
      variants={container}
      initial="hidden"
    >
      {characters.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          variants={child}
          style={{ position: "relative" }}
        >
          <span style={{ visibility: "hidden" }}>{char}</span>
          <motion.span
            style={{
              position: "absolute",
              left: 0,
              fontFamily: "Pixelcraft, sans-serif",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        </motion.span>
      ))}
    </motion.div>
  );
};

const EmergencyPage = () => {
  let [searchName, setSearchName] = useState("");
  const [searchPhoto, setSearchPhoto] = useState(null);
  const [error, setError] = useState(null);
  const [randomDoctorNote, setRandomDoctorNote] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("name");
  const [previewImage, setPreviewImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessingFace, setIsProcessingFace] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const intervalRef = useRef(null);

  const doctorNotes = [
    "Patient experiencing increasing frequency of migraine headaches. Trigger appears to be stress-related",
    "Referred to cardiologist for follow-up on arrhythmia. Patient should avoid strenuous activity until cleared.",
    "Fatigue and shortness of breath with exertion persisting. Starting iron supplementation",
    "Patient reports intermittent chest pain. ECG shows normal sinus rhythm.",
    "Advised patient on proper diet and exercise program. Follow up in 3 months to reassess cholesterol levels.",
    "Referred to neurologist for evaluation of recurring migraines. Patient should avoid bright screens until symptoms improve.",
  ];

  // Load face detection models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading face models:", error);
        setError("Failed to initialize face recognition");
      }
    };
    loadModels();
  }, []);

  // Start/stop webcam and face detection
  useEffect(() => {
    if (showCamera && modelsLoaded) {
      startWebcam();
      setupFaceDetection();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopWebcam();
    };
  }, [showCamera, modelsLoaded]);

  // Set random doctor note when results change
  useEffect(() => {
    if (searchResults) {
      const randomIndex = Math.floor(Math.random() * doctorNotes.length);
      setRandomDoctorNote(doctorNotes[randomIndex]);
    }
  }, [searchResults]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Webcam error:", err);
      setError("Could not access webcam. Please check permissions.");
    }
  };

  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  const setupFaceDetection = () => {
    intervalRef.current = setInterval(async () => {
      if (
        videoRef.current &&
        canvasRef.current &&
        videoRef.current.readyState === 4
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Detect faces
        const detections = await faceapi
          .detectAllFaces(video)
          .withFaceLandmarks()
          .withFaceDescriptors();

        // Draw detections
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detections.length > 0) {
          const resizedDetections = faceapi.resizeResults(detections, {
            width: video.videoWidth,
            height: video.videoHeight,
          });
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }

        setFaceDetected(detections.length > 0);
      }
    }, 100);
  };

  const handleCameraCapture = async () => {
    if (!faceDetected) {
      setError("No face detected. Please position your face properly.");
      return;
    }

    setLoading(true);
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      // Flip image horizontally for a more natural preview
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageSrc = canvas.toDataURL("image/jpeg");
      setPreviewImage(imageSrc);
      setShowCamera(false);
      await handleFaceSearch(imageSrc);
    } catch (err) {
      console.error("Capture error:", err);
      setError("Error capturing image");
    } finally {
      setLoading(false);
    }
  };

  // Fetch labeled descriptors from the backend
  const fetchLabeledDescriptors = async () => {
    try {
      const response = await axios.get(
        "https://backend-g51b.onrender.com/api/patient/labeled-descriptors"
      );

      console.log("Fetched labeled descriptors:", response.data);
      // Use the correct property 'faceDescriptor' and filter out invalid entries
      const labeledDescriptors = response.data
        .filter((patient) => {
          // Only include patients with a non-empty faceDescriptor array of expected length (e.g., 128)
          if (
            Array.isArray(patient.faceDescriptor) &&
            patient.faceDescriptor.length === 128
          ) {
            return true;
          } else {
            console.warn(
              `Skipping patient ${patient.label} due to invalid descriptor length:`,
              patient.faceDescriptor.length
            );
            return false;
          }
        })
        .map((patient) => {
          const floatDescriptor = new Float32Array(patient.faceDescriptor);
          console.log(
            `Patient: ${patient.label}, converted descriptor length: ${floatDescriptor.length}`
          );
          return new faceapi.LabeledFaceDescriptors(patient.label, [
            floatDescriptor,
          ]);
        });

      console.log("Valid labeled descriptors:", labeledDescriptors);
      return labeledDescriptors;
    } catch (err) {
      console.error("Error fetching labeled descriptors:", err);
      setError("Failed to load reference patient data");
      return [];
    }
  };

  const handleSearchByName = async () => {
    if (!searchName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `https://backend-g51b.onrender.com/api/patient/getpatient`,
        { name: searchName },
        { headers: { "Content-Type": "application/json" } }
      );
      setSearchResults(response.data);
    } catch (err) {
      console.error("Search error:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred while searching for the patient"
      );
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };
  const handleFaceSearch = async (imageSrc) => {
    setLoading(true);
    setIsProcessingFace(true);
    setError(null);

    try {
      const img = await faceapi.fetchImage(imageSrc);
      const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        throw new Error("No face detected in the captured image");
      }

      // Debug: Log detected descriptor length
      console.log("Detected descriptor length:", detection.descriptor.length);

      // Fetch the labeled descriptors from the backend
      const labeledDescriptors = await fetchLabeledDescriptors();
      if (!labeledDescriptors.length) {
        throw new Error("No reference patient data available");
      }

      // Debug: Log the first labeled descriptor length for comparison
      console.log(
        "First labeled descriptor length:",
        labeledDescriptors[0].descriptors[0].length
      );

      // Check if lengths match
      if (
        detection.descriptor.length !==
        labeledDescriptors[0].descriptors[0].length
      ) {
        console.error("Descriptor length mismatch:", {
          detected: detection.descriptor.length,
          labeled: labeledDescriptors[0].descriptors[0].length,
        });
        throw new Error("Face descriptor length mismatch");
      }

      // Initialize FaceMatcher with a threshold (0.6 is common)
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
      const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

      if (bestMatch.label === "unknown") {
        throw new Error("No matching patient found");
      }

      searchName = bestMatch.label;
      handleSearchByName();

      // setSearchResults({
      //   name: bestMatch.label,
      //   date_of_birth: "1990-01-01", // Example DOB; replace with actual field from your data
      //   gender: "N/A", // Replace with actual field
      //   blood_group: "N/A", // Replace with actual field
      //   emergency_contact: "N/A", // Replace with actual field
      //   medicalHistory: "N/A", // Replace with actual field
      //   matchConfidence: 1 - Math.min(bestMatch.distance, 1),
      // });
    } catch (err) {
      console.error("Face search error:", err);
      setError(err.message || "Face recognition failed");
      setSearchResults(null);
    } finally {
      setLoading(false);
      setIsProcessingFace(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        setPreviewImage(e.target.result);
        await handleFaceSearch(e.target.result);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("File processing error:", err);
      setError("Error processing uploaded image");
    }
  };

  const handleCameraCancel = () => {
    setShowCamera(false);
    setPreviewImage(null);
  };

  const calculateAge = (dobString) => {
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const extractFirstFourWords = (inputText) => {
    if (!inputText) return "No medical history available";
    const match = inputText.match(
      /\*\*Diagnosis Highlights:\*\*(.*?)(?=\d+\.\s+\*\*|$)/s
    );
    if (match) {
      return match[1]
        .trim()
        .replace(/^\s*-\s+/, "")
        .split(/\s+/)
        .slice(0, 4)
        .join(" ");
    }
    return "Diagnosis highlights not found";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdd5c9] to-[#fcdcd3] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <StaircaseText
            text="EMERGENCY ACCESS"
            className="font-bold text-[#c94a4a] text-6xl mb-2"
          />
          <p className="text-gray-700 mt-4 text-xl">
            Quick access to patient information in emergency situations
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-[#c94a4a] p-4 mb-8 rounded-lg shadow-md"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaFirstAid className="h-6 w-6 text-[#c94a4a]" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-[#c94a4a]">
                Emergency Information Only
              </h3>
              <p className="mt-1 text-gray-700">
                This page is designed for emergency medical personnel only.
                Information accessed here should be used solely for providing
                emergency medical care.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="bg-white rounded-t-xl shadow-md overflow-hidden">
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === "name"
                  ? "border-b-2 border-[#c94a4a] text-[#c94a4a]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("name")}
            >
              <FaSearch className="inline mr-2" />
              Search by Name
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === "photo"
                  ? "border-b-2 border-[#c94a4a] text-[#c94a4a]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setActiveTab("photo");
                setShowCamera(false);
              }}
            >
              <FaCamera className="inline mr-2" />
              Search by Photo
            </button>
          </div>

          <div className="p-6">
            {activeTab === "name" ? (
              <div className="space-y-4">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Enter patient's full name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="flex-1 p-4 border border-gray-300 rounded-l-xl shadow-sm focus:ring-2 focus:ring-[#c94a4a] focus:border-[#c94a4a] focus:outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSearchByName}
                    disabled={loading || !searchName.trim()}
                    className={`px-6 py-4 bg-gradient-to-r from-[#c94a4a] to-[#d86e6e] text-white font-medium rounded-r-xl flex items-center ${
                      loading || !searchName.trim()
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {loading ? "Searching..." : "Search"}
                  </motion.button>
                </div>
                <p className="text-sm text-gray-500">
                  Enter the patient's full name as it appears on their ID or
                  medical records.
                </p>
              </div>
            ) : (
              <div className="h-auto">
                {showCamera ? (
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="h-full w-full"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 pointer-events-none"
                      style={{ transform: "scaleX(-1)" }}
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCameraCapture}
                        disabled={!faceDetected || loading}
                        className={`px-6 py-2 rounded-lg flex items-center ${
                          faceDetected && !loading
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {loading ? (
                          <>
                            <FaCircleNotch className="animate-spin mr-2" />
                            Processing...
                          </>
                        ) : faceDetected ? (
                          "Capture"
                        ) : (
                          "No Face Detected"
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCameraCancel}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Cancel
                      </motion.button>
                    </div>
                    {faceDetected && (
                      <div className="absolute top-2 left-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        Face detected ✓
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    {previewImage ? (
                      <div className="relative">
                        <img
                          src={previewImage}
                          alt="Patient"
                          className="h-72 mx-auto object-cover rounded-lg shadow-md"
                        />
                        <button
                          onClick={() => {
                            setPreviewImage(null);
                            setSearchPhoto(null);
                          }}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 shadow-md"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <>
                        <FaCamera className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-3 text-gray-600">
                          Take a photo of the patient or upload an existing one
                        </p>
                        <div className="flex justify-center mt-4 space-x-4">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowCamera(true)}
                            className="px-6 py-3 bg-gradient-to-r from-[#c94a4a] to-[#d86e6e] text-white font-medium rounded-lg flex items-center"
                          >
                            <FaCamera className="mr-2" /> Use Camera
                          </motion.button>
                          <motion.label
                            htmlFor="photo-upload"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg cursor-pointer flex items-center"
                          >
                            <svg
                              className="mr-2"
                              fill="currentColor"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                              height="1em"
                              width="1em"
                            >
                              <path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6h96 32H424c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z" />
                            </svg>
                            Upload Photo
                          </motion.label>
                          <input
                            type="file"
                            id="photo-upload"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {previewImage && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleFaceSearch(previewImage)}
                    disabled={loading}
                    className={`w-full mt-4 px-6 py-4 bg-gradient-to-r from-[#c94a4a] to-[#d86e6e] text-white font-medium rounded-xl flex items-center justify-center ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? (
                      <>
                        <FaCircleNotch className="animate-spin mr-2" />
                        Searching...
                      </>
                    ) : (
                      "Search by Photo"
                    )}
                  </motion.button>
                )}
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>

        {searchResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#c94a4a] to-[#d86e6e] px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <FaUserCircle className="mr-2" />
                  Patient Information
                </h3>
                {searchResults.matchConfidence && (
                  <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    Match Confidence:{" "}
                    {Math.round(searchResults.matchConfidence * 100)}%
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-rose-50 p-5 rounded-xl shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaUserCircle className="mr-2 text-[#c94a4a]" />
                    Basic Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{searchResults.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">
                        {calculateAge(searchResults.date_of_birth)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-medium">
                        {searchResults.gender}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blood Type:</span>
                      <span className="font-medium">
                        {searchResults.blood_group}
                      </span>
                    </div>
                    <div className="flex items-center pt-2">
                      <FaPhoneAlt className="text-[#c94a4a] mr-2" />
                      <span className="text-gray-700">Emergency Contact:</span>
                    </div>
                    <div className="text-center font-medium py-1 bg-white rounded-lg shadow-sm">
                      {searchResults.emergency_contact}
                    </div>
                  </div>
                </div>

                <div className="bg-rose-50 p-5 rounded-xl shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaHeartbeat className="mr-2 text-[#c94a4a]" />
                    Medical Information
                  </h4>
                  <div className="mb-4">
                    <h5 className="text-md font-medium text-gray-700 mb-2 flex items-center">
                      <FaAllergies className="mr-2 text-[#c94a4a]" />
                      Allergies
                    </h5>
                    <div className="space-y-1">
                      {searchResults.allergies &&
                      searchResults.allergies.length > 0 ? (
                        searchResults.allergies.map((allergy, index) => (
                          <div
                            key={index}
                            className="py-1 px-3 bg-white rounded-lg shadow-sm"
                          >
                            {allergy}
                          </div>
                        ))
                      ) : (
                        <div className="py-1 px-3 bg-white rounded-lg shadow-sm text-gray-500">
                          No known allergies
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-md font-medium text-gray-700 mb-2">
                      Medical Conditions
                    </h5>
                    <div className="space-y-1">
                      {searchResults.medicalHistory ? (
                        <div className="py-1 px-3 bg-white rounded-lg shadow-sm">
                          {extractFirstFourWords(searchResults.medicalHistory)}
                        </div>
                      ) : (
                        <div className="py-1 px-3 bg-white rounded-lg shadow-sm text-gray-500">
                          No known medical conditions
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-rose-50 p-5 rounded-xl shadow-sm">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <FaNotesMedical className="mr-2 text-[#c94a4a]" />
                  Doctor's Notes
                </h4>
                {searchResults.medicalHistory ? (
                  <p className="bg-white p-3 rounded-lg shadow-sm">
                    {randomDoctorNote}
                  </p>
                ) : (
                  <p className="bg-white p-3 rounded-lg shadow-sm">
                    No doctor's notes available.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EmergencyPage;

const FaPrinter = ({ className }) => (
  <svg
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    height="1em"
    width="1em"
  >
    <path d="M128 0C92.7 0 64 28.7 64 64v96h64V64H354.7L384 93.3V160h64V93.3c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0H128zM384 352v32 64H128V384 352H384zm64 32h32c17.7 0 32-14.3 32-32V256c0-35.3-28.7-64-64-64H64c-35.3 0-64 28.7-64 64v96c0 17.7 14.3 32 32 32H64v64c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V384zm-16-88c-13.3 0-24-10.7-24-24s10.7-24 24-24s24 10.7 24 24s-10.7 24-24 24z" />
  </svg>
);
