import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaCamera, FaUserCircle, FaPhoneAlt, FaFirstAid, FaHeartbeat, FaNotesMedical, FaAllergies } from "react-icons/fa";
import axios from "axios";
import CameraComponent from "../Components/CameraComponent"; // Import the camera component

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
    <motion.div className={className} whileInView="visible" variants={container} initial="hidden">
      {characters.map((char, index) => (
        <motion.span key={`${char}-${index}`} variants={child} style={{ position: "relative" }}>
          <span style={{ visibility: "hidden" }}>{char}</span>
          <motion.span style={{ position: "absolute", left: 0, fontFamily: "Pixelcraft, sans-serif" }}>
            {char === " " ? "\u00A0" : char}
          </motion.span>
        </motion.span>
      ))}
    </motion.div>
  );
};

const EmergencyPage = () => {
  const [searchName, setSearchName] = useState("");
  const [searchPhoto, setSearchPhoto] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("name");
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState(null);
  const [randomDoctorNote, setRandomDoctorNote] = useState("");
  const [showCamera, setShowCamera] = useState(false);

  // Array of sample doctor's notes
  const doctorNotes = [
    "Patient experiencing increasing frequency of migraine headaches. Trigger appears to be stress-related",
    "Referred to cardiologist for follow-up on arrhythmia. Patient should avoid strenuous activity until cleared.",
    "Fatigue and shortness of breath with exertion persisting. Starting iron supplementation",
    "Patient reports intermittent chest pain. ECG shows normal sinus rhythm.",
    "Advised patient on proper diet and exercise program. Follow up in 3 months to reassess cholesterol levels.",
    "Referred to neurologist for evaluation of recurring migraines. Patient should avoid bright screens until symptoms improve.",
  ];

  useEffect(() => {
    // Select a random doctor's note when search results are available
    if (searchResults) {
      const randomIndex = Math.floor(Math.random() * doctorNotes.length);
      setRandomDoctorNote(doctorNotes[randomIndex]);
    }
  }, [searchResults]);

  const handleSearchByName = async () => {
    if (!searchName.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`http://localhost:3000/api/patient/getpatient`, 
        { name: searchName },  
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log("karanwl", response.data);
      setSearchResults(response.data);
      
      // Select a random doctor's note
      const randomIndex = Math.floor(Math.random() * doctorNotes.length);
      setRandomDoctorNote(doctorNotes[randomIndex]);
      
    } catch (err) {
      console.error("Error fetching patient data:", err);
      setError(
        err.response?.data?.message || 
        "An error occurred while searching for the patient. Please try again."
      );
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  function calculateAge(dobString) {
    const dob = new Date(dobString);
    const today = new Date();
    
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    
    return age;
  }

  const extractFirstFourWords = (inputText) => {
    let result = 'Diagnosis Highlights section not found.'
      const match = inputText.match(/\*\*Diagnosis Highlights:\*\*(.*?)(?=\d+\.\s+\*\*|$)/s);
      
      if (match) {
        const content = match[1].trim().replace(/^\s*-\s+/, '');
        
        const firstFourWords = content.split(/\s+/).slice(0, 4).join(' ');
        result = firstFourWords;
      } else {
        result = 'Diagnosis Highlights section not found.';
      }
    
    return result;
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSearchPhoto(file);
    setError(null);
    
    // Preview image
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (file, previewUrl) => {
    setSearchPhoto(file);
    setPreviewImage(previewUrl);
    setShowCamera(false);
  };

  const handleCameraCancel = () => {
    setShowCamera(false);
  };

  const handleSearchByPhoto = async () => {
    if (!searchPhoto) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('photo', searchPhoto);
      
      // Make API call to search by photo
    //   const response = await axios.post(
    //     `${API_BASE_URL}/emergency/patient/photo`, 
    //     formData,
    //     {
    //       headers: {
    //         'Content-Type': 'multipart/form-data',
    //         'Authorization': `Bearer ${localStorage.getItem('token')}`
    //       }
    //     }
    //   );
      
    //   setSearchResults(response.data);
    } catch (err) {
      console.error("Error searching by photo:", err);
      setError(
        err.response?.data?.message || 
        "An error occurred while searching with this photo. Please try again."
      );
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Barlow, sans-serif" }} className="min-h-screen bg-gradient-to-br from-[#fdd5c9] to-[#fcdcd3] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <StaircaseText text="EMERGENCY ACCESS" className="font-bold text-[#c94a4a] text-6xl mb-2" />
          <p className="text-gray-700 mt-4 text-xl">
            Quick access to patient information in emergency situations
          </p>
        </div>

        {/* Emergency Alert Box */}
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
              <h3 className="text-lg font-medium text-[#c94a4a]">Emergency Information Only</h3>
              <p className="mt-1 text-gray-700">
                This page is designed for emergency medical personnel only. Information accessed here should be used solely for providing emergency medical care.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search Tabs */}
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

          {/* Search Content */}
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
                      loading || !searchName.trim() ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Searching..." : "Search"}
                  </motion.button>
                </div>
                <p className="text-sm text-gray-500">
                  Enter the patient's full name as it appears on their ID or medical records.
                </p>
              </div>
            ) : (
              <div className="h-auto">
                {showCamera ? (
                  <CameraComponent 
                    onCapture={handleCameraCapture}
                    onCancel={handleCameraCancel}
                  />
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
                        <p className="mt-3 text-gray-600">Take a photo of the patient or upload an existing one</p>
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
                              <path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6h96 32H424c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"/>
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
                    onClick={handleSearchByPhoto}
                    disabled={loading}
                    className={`w-full px-6 py-4 bg-gradient-to-r from-[#c94a4a] to-[#d86e6e] text-white font-medium rounded-xl flex items-center justify-center ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Searching..." : "Search by Photo"}
                  </motion.button>
                )}
              </div>
            )}
            
            {/* Error display */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#c94a4a] to-[#d86e6e] px-6 py-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <FaUserCircle className="mr-2" />
                Patient Information
              </h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
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
                      <span className="font-medium">{calculateAge(searchResults.date_of_birth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-medium">{searchResults.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blood Type:</span>
                      <span className="font-medium">{searchResults.blood_group}</span>
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

                {/* Medical Conditions & Allergies */}
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
                      {searchResults.allergies && searchResults.allergies.length > 0 ? (
                        searchResults.allergies.map((allergy, index) => (
                          <div key={index} className="py-1 px-3 bg-white rounded-lg shadow-sm">
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
                    <h5 className="text-md font-medium text-gray-700 mb-2">Medical Conditions</h5>
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

              {/* Doctor Notes */}
              <div className="mt-6 bg-rose-50 p-5 rounded-xl shadow-sm">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <FaNotesMedical className="mr-2 text-[#c94a4a]" />
                  Doctor's Notes
                </h4>
                <p className="bg-white p-3 rounded-lg shadow-sm">
                  {randomDoctorNote || "No doctor's notes available."}
                </p>
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
    <path d="M128 0C92.7 0 64 28.7 64 64v96h64V64H354.7L384 93.3V160h64V93.3c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0H128zM384 352v32 64H128V384 352H384zm64 32h32c17.7 0 32-14.3 32-32V256c0-35.3-28.7-64-64-64H64c-35.3 0-64 28.7-64 64v96c0 17.7 14.3 32 32 32H64v64c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V384zm-16-88c-13.3 0-24-10.7-24-24s10.7-24 24-24s24 10.7 24 24s-10.7 24-24 24z"/>
  </svg>
);