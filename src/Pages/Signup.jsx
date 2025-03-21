import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import patient from "../assets/patient.webp";
import doctor from "../assets/doctor.avif";
import { useNavigate } from "react-router-dom";

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
    profile_picture: "",
    address: "",
    blood_group: "",
    allergies: [],
    medicalHistory: [],
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const transition = { type: "spring", stiffness: 120, damping: 15 };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const endpoint =
      userType === "patient"
        ? "http://localhost:3000/api/auth/registerpatient"
        : "http://localhost:3000/api/auth/registerdoctor";

    try {
      const response = await axios.post(endpoint, formData);
      console.log("Signup Successful:", response.data);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

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
              className="bg-gradient-to-b  from-[#fbd8cf] to-[#FFFFFF] p-6 rounded-lg shadow-lg shadow-gray-400"
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
                      <option value="female">Female</option>f
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
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mt-6 w-full bg-[#FAAB98] text-black py-2 rounded-lg font-bold hover:bg-[#f47f62] transition"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="mt-6 w-full bg-[#FAAB98] text-black py-2 rounded-lg font-bold hover:bg-[#f47f62] transition"
                >
                  Sign Up
                </button>
              )}
            </motion.form>
          )}

          {step === 2 && userType === "patient" && (
            <motion.form
              onSubmit={handleSignup}
              initial={false}
              animate={{ x: 0, opacity: 1 }}
              transition={transition}
              className="bg-gradient-to-b  from-[#fbd8cf] to-[#FFFFFF] p-6 rounded-lg shadow-lg shadow-gray-400"
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