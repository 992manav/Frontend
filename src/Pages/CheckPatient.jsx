import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FcVideoCall } from "react-icons/fc";
import { motion } from "framer-motion";
import { FaFilePrescription, FaNotesMedical, FaUserMd } from "react-icons/fa";
import axios from "axios";

const CheckPatient = ({ userData }) => {
  const [patientData, setPatientData] = useState(null);
  const [report, setReport] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [message, setMessage] = useState("");
  const [medications, setMedications] = useState([]);
  const [newMedicine, setNewMedicine] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { patientID } = useParams();

  console.log("Patient ID:", patientID);

  // ✅ Fetch Patient Details including Report
  const getPatientDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/patient/getpatient/${patientID}`,
        { withCredentials: true }
      );
      console.log("Patient Data:", response.data.patient);
      console.log("Report Data:", response.data.report);
      setPatientData(response.data.patient);
      setReport(response.data.report);
    } catch (err) {
      console.log(
        "Error fetching patient details:",
        err.response?.data || err.message
      );
    }
  };

  useEffect(() => {
    if (patientID) {
      getPatientDetails();
    }
  }, [patientID]);

  const openModal = (type) => {
    setModalType(type);
    setMessage("");
    setMedications([]);
    setNewMedicine("");
  };

  const closeModal = () => {
    setModalType(null);
  };

  const sendMessage = async () => {
    if (modalType === "Prescription" && medications.length === 0) return;
    if (!message.trim() && modalType !== "Prescription") return;

    setLoading(true);
    let endpoint = "";

    if (modalType === "Diagnosis") {
      endpoint = "/api/report/send-diagnosis";
    } else if (modalType === "Suggestion") {
      endpoint = "/api/report/send-suggestion";
    } else if (modalType === "Prescription") {
      endpoint = "/api/report/send-prescription";
    }

    try {
      await axios.post(
        `http://localhost:3000${endpoint}`,
        {
          reportID: report?._id,
          message: medications.map((med) => {
            const times = [];
            if (med.morning) times.push("M");
            if (med.evening) times.push("E");
            if (med.night) times.push("N");
            return `${med.name} (${times.join(",")})`;
          }),
        },
        { withCredentials: true }
      );

      alert(`${modalType} sent successfully!`);
      closeModal();
    } catch (err) {
      console.log(
        `Error sending ${modalType}:`,
        err.response?.data || err.message
      );
      alert("Failed to send. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const addMedicine = () => {
    const trimmedMed = newMedicine.trim();
    if (trimmedMed) {
      setMedications([
        ...medications,
        { name: trimmedMed, morning: false, evening: false, night: false },
      ]);
      setNewMedicine("");
    }
  };

  const removeMedicine = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const toggleMedicationTime = (index, timeKey) => {
    const updatedMeds = [...medications];
    updatedMeds[index][timeKey] = !updatedMeds[index][timeKey];
    setMedications(updatedMeds);
  };

  // Icons for the action buttons
  const actionIcons = {
    Diagnosis: <FaUserMd className="text-2xl mb-2" />,
    Suggestion: <FaNotesMedical className="text-2xl mb-2" />,
    Prescription: <FaFilePrescription className="text-2xl mb-2" />,
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#fdd5c9] to-[#fcdcd3] p-8"
      style={{ fontFamily: "Barlow, sans-serif" }}
    >
      <motion.h1
        className="text-4xl font-bold mb-8 text-[#c94a4a]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Patient Details
      </motion.h1>

      <motion.div
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center justify-around w-full bg-rose-50 p-6 rounded-xl shadow-md border-2 border-white">
          <div className="w-36 h-36 bg-white rounded-full mb-4 overflow-hidden shadow-md border-2 border-[#f8b4a3]">
            <img
              src="https://www.shutterstock.com/image-vector/male-doctors-white-medical-coats-600nw-2380152965.jpg"
              alt="Doctor"
              className="rounded-full w-full h-full object-cover"
            />
          </div>
          {userData && patientData && (
            <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center w-3xl border border-gray-100">
              <h2 className="text-2xl font-semibold text-[#1B263B]">
                {patientData.name}
              </h2>
              <p className="text-gray-500">{userData.licenseNumber}</p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            {["Diagnosis", "Suggestion", "Prescription"].map((type) => (
              <motion.div
                key={type}
                className="p-4 bg-gradient-to-b from-[#f8b4a3] to-[#f5c3b6] rounded-xl shadow-md flex flex-col items-center cursor-pointer border-2 border-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openModal(type)}
              >
                {actionIcons[type]}
                <button className="text-[#1B263B] font-medium">
                  Send {type}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full">
        <motion.div
          className="bg-rose-50 p-6 rounded-xl shadow-md w-full border border-gray-100"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h3 className="text-xl font-semibold mb-4 text-[#1B263B]">
            Current Prescription
          </h3>
          <ul className="list-disc pl-5 text-gray-700">
            <li>
              {report?.medications?.length > 0
                ? report.medications.join(", ")
                : "No prescription given yet."}
            </li>
          </ul>
        </motion.div>

        <motion.div
          className="bg-rose-50 p-6 rounded-xl shadow-md w-full border border-gray-100"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h3 className="text-xl font-semibold mb-4 text-[#1B263B]">
            Symptoms
          </h3>
          <p className="text-gray-700">
            {report?.symptoms || "No Symptoms details available."}
          </p>
        </motion.div>
      </div>

      <motion.div
        className="bg-rose-50 p-6 rounded-xl shadow-md mt-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold mb-4 text-[#1B263B]">
            Contact to Patient -{" "}
            <span className="font-bold">{patientData?.name}</span>
          </h3>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <FcVideoCall
              className="text-[50px] hover:cursor-pointer"
              onClick={() => navigate("/videocall")}
            />
          </motion.div>
          {/* <Chat receiver={report.doctor._id} sender={report.patient._id} /> */}
        </div>
      </motion.div>

      {/* ✅ Display Past Medical History */}
      <motion.div
        className="bg-rose-50 p-6 rounded-xl shadow-md mt-6 w-full border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold mb-4 text-[#1B263B]">
          Past Medical History
        </h3>
        <p className="text-gray-700">
          {patientData?.medicalHistory || "No medical history available."}
        </p>
      </motion.div>

      <motion.div
        className="bg-rose-50 p-6 rounded-xl shadow-md mt-6 w-full border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold mb-4 text-[#1B263B]">
          Previously Sent Diagnosis
        </h3>
        <p className="text-gray-700">
          {report?.diagnosis || "No diagnosis available."}
        </p>
      </motion.div>

      {modalType && (
        <>
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <motion.div
            className="fixed inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white p-6 rounded-xl shadow-lg w-96 border-2 border-[#f8b4a3]">
              <h3 className="text-xl font-semibold mb-4 text-[#1B263B]">
                Send {modalType}
              </h3>

              {modalType === "Prescription" ? (
                <div>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f8b4a3]"
                      placeholder="Enter medicine name"
                      value={newMedicine}
                      onChange={(e) => setNewMedicine(e.target.value)}
                    />
                    <motion.button
                      className="px-4 py-2 bg-gradient-to-b from-[#f8b4a3] to-[#f5c3b6] text-[#1B263B] font-medium rounded-lg border border-white"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={addMedicine}
                    >
                      Add
                    </motion.button>
                  </div>
                  <ul>
                    {medications.map((med, index) => (
                      <motion.li
                        key={index}
                        className="flex flex-col p-3 bg-rose-50 rounded-lg mb-3 border border-gray-100"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-[#1B263B]">
                            {med.name}
                          </span>
                          <motion.button
                            className="text-red-500 ml-2"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeMedicine(index)}
                          >
                            ❌
                          </motion.button>
                        </div>
                        <div className="flex gap-4 mt-2">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={med.morning}
                              onChange={() =>
                                toggleMedicationTime(index, "morning")
                              }
                              className="mr-1 form-checkbox h-4 w-4 text-[#c94a4a] rounded focus:ring-[#c94a4a] border-gray-300"
                            />
                            <span className="text-gray-700">Morning</span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={med.evening}
                              onChange={() =>
                                toggleMedicationTime(index, "evening")
                              }
                              className="mr-1 form-checkbox h-4 w-4 text-[#c94a4a] rounded focus:ring-[#c94a4a] border-gray-300"
                            />
                            <span className="text-gray-700">Evening</span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={med.night}
                              onChange={() =>
                                toggleMedicationTime(index, "night")
                              }
                              className="mr-1 form-checkbox h-4 w-4 text-[#c94a4a] rounded focus:ring-[#c94a4a] border-gray-300"
                            />
                            <span className="text-gray-700">Night</span>
                          </label>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ) : (
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f8b4a3]"
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Enter ${modalType.toLowerCase()} details...`}
                ></textarea>
              )}

              <div className="flex justify-end mt-6 gap-3">
                <motion.button
                  className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeModal}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="px-4 py-2 bg-gradient-to-b from-[#f8b4a3] to-[#f5c3b6] rounded-lg text-[#1B263B] font-medium border border-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                >
                  {loading ? "Sending..." : "Send"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default CheckPatient;
