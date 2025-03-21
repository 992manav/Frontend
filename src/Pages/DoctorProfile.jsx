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
      className="min-h-screen bg-gradient-to-b from-[#ffcbc2] to-[#FFFFFF] p-6 flex"
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
        
      {/* <h1
        className="text-3xl text-center mb-7 font-bold text-[#c94a4a] cursor-pointer hover:scale-110 transition duration-300 ease-in-out tracking-widest"
        style={{ fontFamily: "Pixelcraft, sans-serif" }}
      >
        Your Patients
      </h1> */}



      <div className="bg-white rounded-xl shadow-lg p-8 max-w-6xl mx-auto">
    <h1 className="text-3xl text-center mb-4 font-bold text-[#c94a4a] cursor-pointer hover:scale-110 transition duration-300 ease-in-out tracking-widest" style={{ fontFamily: "Pixelcraft, sans-serif" }}>Your Patients</h1>   
  {patients.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-12">
      <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p className="text-gray-600 text-lg font-medium">No patients found</p>
      <p className="text-gray-500 mt-2">Add a new patient to get started</p>
    </div>
  ) : (
    <div className="grid gap-6">
      {patients.map((patient) => (
        <div
          key={patient._id}
          onClick={() => navigate(`/checkpatient/${patient._id}`)}
          className="cursor-pointer border border-[#f0c9bf] rounded-xl p-6 bg-[#f9ede9] hover:bg-[#f6d5cd] transition-all duration-300 hover:shadow-md"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 px-2">
            <div className="flex items-center mb-2 md:mb-0">
              <div className="bg-[#FAAB98] p-2 rounded-full mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold">
                Patient Name:{" "}
                <span className="text-gray-700 font-medium">
                  {patient.patient?.name || "Unknown"}
                </span>
              </h3>
            </div>
            
            <div className="flex items-center">
              <div className="bg-[#FAAB98] p-2 rounded-full mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold">
                Patient Contact:{" "}
                <span className="text-gray-700 font-medium">
                  {patient.patient?.phone_number || "Unknown"}
                </span>
              </h3>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Diagnosis Section */}
            <div className="bg-gradient-to-br from-[#FAAB98] to-[#f8c0b2] rounded-xl shadow-sm p-6 h-full">
              <h4 className="text-center text-lg font-semibold mb-4 text-gray-800 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
                Symptoms
              </h4>
              <div className="mb-2 bg-white bg-opacity-70 border border-[#f0c9bf] h-28 rounded-xl flex items-center justify-center p-4 shadow-sm">
                <p className="text-gray-700 font-medium text-center">
                  {patient.symptoms || "Not yet diagnosed"}
                </p>
              </div>
            </div>
            
            {/* Prescription Section */}
            <div className="bg-gradient-to-br from-[#FAAB98] to-[#f8c0b2] rounded-xl shadow-sm p-6 h-full">
              <h4 className="text-center text-lg font-semibold mb-4 text-gray-800 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                </svg>
                Prescription
              </h4>
              <div className="mb-2 bg-white bg-opacity-70 border border-[#f0c9bf] h-28 rounded-xl p-4 shadow-sm overflow-y-auto">
                {patient.medications?.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {patient.medications.map((med, index) => (
                      <li key={index} className="text-gray-700 font-medium mb-1">{med}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-700 font-medium text-center">No prescription yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* <div className="mt-4 flex justify-end">
            <div className="text-sm text-gray-500 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              Click to view details
            </div>
          </div> */}
        </div>
      ))}
    </div>
  )}
</div>


        
      </div>
    </div>
  );
};

export default DoctorProfile;