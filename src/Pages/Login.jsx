import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import patient from "../assets/patient.webp";
import doctor from "../assets/doctor.avif";

export default function Login() {
  const [userType, setUserType] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const transition = { type: "spring", stiffness: 120, damping: 15 };

  const handleLogin = async (e) => {
    e.preventDefault();

    const endpoint =
      userType === "patient"
        ? "http://localhost:3000/api/auth/loginpatient"
        : "http://localhost:3000/api/auth/logindoctor";

    const payload =
      userType === "patient"
        ? { email, password }
        : { licenseNumber, password };

    try {
      const response = await axios.post(endpoint, payload, {
        withCredentials: true,
      });
      console.log("Login Successful:", response.data);

      toast.success(
        `${userType === "patient" ? "Patient" : "Doctor"} login successful!`
      );

      if (userType === "patient") {
        navigate("/");
      } else {
        navigate("/doctorprofile");
      }
    } catch (err) {
      toast.error("Login Failed");
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
          <img
            src={userType === "patient" ? patient : doctor}
            alt="Login"
            className=" max-w-xs md:max-w-sm "
          />
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
                onClick={() => setUserType("doctor")}
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

          <motion.form
            onSubmit={handleLogin}
            initial={false}
            animate={{ x: 0, opacity: 1 }}
            transition={transition}
            className="bg-gradient-to-b  from-[#fbd8cf] to-[#FFFFFF] p-6 rounded-lg shadow-lg shadow-gray-400"
          >
            <h2 className="text-2xl font-bold mb-4 text-center">
              {userType === "patient" ? "Patient Login" : "Doctor Login"}
            </h2>
            <div className="space-y-4">
              {userType === "patient" ? (
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-[#e0c7c1]"
                  required
                />
              ) : (
                <input
                  type="text"
                  placeholder="License Number"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-[#e0c7c1]"
                  required
                />
              )}
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-lg bg-[#e0c7c1]"
                required
              />
            </div>
            {error && <p className="text-red-500 text-center mt-2">{error}</p>}
            <button
              type="submit"
              className="mt-6 w-full bg-[#FAAB98] text-black py-2 rounded-lg font-bold hover:bg-[#f47f62] transition"
            >
              Login
            </button>
            <p className="text-center text-gray-600 mt-4 text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-[#FAAB98] font-bold cursor-pointer hover:underline hover:text-[#f47f62]"
              >
                Sign Up
              </button>
            </p>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
