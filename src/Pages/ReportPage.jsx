import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FcVideoCall } from "react-icons/fc";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Chat from "../Components/Chat";

const ReportPage = () => {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(
          `https://backend-g51b.onrender.com/api/report/getreport/${reportId}`,
          { withCredentials: true }
        );
        console.log(response.data.report);
        setReport(response.data.report);
      } catch (err) {
        setError("Failed to fetch report");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId]);

  if (loading) return <p className="text-center text-lg">Loading report...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;
  if (!report) return <p className="text-center text-lg">No report found.</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdd5c9] to-[#fcdcd3] p-6">
      <div className="w-full max-w-7xl bg-white/50 backdrop-blur-lg shadow-2xl rounded-3xl p-10 border border-white">
        <motion.h1
          className="text-center text-[#c94a4a] text-5xl font-bold mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Report Details
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Patient Details */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-gray-900">
              Doctor Information
            </h2>
            <p className="text-gray-700 mt-2">
              Name: {report.doctor?.name || "Unknown"}
            </p>
            <p className="text-gray-700">
              Phone Number: {report.doctor?.phone_number}
            </p>
            <p
              className={`mt-2 font-bold text-lg ${
                report.status === "Completed"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              Status: {report.status}
            </p>
          </motion.div>

          {/* Symptoms */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-gray-900">Symptoms</h2>
            <p className="text-gray-700 mt-2">
              {report.symptoms || "No consultation details available."}
            </p>
          </motion.div>
        </div>

        {/* Diagnosis & Prescription */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-gray-900">Diagnosis</h2>
            <p className="text-gray-900 mt-2 text-lg">
              {report.diagnosis || "Not diagnosed"}
            </p>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-gray-900">
              Current Prescription
            </h2>
            {report.medications && report.medications.length > 0 ? (
              <ul className="mt-2 space-y-2 text-gray-900 list-disc list-inside">
                {report.medications.map((medication, index) => (
                  <li key={index} className="border-l-4 border-white pl-2">
                    {medication}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700 mt-2">
                No consultation details available.
              </p>
            )}
          </motion.div>
        </div>

        {/* Doctor Connection */}
        <motion.div
          className="mt-8 p-6 bg-white shadow-lg rounded-xl border border-gray-200 flex justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-gray-900">
            Connect with Doctor
          </h2>
          <FcVideoCall
            className="text-[50px] hover:cursor-pointer transition-transform hover:scale-110"
            onClick={() => window.open("/videocall", "_blank")}
          />
        </motion.div>
        <Chat receiver={report.doctor._id} sender={report.patient._id} />
        <motion.div
          className="bg-white p-6 rounded-xl mt-5 shadow-lg border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl mt- font-bold text-gray-900">
            Suggestions By Doctor
          </h2>
          <p className="text-gray-900 mt-2 text-lg">
            {report.suggestions || "Not diagnosed"}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportPage;
