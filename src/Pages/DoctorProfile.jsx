import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DoctorProfile = () => {
  const navigate = useNavigate();
  const [docinfo, setDocinfo] = useState(null);
  const [patients, setPatients] = useState([]);

  const docprofile = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/doctor/getcurrentdoctor",
        { withCredentials: true }
      );
      console.log("Doctor Info:", response.data.doctor);
      setDocinfo(response.data.doctor);
    } catch (err) {
      console.error("Error fetching doctor info:", err);
    }
  };

  const getPatients = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/report/getpatients",
        { withCredentials: true }
      );
      console.log("Patients Data:", response.data.report);
      setPatients(response.data.report || []);
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };

  useEffect(() => {
    docprofile();
    getPatients();
  }, []);

  return (
    <div
      className="min-h-screen bg-sky-100 p-6 flex"
      style={{ fontFamily: "Barlow, sans-serif" }}
    >
      {/* Sidebar Doctor Profile */}
      <div className="w-1/4 mr-6">
        <div className="bg-white rounded-lg overflow-hidden shadow">
          <div className="p-6 text-center border-b">
            {docinfo ? (
              <>
                <img
                  src="https://www.shutterstock.com/image-vector/male-doctors-white-medical-coats-600nw-2380152965.jpg"
                  alt={docinfo.name}
                  className="w-32 h-32 rounded-full mx-auto bg-gray-200"
                />
                <h2 className="text-xl font-bold mt-4">{docinfo.name}</h2>
              </>
            ) : (
              <p>Loading doctor info...</p>
            )}
          </div>

          {docinfo && (
            <div className="p-6">
              <div className="mb-4">
                <span className="font-semibold">Gender : </span>
                <span className="float-right text-gray-600">
                  {docinfo.gender || "N/A"}
                </span>
              </div>

              <div className="mb-4">
                <span className="font-semibold">License number : </span>
                <span className="float-right text-gray-600">
                  {docinfo.licenseNumber
                    ? `Did-${docinfo.licenseNumber}`
                    : "N/A"}
                </span>
              </div>

              <div className="mb-4">
                <span className="font-semibold">Speciality : </span>
                <span className="float-right text-gray-600">
                  {docinfo.speciality || "N/A"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Patients Section */}
      <div className="w-3/4">
        <div className="bg-white rounded-lg shadow p-6">
          {patients.length === 0 ? (
            <p className="text-gray-600 text-center">No patients found</p>
          ) : (
            patients.map((patient) => (
              <div
                key={patient._id}
                onClick={() => navigate(`/checkpatient/${patient._id}`)}
                className="cursor-pointer mb-6 border rounded-lg p-6 hover:bg-sky-50 transition"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Patient Name:{" "}
                  <span className="text-gray-600">
                    {patient.patient?.name || "Unknown"}
                  </span>
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  {/* Diagnosis Section */}
                  <div className="bg-sky-100 rounded-lg p-6 h-full">
                    <h4 className="text-center text-lg font-medium mb-4">
                      Diagnosis
                    </h4>
                    <div className="mb-4 border h-28 rounded-2xl text-center flex items-center justify-center p-2">
                      {patient.diagnosis || "Not yet diagnosed"}
                    </div>
                  </div>

                  {/* Prescription Section */}
                  <div className="bg-sky-100 rounded-lg p-6 h-full">
                    <h4 className="text-center text-lg font-medium mb-4">
                      Prescription
                    </h4>
                    <div className="mb-4 border h-28 rounded-2xl text-center p-2">
                      {patient.medications?.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {patient.medications.map((med, index) => (
                            <li key={index}>{med}</li>
                          ))}
                        </ul>
                      ) : (
                        "No prescription yet"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
