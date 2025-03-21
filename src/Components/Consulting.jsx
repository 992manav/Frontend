import React from "react";
import { useNavigate } from "react-router-dom";
import { FaFemale, FaChild, FaHeadSideCough } from "react-icons/fa";
import { MdOutlineFace } from "react-icons/md";
import { RiMentalHealthLine } from "react-icons/ri";

const Consulting = () => {
  const navigate = useNavigate();

  const handleClick = (specialty) => {
    navigate("/contactdoctor", { state: { specialty: specialty.title } });
  };

  const specialties = [
    {
      title: "Period doubts or Pregnancy",
      icon: <FaFemale className="w-full h-full text-pink-500" />,
      cta: "CONSULT NOW",
      bgColor: "bg-pink-100",
      hoverColor: "hover:bg-pink-200",
    },
    {
      title: "Acne, pimple or skin issues",
      icon: <MdOutlineFace className="w-full h-full text-orange-500" />,
      cta: "CONSULT NOW",
      bgColor: "bg-orange-100",
      hoverColor: "hover:bg-orange-200",
    },
    {
      title: "Cold, cough or fever",
      icon: <FaHeadSideCough className="w-full h-full text-blue-500" />,
      cta: "CONSULT NOW",
      bgColor: "bg-blue-100",
      hoverColor: "hover:bg-blue-200",
    },
    {
      title: "Child not feeling well",
      icon: <FaChild className="w-full h-full text-green-500" />,
      cta: "CONSULT NOW",
      bgColor: "bg-green-100",
      hoverColor: "hover:bg-green-200",
    },
    {
      title: "Depression or anxiety",
      icon: <RiMentalHealthLine className="w-full h-full text-purple-500" />,
      cta: "CONSULT NOW",
      bgColor: "bg-purple-100",
      hoverColor: "hover:bg-purple-200",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div className="text-center w-full mx-auto">
          <h1 className="text-3xl font-bold text-gray-800">
            Consult top doctors online for any health concern
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Private online consultations with verified doctors in all
            specialties
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-6 mt-10">
        {specialties.map((specialty, index) => (
          <div
            key={index}
            className={`flex flex-col items-center text-center p-6 rounded-xl ${specialty.bgColor} ${specialty.hoverColor} transition-all duration-300 hover:shadow-md w-48`}
          >
            <div className="w-20 h-20 mb-4 flex items-center justify-center">
              {specialty.icon}
            </div>
            <h3 className="text-gray-800 font-medium mb-3 min-h-14 flex items-center">
              {specialty.title}
            </h3>
            <button
              onClick={() => handleClick(specialty)}
              className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-[#4CC0BF] hover:text-white transition-colors cursor-pointer shadow-sm"
            >
              {specialty.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 p-6 rounded-lg text-center">
        <p className="text-gray-700 font-medium mb-2">
          Need help choosing a specialist?
        </p>
        <button
          onClick={() => navigate("/contactdoctor")}
          className="bg-[#4CC0BF] text-black px-6 py-2 rounded-lg hover:bg-white transition-colors font-medium"
        >
          Get a Free Consultation
        </button>
      </div>
    </div>
  );
};

export default Consulting;