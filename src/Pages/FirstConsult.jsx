import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaUserMd, FaPaperPlane } from "react-icons/fa";
import { motion } from "framer-motion";

const StaircaseText = ({ text, className = "" }) => {
  const characters = Array.from(text);
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.02 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      clipPath: "inset(0 0 0 0)",
      transition: { type: "tween", ease: "easeOut", duration: 0.8 },
    },
    hidden: {
      opacity: 0,
      clipPath: "inset(100% 0 0 0)",
      transition: { type: "tween", ease: "easeIn", duration: 0.8 },
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

const FirstConsult = () => {
  const location = useLocation();
  const doctor = location.state?.doctor;
  const [symptoms, setSymptoms] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendReport = async () => {
    if (!symptoms.trim()) {
      toast.error("Please enter symptoms before sending the report.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        "https://backend-g51b.onrender.com/api/report/setFirstReport",
        {
          doctorId: doctor._id,
          symptoms,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Report Sent:", response.data);
      toast.success("Report sent successfully!");
      setSymptoms("");
    } catch (error) {
      console.error(
        "Error sending report:",
        error.response?.data || error.message
      );
      toast.error("Failed to send report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!doctor) {
    return (
      <div
        style={{ fontFamily: "Barlow, sans-serif" }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdd5c9] to-[#fcdcd3]"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-xl shadow-lg border-2 border-[#ffffff]"
        >
          <p className="text-[#c94a4a] text-center text-lg font-medium">
            No doctor selected. Please go back and select a doctor.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      style={{ fontFamily: "Barlow, sans-serif" }}
      className="min-h-screen bg-gradient-to-br from-[#fdd5c9] to-[#fcdcd3] py-12 px-4 sm:px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-[#ffffff]"
      >
        <div className="bg-gradient-to-r from-[#c94a4a] to-[#d86e6e] py-6 px-8">
          <div className="flex items-center">
            <FaUserMd className="text-white text-3xl mr-3" />
            <StaircaseText
              text="MEDICAL CONSULTATION"
              className="text-2xl font-bold text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          <div className="col-span-1 p-6 bg-rose-50">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-[#c94a4a] to-[#d86e6e] rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-md">
                {doctor.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Dr. {doctor.name}
              </h2>
              <p className="text-[#c94a4a] font-medium mt-1">
                {doctor.speciality}
              </p>
            </div>

            <motion.div
              whileHover={{ boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
              transition={{ duration: 0.3 }}
              className="space-y-3 bg-white p-4 rounded-lg shadow-sm"
            >
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">License No.</span>
                <span className="font-medium text-gray-800">
                  {doctor.licenseNumber}
                </span>
              </div>
              {doctor.hospitalId && (
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Hospital ID</span>
                  <span className="font-medium text-gray-800">
                    {doctor.hospitalId}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-800 break-all">
                  {doctor.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contact</span>
                <span className="font-medium text-gray-800">
                  {doctor.phone_number}
                </span>
              </div>
            </motion.div>
          </div>

          <div className="col-span-2 p-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Describe Your Symptoms
            </h2>
            <div className="mb-6">
              <label
                htmlFor="symptoms"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Please provide detailed information about your symptoms
              </label>
              <textarea
                id="symptoms"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c94a4a] focus:border-[#c94a4a] min-h-[200px] transition duration-200 shadow-sm"
                placeholder="Describe when your symptoms started, their severity, any triggers, and how they affect your daily activities..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              ></textarea>
              <p className="mt-2 text-sm text-gray-500">
                Your information will be shared securely with Dr. {doctor.name}.
              </p>
            </div>
            <div className="flex justify-end">
              <motion.button
                onClick={handleSendReport}
                disabled={isSubmitting}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`px-6 py-3 rounded-lg text-white font-medium transition duration-300 flex items-center ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#c94a4a] to-[#d86e6e] hover:shadow-lg shadow-md"
                }`}
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    Send Report
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FirstConsult;
