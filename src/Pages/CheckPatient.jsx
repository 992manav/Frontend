import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FcVideoCall } from "react-icons/fc";
import axios from "axios";

const CheckPatient = () => {
  const [userData, setUserData] = useState(null);
  const [report, setReport] = useState(null);
  const [patientData, setPatientData] = useState(null); // Store patient details

  const { patientID } = useParams(); // Taking patientID from route params
  console.log("Patient ID:", patientID);

  // ✅ Fetch Patient Details including Past Medical History & Report
  const getPatientDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/patient/getpatient/${patientID}`,
        { withCredentials: true }
      );
      console.log("Patient Data:", response.data.patient);
      setPatientData(response.data.patient);
      setReport(response.data.report); // ✅ Fix: Store report separately
    } catch (err) {
      console.log("Error fetching patient details:", err);
    }
  };

  useEffect(() => {
    getPatientDetails(); // Fetch patient details
  }, []);

  const navigate = useNavigate();
  const [modalType, setModalType] = useState(null);
  const [message, setMessage] = useState("");

  const openModal = (type) => {
    setModalType(type);
    setMessage("");
  };

  const closeModal = () => {
    setModalType(null);
  };

  return (
    <div className="bg-gradient-to-b from-blue-100 to-blue-200 min-h-screen p-8">
      <div className="">
        <h1 className="text-4xl font-bold mb-8">Patient Details</h1>

        <div className="w-full">
          <div className="flex items-center justify-around w-full bg-[#4CC0BF] p-6 rounded-2xl shadow-md">
            <div className="w-36 h-36 bg-gray-300 rounded-full mb-4">
              <img
                src="https://www.shutterstock.com/image-vector/male-doctors-white-medical-coats-600nw-2380152965.jpg"
                alt="Doctor"
                className="rounded-full"
              />
            </div>
            {userData && patientData && (
              <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center w-3xl">
                <h2 className="text-2xl font-bold">{patientData.name}</h2>
                <p className="text-gray-500">{userData.licenseNumber}</p>
              </div>
            )}
            <div>
              {["Diagnosis", "Suggestion", "Prescription"].map((type) => (
                <div
                  key={type}
                  className="p-4 m-2 bg-amber-300 hover:bg-amber-400 rounded-2xl shadow-md flex flex-col items-center cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg active:scale-95"
                  onClick={() => openModal(type)}
                >
                  <button className="cursor-pointer transition-colors duration-200 ease-in-out">
                    Send {type}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Prescription & Symptoms Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full">
        <div className="bg-white p-6 rounded-2xl shadow-md w-full">
          <h3 className="text-xl font-semibold mb-4">Current Prescription</h3>
          <ul className="list-disc pl-5">
            <li>
              {report
                ? report.medications.join(", ")
                : "No prescription available."}
            </li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md w-full">
          <h3 className="text-xl font-semibold mb-4">Symptoms</h3>
          <p>{report ? report.symptoms : "No Symptoms details available."}</p>
        </div>
      </div>

      {/* ✅ Video Call Section */}
      <div className="bg-white p-6 rounded-2xl shadow-md mt-8">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold mb-4">
            Contact Doctor <span className="font-bold">Junn Jaas</span>
          </h3>
          <FcVideoCall
            className="text-[50px] hover:cursor-pointer"
            onClick={() => navigate("/videocall")}
          />
        </div>
      </div>

      {/* ✅ Diagnosis/Suggestion/Prescription Modal */}
      {modalType && (
        <>
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-md w-96">
              <h3 className="text-xl font-semibold mb-4">Send {modalType}</h3>
              <textarea
                className="w-full p-2 border rounded-md"
                rows="4"
                placeholder={`Type your ${modalType.toLowerCase()} here`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
              <div className="flex justify-end mt-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded-md mr-2 transition-transform duration-200 ease-in-out hover:bg-gray-400 active:bg-gray-500 hover:scale-105"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-amber-200 rounded-md transition-transform duration-200 ease-in-out hover:bg-amber-300 active:bg-amber-400 hover:scale-105">
                  Send
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ✅ Display Past Medical History */}
      <div className="bg-white p-6 rounded-2xl shadow-md mt-8 w-full">
        <h3 className="text-xl font-semibold mb-4">Past Medical History</h3>
        <p>{patientData?.medicalHistory || "No medical history available."}</p>
      </div>
    </div>
  );
};

export default CheckPatient;
