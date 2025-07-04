import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import patient from "../assets/patient.webp";
import doctor from "../assets/doctor.avif";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

export default function Signup() {
  const [userType, setUserType] = useState("patient");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    date_of_birth: "",
    gender: "",
    speciality: "",
    licenseNumber: "",
    emergency_contact: "",
    faceDescriptor: null,
    address: "",
    blood_group: "",
    allergies: [],
    medicalHistory: [],
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const transition = { type: "spring", stiffness: 120, damping: 15 };

  // Face API states
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detections, setDetections] = useState([]);
  const [faceDetected, setFaceDetected] = useState(false);

  // References
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  // Load face-api.js models on component mount
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = `/models`;

      try {
        toast.loading("Loading face detection models...");
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        toast.dismiss();
        toast.success("Face detection models loaded");
        setModelsLoaded(true);
      } catch (error) {
        toast.dismiss();
        toast.error("Failed to load face detection models");
        console.error("Error loading face detection models:", error);
      }
    };

    loadModels();

    // Cleanup function to remove intervals when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle webcam stream when ready
  const handleVideoOnPlay = useCallback(() => {
    if (!modelsLoaded || !webcamRef.current || !canvasRef.current) return;

    // Start continuous face detection
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      if (webcamRef.current && webcamRef.current.video.readyState === 4) {
        // Get video dimensions
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;

        // Set canvas dimensions to match video
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        // Detect faces
        const detectedFaces = await faceapi
          .detectAllFaces(webcamRef.current.video)
          .withFaceLandmarks()
          .withFaceDescriptors();

        // Draw results on canvas
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, videoWidth, videoHeight);

        if (detectedFaces.length > 0) {
          // Draw detections on canvas
          const displaySize = { width: videoWidth, height: videoHeight };
          const resizedDetections = faceapi.resizeResults(
            detectedFaces,
            displaySize
          );

          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);

          setDetections(detectedFaces);
          setFaceDetected(true);
        } else {
          setFaceDetected(false);
        }
      }
    }, 100);
  }, [modelsLoaded]);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle user signup
  const handleSignup = async (e) => {
    e.preventDefault();

    // For patient signup, ensure face descriptor is present
    if (userType === "patient" && !formData.faceDescriptor) {
      toast.error("Please process your face for recognition before signing up");
      return;
    }

    const endpoint =
      userType === "patient"
        ? "https://backend-g51b.onrender.com/api/auth/registerpatient"
        : "https://backend-g51b.onrender.com/api/auth/registerdoctor";

    try {
      const response = await axios.post(endpoint, formData);
      console.log("Signup Successful:", response.data);
      toast.success("Signup successful!");
      navigate("/login");
    } catch (err) {
      toast.error("Signup Failed");
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  // Capture face data
  const captureAndProcessFace = useCallback(async () => {
    if (!modelsLoaded) {
      toast.error("Face recognition models are still loading");
      return;
    }

    if (!webcamRef.current || !webcamRef.current.video) {
      toast.error("Webcam is not available");
      return;
    }

    if (!faceDetected) {
      toast.error("No face detected. Please ensure your face is visible");
      return;
    }

    try {
      setIsProcessing(true);
      toast.loading("Processing face...");

      // Get the best detection (assuming the first one is the best if multiple)
      const bestDetection = detections[0];

      // Convert Float32Array descriptor to regular array for storage
      const faceDescriptorArray = Array.from(bestDetection.descriptor);

      console.log("Face Descriptor:", faceDescriptorArray);
      // Store face descriptor in form data
      setFormData((prev) => ({
        ...prev,
        faceDescriptor: faceDescriptorArray,
      }));

      // Take a clear snapshot for visual feedback
      const video = webcamRef.current.video;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw detection on the snapshot
      const displaySize = { width: canvas.width, height: canvas.height };
      const resizedDetections = faceapi.resizeResults(
        [bestDetection],
        displaySize
      );
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

      // Show the processed result in the canvas
      const resultCanvas = canvasRef.current;
      const resultCtx = resultCanvas.getContext("2d");
      resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
      resultCtx.drawImage(
        canvas,
        0,
        0,
        resultCanvas.width,
        resultCanvas.height
      );

      toast.dismiss();
      toast.success("Face processed successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Error processing face");
      console.error("Face processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [detections, faceDetected, modelsLoaded]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#ffcbc2] to-[#FFFFFF] p-6">
      <div className="bg-gradient-to-b from-[#fac9c0] to-[#FFFFFF] shadow-xl rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 max-w-4xl w-full">
        <motion.div
          initial={false}
          animate={{ x: userType === "patient" ? 0 : -20, opacity: 1 }}
          transition={transition}
          className={`flex-1 pl-10 ${
            userType === "patient" ? "order-first" : "order-last"
          }`}
        >
          <img src={userType === "patient" ? patient : doctor} alt="Signup" />
        </motion.div>

        <motion.div
          initial={false}
          animate={{ x: userType === "patient" ? 0 : 20, opacity: 1 }}
          transition={transition}
          className="flex-1 max-w-md w-full"
        >
          <div className="flex justify-center gap-4 mb-6">
            <div className="relative flex bg-gray-200 rounded-full p-1">
              <button
                onClick={() => {
                  setUserType("doctor");
                  setStep(1);
                }}
                className="relative px-6 py-2 rounded-full text-gray-700 z-10 cursor-pointer"
              >
                Doctor
              </button>
              <button
                onClick={() => setUserType("patient")}
                className="relative px-6 py-2 rounded-full text-gray-700 z-10 cursor-pointer"
              >
                Patient
              </button>
              <motion.div
                layoutId="activeButton"
                className="absolute top-0 bottom-0 w-1/2 bg-[#FAAB98] rounded-full"
                initial={false}
                animate={{ left: userType === "doctor" ? "0%" : "50%" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            </div>
          </div>

          {step === 1 && (
            <motion.form
              onSubmit={(e) => {
                e.preventDefault();
                userType === "patient" ? setStep(2) : handleSignup(e);
              }}
              initial={false}
              animate={{ x: 0, opacity: 1 }}
              transition={transition}
              className="bg-gradient-to-b from-[#fbd8cf] to-[#FFFFFF] p-6 rounded-lg shadow-lg shadow-gray-400"
            >
              <h2 className="text-2xl font-bold mb-4 text-center">
                {userType === "patient"
                  ? "Patient Registration"
                  : "Doctor Registration"}
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg bg-[#e0c7c1]"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg bg-[#e0c7c1]"
                  required
                />
                <input
                  type="text"
                  name="phone_number"
                  placeholder="Phone Number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg bg-[#e0c7c1]"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg bg-[#e0c7c1]"
                  required
                />

                {userType === "patient" ? (
                  <>
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          onPlay={handleVideoOnPlay}
                          className="w-full h-48 border rounded-lg object-cover"
                          mirrored={true}
                        />
                        <canvas
                          ref={canvasRef}
                          className="absolute top-0 left-0 w-full h-48 rounded-lg"
                        />
                      </div>

                      {faceDetected ? (
                        <div className="text-green-500 text-sm font-semibold">
                          Face detected! You can now process your face.
                        </div>
                      ) : (
                        <div className="text-yellow-500 text-sm font-semibold">
                          Please position your face in the frame.
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={captureAndProcessFace}
                        disabled={isProcessing || !faceDetected}
                        className={`px-4 py-2 rounded-md font-medium ${
                          isProcessing || !faceDetected
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                        } text-white transition`}
                      >
                        {isProcessing ? "Processing..." : "Process Face"}
                      </button>

                      {formData.faceDescriptor && (
                        <div className="mt-2 p-2 bg-green-100 border border-green-500 rounded-lg text-sm text-green-700">
                          Face successfully processed ✓
                        </div>
                      )}
                    </div>

                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg bg-[#e0c7c1]"
                      required
                    />
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg bg-[#e0c7c1]"
                      required
                    >
                      <option value="" disabled>
                        Select Gender
                      </option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </>
                ) : (
                  <>
                    <select
                      name="speciality"
                      value={formData.speciality}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg bg-[#e0c7c1]"
                      required
                    >
                      <option value="" disabled>
                        Select your Speciality
                      </option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Orthopedic">Orthopedic</option>
                      <option value="Gastroenterologist">
                        Gastroenterologist
                      </option>
                      <option value="Pulmonologist">Pulmonologist</option>
                      <option value="Endocrinologist">Endocrinologist</option>
                      <option value="Oncologist">Oncologist</option>
                      <option value="Psychiatrist">Psychiatrist</option>
                      <option value="Ophthalmologist">Ophthalmologist</option>
                    </select>
                    <input
                      type="text"
                      name="licenseNumber"
                      placeholder="License Number"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg bg-[#e0c7c1]"
                      required
                    />
                  </>
                )}
              </div>
              {userType === "patient" ? (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.faceDescriptor) {
                        toast.error(
                          "Please process your face before continuing"
                        );
                        return;
                      }
                      setStep(2);
                    }}
                    className="mt-6 w-full bg-[#FAAB98] text-black py-2 rounded-lg font-bold hover:bg-[#f47f62] transition"
                  >
                    Next
                  </button>
                  <p className="text-center text-gray-600 mt-4 text-sm">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="text-[#FAAB98] font-bold cursor-pointer hover:underline hover:text-[#f47f62]"
                    >
                      Login
                    </button>
                  </p>
                </div>
              ) : (
                <div>
                  <button
                    type="submit"
                    className="mt-6 w-full bg-[#FAAB98] text-black py-2 rounded-lg font-bold hover:bg-[#f47f62] transition"
                  >
                    Sign Up
                  </button>
                  <p className="text-center text-gray-600 mt-4 text-sm">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="text-[#FAAB98] font-bold cursor-pointer hover:underline hover:text-[#f47f62]"
                    >
                      Login
                    </button>
                  </p>
                </div>
              )}
            </motion.form>
          )}

          {step === 2 && userType === "patient" && (
            <motion.form
              onSubmit={handleSignup}
              initial={false}
              animate={{ x: 0, opacity: 1 }}
              transition={transition}
              className="bg-gradient-to-b from-[#fbd8cf] to-[#FFFFFF] p-6 rounded-lg shadow-lg shadow-gray-400"
            >
              <h2 className="text-2xl font-bold mb-4 text-center">
                Additional Medical Details
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  name="emergency_contact"
                  placeholder="Emergency Contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg bg-[#e0c7c1]"
                  required
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg bg-[#e0c7c1]"
                  required
                />
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg bg-[#e0c7c1]"
                  required
                >
                  <option value="" disabled>
                    Select Blood Group
                  </option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-6 w-full bg-[#FAAB98] text-black py-2 rounded-lg font-bold hover:bg-[#f47f62] transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="mt-6 w-full bg-[#FAAB98] text-black py-2 rounded-lg font-bold hover:bg-[#f47f62] transition"
              >
                Sign Up
              </button>
            </motion.form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
