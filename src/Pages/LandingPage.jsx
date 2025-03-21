import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
//import Consulting from "../Components/Consulting";
import bgi from "../assests/bgi.png";
//import { FaRobot, FaFileAlt, FaUsers } from "react-icons/fa";

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
      transition: {
        type: "tween",
        ease: "easeOut",
        duration: 1,
      },
    },
    hidden: {
      opacity: 0,
      clipPath: "inset(100% 0 0 0)",
      transition: {
        type: "tween",
        ease: "easeIn",
        duration: 1,
      },
    },
  };

  return (
    <motion.div
      className={className}
      whileInView="visible"
      variants={container}
      initial="hidden"
    >
      {characters.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          variants={child}
          style={{ position: "relative" }}
        >
          <span style={{ visibility: "hidden" }}>{char}</span>
          <motion.span
            style={{
              position: "absolute",
              left: 0,
              fontFamily: "Pixelcraft, sans-serif",
            }}
          >
            {char === "  " ? "\u00A0" : char}
          </motion.span>
        </motion.span>
      ))}
    </motion.div>
  );
};

const Jeevanya = () => {
  const navigate = useNavigate();
  const [hoverIndex, setHoverIndex] = useState(null);

  const buttons = [
    {
      label: "Consult a Doctor",
      hoverText: "Connect with a doctor",
      path: "/contactdoctor",
    },
    {
      label: "AI Diagnosis",
      hoverText: "Get a medical diagnosis",
      path: "/aidiagnose",
    },
    { label: "Support Groups", hoverText: "Join health discussions", path: "/forum" },
    {
      label: "Upload Medical Record",
      hoverText: "Upload your medical records and current prescription",
      path: "/uploadmedicalrecord",
    },
    ,
  ];

  const services = [
    {
      title: "AI-Powered Diagnostics",
      description:
        "Our AI-powered diagnostic tool allows users to input their current symptoms along with their previous medical records. By analyzing this data, the AI generates logical and data-driven insights to help users understand potential health conditions.",
      icon: <FaRobot className="text-4xl" />,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Medical Records Access",
      description:
        "Patients have full access to their previous medical records and complete diagnostic history, empowering them to make informed decisions about their health.",
      icon: <FaFileAlt className="text-4xl" />,
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Support Communities",
      description:
        "Our support group provides a safe and welcoming space for individuals facing similar health challenges and conditions to connect with one another.",
      icon: <FaUsers className="text-4xl" />,
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
    },
  ];

  return (
    <div
      style={{ fontFamily: "Barlow, sans-serif" }}
      className="min-h-screen bg-gradient-to-br from-[#E1F5FE] via-[#D4F1F4] to-[#FFFFFF] p-6"
    >
      {/* Hero Section */}
      <motion.div className="flex flex-col gap-1   w-[90%] text-center mx-auto pb-0 m-0 relative">
        <motion.div
          className="text-center justify-center flex mb-[-50px] font-gravity text-[60px] font-bold"
          whileInView="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.09 } },
          }}
          initial="hidden"
        >
          <StaircaseText
            text="JEEVANYA"
            className="font-bold text-[#3498DB] text-8xl mb-10 mt-5 space-x-2"
            style={{ fontFamily: "Pixelcraft, sans-serif" }}
          />
          {/* <StaircaseText text="3" className="text-[#DC483A]" />
          <StaircaseText text="Lance" className="text-black" /> */}
        </motion.div>

        <div className="relative bg-cover bg-center rounded-4xl p-10 mt-10 shadow-md flex justify-between overflow-hidden border-2 border-[#C8C8C8]">
          <img
            src={bgi}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover opacity-8"
          />

          <div className="w-2/5 z-10 text-left">
            <h2 className="text-5xl font-semibold text-gray-800">
              Empowering Lives Through Health
            </h2>
            <p className="mt-12 mr-12 text-xl">
              A patient-focused digital platform that connects with hospital
              systems, allowing real-time access to medical records, customized
              treatment plans, proactive health alerts, and easy communication
              between patients, doctors, and caregivers. This platform aims to
              boost patient involvement and enhance the overall healthcare
              experience during major hospital changes.
            </p>
          </div>

          {/* Buttons Grid with Hover Effect */}
          <div className="grid grid-cols-2 gap-4 w-3/5 z-10">
            {buttons.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
                className="glowing-button bg-white p-10 rounded-xl text-3xl font-semibold cursor-pointer transition duration-800 ease-in-out"
              >
                {hoverIndex === index ? (
                  <span className="text-lg font-medium">{item.hoverText}</span>
                ) : (
                  <span>{item.label}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Consulting Section */}
      <div className="mt-32"></div>
      <Consulting />

      {/* Enhanced Services Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-3">
          Our Services
        </h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
          Comprehensive healthcare solutions designed to empower you on your
          wellness journey
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className={`${service.bgColor} p-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg border border-gray-100`}
            >
              <div className="flex justify-center mb-6">
                <div
                  className={`p-4 rounded-full ${service.iconColor} bg-white shadow-sm`}
                >
                  {service.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                {service.title}
              </h3>
              <p className="text-gray-700 font-barlow leading-relaxed">
                {service.description}
              </p>
              <div className="mt-6">
                <button className="text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center justify-center mx-auto"></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Jeevanya;
