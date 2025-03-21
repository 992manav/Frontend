import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaRobot, FaFileAlt, FaUsers } from "react-icons/fa"; 
import bg from "../assets/watercolor-light-peach-background_23-2150303077.jpg";

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

const LandingPage = () => {
  const navigate = useNavigate();

  const buttons = [
    { label: "Consult a Doctor", hoverText: "Connect with a doctor", path: "/consultdoctor" },
    { label: "AI Diagnosis", hoverText: "Get a medical diagnosis", path: "/aidiagnose" },
    { label: "Support Groups", hoverText: "Join health discussions", path: "/forum" },
    { label: "Upload Medical Record", hoverText: "Upload your medical records and prescription", path: "/uploadmedicalrecord" }
  ];

  const services = [
    {
      title: "AI-Powered Diagnostics",
      description: "Our AI-powered diagnostic tool analyzes symptoms and medical history to generate logical, data-driven health insights.",
      icon: <FaRobot className="text-4xl" />,
      bgColor: "bg-rose-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Medical Records Access",
      description: "Securely access your previous medical records and diagnostic history for better-informed health decisions.",
      icon: <FaFileAlt className="text-4xl" />,
      bgColor: "bg-rose-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Support Communities",
      description: "Join support groups to connect with others facing similar health challenges and share experiences.",
      icon: <FaUsers className="text-4xl" />,
      bgColor: "bg-rose-50",
      iconColor: "text-teal-600",
    },
  ];

  return (
    <div style={{ fontFamily: "Barlow, sans-serif" }} className="min-h-screen bg-gradient-to-br from-[#fdd5c9] to-[#fcdcd3] p-6">
      {/* Hero Section */}
      <motion.div className="flex flex-col gap-1 w-[90%] text-center mx-auto pb-0 m-0 relative">
        <motion.div
          className="text-center justify-center flex font-gravity text-[60px] font-bold"
          whileInView="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.09 } } }}
          initial="hidden"
        >
          <StaircaseText text="VAIDYAMITRA" className="font-bold text-[#c94a4a] text-8xl mb-4 mt-5 space-x-2" />
        </motion.div>

        {/* Background Image Section */}
        <div className="relative bg-cover bg-center rounded-2xl p-10 mt-10 shadow-md flex justify-between overflow-hidden border-2 border-[#ffffff]">
          <img src={bg} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-60" />

          <div className="mt-4 flex flex-col items-center relative z-10">
            <h2 className="text-[40px] font-semibold text-center text-gray-800 mb-3">Empowering Lives Through Health</h2>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
            Experience seamless healthcare with AI-driven diagnosis, instant doctor consultations, and hassle-free medicine purchases—all in one platform. Our smart system empowers you with accurate insights, personalized care, and easy access to trusted medical professionals. Stay ahead of your wellness journey with cutting-edge technology and expert guidance.</p>

            {/* Service Buttons */}
            <div className="flex gap-8 w-full justify-center text-[#1B263B]">
                {buttons.map((button, index) => (
                    <motion.div
                    key={index}
                    className="w-[280px] from-[#f8b4a3] to-[#f5c3b6] p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-lg border-2 border-gray-100 flex flex-col items-center justify-center cursor-pointer h-[150px] "
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate(button.path)}
                    >
                    <motion.h3
                        className="text-2xl font-semibold text-center absolute text-[#1B263B]"
                        initial={{ opacity: 1 }}
                        whileHover={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {button.label}
                    </motion.h3>
                    <motion.p
                        className="text-lg text-gray-700 font-barlow leading-relaxed text-center opacity-0 absolute"
                        initial={{ opacity: 0 }}
                        
                        transition={{ duration: 0.3 }}
                    >
                        {button.hoverText}
                    </motion.p>
                    </motion.div>
                ))}
                </div>

          </div>
        </div>
      </motion.div>

      {/* Services Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-3">Our Services</h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
          Comprehensive healthcare solutions designed to empower you on your wellness journey.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className={`${service.bgColor} p-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg border border-gray-100`}>
              <div className="flex justify-center mb-6">
                <div className={`p-4 rounded-full ${service.iconColor} bg-white shadow-sm`}>{service.icon}</div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">{service.title}</h3>
              <p className="text-gray-700 font-barlow leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
