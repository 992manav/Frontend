import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaUserMd, FaSearch } from "react-icons/fa";

const API_KEY = "AIzaSyC3rZ0Xi_SEU1BFEJhHqRhxJc6-IAzIgFM";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const doctorDomains = [
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Orthopedic",
  "Gastroenterologist",
  "Pulmonologist",
  "Endocrinologist",
  "Oncologist",
  "Psychiatrist",
  "Ophthalmologist",
];

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

const ContactDoctor = () => {
  const [symptoms, setSymptoms] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [doctorDomain, setDoctorDomain] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setDoctorDomain("");

    try {
      let result = selectedDomain;
      if (!selectedDomain && symptoms.trim()) {
        const geminiResponse = await axios.post(API_URL, {
          contents: [
            {
              parts: [
                {
                  text: `Based on these symptoms: "${symptoms}", suggest a doctor from this list only: ${doctorDomains.join(
                    ", "
                  )}. Return only one word that matches exactly from this list.`,
                },
              ],
            },
          ],
        });
        result =
          geminiResponse?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
          "Unknown";
        if (!doctorDomains.includes(result)) {
          result = "Unknown";
        }
      }

      setDoctorDomain(result);
      if (result !== "Unknown") {
        const doctorResponse = await axios.get(
          `https://backend-g51b.onrender.com/api/doctor/getallDomaindoctors?speciality=${result}`
        );
        console.log("karan ", doctorResponse);
        setDoctors(doctorResponse.data.doctors || []);
      }
    } catch (err) {
      setError("Failed to fetch doctor domain. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ fontFamily: "Barlow, sans-serif" }}
      className="min-h-screen bg-gradient-to-br from-[#fdd5c9] to-[#fcdcd3] p-6"
    >
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-3xl w-full mx-auto border-2 border-[#ffffff]">
        <div className="text-center mb-8">
          <StaircaseText
            text="FIND A DOCTOR"
            className="font-bold text-[#c94a4a] text-5xl mb-4"
          />
          <p className="text-gray-600 mt-2">
            Connect with the right specialist for your health needs
          </p>
        </div>

        <div className="bg-rose-50 p-6 rounded-xl mb-6 shadow-md border border-gray-100">
          <motion.input
            type="text"
            placeholder="Enter your symptoms..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl shadow-md focus:ring-2 focus:ring-[#c94a4a] focus:border-[#c94a4a] focus:outline-none transition-all"
          />

          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-4 text-gray-600 font-medium">OR</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          <motion.select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl shadow-md focus:ring-2 focus:ring-[#c94a4a] focus:border-[#c94a4a] focus:outline-none transition-all"
          >
            <option value="">Select a Specialist</option>
            {doctorDomains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </motion.select>

          <motion.button
            onClick={handleSearch}
            className="mt-6 w-full px-6 py-4 bg-gradient-to-br from-[#c94a4a] to-[#d86e6e] text-white text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              "Searching..."
            ) : (
              <>
                <FaSearch className="mr-2" />
                Find Doctor
              </>
            )}
          </motion.button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
            <p className="text-red-500 text-center font-medium">{error}</p>
          </div>
        )}

        {doctorDomain && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-rose-50 border border-rose-200 rounded-xl mb-6 text-center"
          >
            <p className="text-lg font-semibold text-[#c94a4a]">
              Suggested Specialist: {doctorDomain}
            </p>
          </motion.div>
        )}

        {doctors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white p-6 shadow-xl rounded-xl border border-gray-100"
          >
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 flex items-center justify-center">
              <FaUserMd className="text-[#c94a4a] mr-2" />
              Available Doctors
            </h2>
            <ul className="space-y-4">
              {doctors.map((doctor) => (
                <motion.li
                  key={doctor._id}
                  className="p-5 bg-rose-50 border border-gray-200 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all"
                  onClick={() =>
                    navigate("/firstconsult", { state: { doctor } })
                  }
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div>
                      <strong className="text-xl text-gray-800">
                        {doctor.name}
                      </strong>
                      <p className="text-[#c94a4a] font-medium">
                        {doctor.speciality}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          License: {doctor.licenseNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          Hospital ID: {doctor.hospitalId || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 md:mt-0 md:ml-4">
                      <p className="text-sm text-gray-600">
                        Email: {doctor.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        Contact: {doctor.phone_number}
                      </p>
                      <div className="mt-3">
                        <span className="inline-block px-3 py-1 bg-[#c94a4a] bg-opacity-10 text-[#c94a4a] rounded-full text-sm font-medium">
                          Click to consult
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {doctorDomain && doctors.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center"
          >
            <p className="text-gray-500">
              No doctors found for this specialty.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ContactDoctor;
