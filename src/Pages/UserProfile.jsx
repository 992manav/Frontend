import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaNotesMedical,
  FaHeartbeat,
} from "react-icons/fa";

const UserProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [reports, setReports] = useState([]);
  const appointments = [
    { doctor: "Manish Mittal", date: "11/04/25", reason: "ADHD and anxiety" },
  ];

  const getProfile = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/auth/getprofile",
        { withCredentials: true }
      );
      setUserData(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getReports = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/report/getreportbyuser",
        { withCredentials: true }
      );
      setReports(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getProfile();
    getReports();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdd5c9] to-[#fcdcd3] p-6 font-barlow">
      {/* Header */}
      <motion.h1
        className="text-4xl font-bold text-[#c94a4a] text-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome Back!
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Profile Section */}
        {userData && (
          <motion.div
            className="bg-white shadow-xl rounded-2xl p-6 flex flex-col items-center space-y-4 h-fit"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-24 h-24 bg-[#f8b4a3] rounded-full flex items-center justify-center">
              <FaUser className="text-white text-4xl" />
            </div>
            <h3 className="font-semibold text-xl text-gray-800">
              {userData.name}
            </h3>
            <p className="text-gray-500 text-sm">
              PT-{userData._id.slice(0, 8)}
            </p>

            <div className="w-full border-t border-gray-300 pt-4">
              <h3 className="font-bold text-lg text-gray-700 mb-2">
                Personal Info
              </h3>
              <p className="flex items-center gap-2">
                <FaHeartbeat className="text-red-500" />
                <strong>Blood Group:</strong> {userData.blood_group}
              </p>
              <p className="flex items-center gap-2">
                <FaPhone className="text-blue-500" />
                <strong>Phone:</strong> {userData.phone_number}
              </p>
              <p className="flex items-center gap-2">
                <FaEnvelope className="text-green-500" />
                <strong>Email:</strong> {userData.email}
              </p>
            </div>
          </motion.div>
        )}

        {/* Right Section: Appointments & Reports */}
        <div className="md:col-span-3 space-y-6">
          {/* Appointments Section */}
          <motion.div
            className="bg-white shadow-xl rounded-2xl p-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Upcoming Appointments
            </h2>
            {appointments.map((appt, index) => (
              <div
                key={index}
                className="bg-[#f8b4a3] text-white p-4 rounded-lg flex justify-between items-center text-sm mb-2"
              >
                <div>
                  <p className="font-bold">Doctor</p>
                  <p>{appt.doctor}</p>
                </div>
                <div>
                  <p className="font-bold">Date</p>
                  <p>{appt.date}</p>
                </div>
                <div>
                  <p className="font-bold">Reason</p>
                  <p>{appt.reason}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Reports Section */}
          <motion.div
            className="bg-white shadow-xl rounded-2xl p-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Previous Reports
            </h2>
            {reports.length > 0 ? (
              reports.map((report, index) => (
                <motion.div
                  key={index}
                  onClick={() => navigate(`/reportpage/` + report._id)}
                  className="bg-[#fcdcd3] cursor-pointer p-4 rounded-lg flex justify-between items-center text-sm mb-2 hover:bg-[#f8b4a3] hover:text-white transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <div>
                    <p className="font-bold">Doctor</p>
                    <p>{report.doctor.name}</p>
                  </div>
                  <div>
                    <p className="font-bold">Date</p>
                    <p>{report.date_of_creation.slice(0, 10)}</p>
                  </div>
                  <div>
                    <p className="font-bold text-center">Reason</p>
                    <p>{report.symptoms}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500">No reports available.</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
