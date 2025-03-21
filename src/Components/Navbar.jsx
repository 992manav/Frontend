import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Screenshot_2025-03-21_183855-removebg-preview.png";

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between items-center px-12 py-4 bg-[#fcd0c4] ">
      {/* Logo */}
      {/* <h1
        onClick={() => navigate("/")}
        className="text-4xl font-bold text-[#3498DB] cursor-pointer hover:scale-110 transition duration-300 ease-in-out tracking-wider"
        style={{ fontFamily: "Pixelcraft, sans-serif" }}
      >
        Jeevanya
      </h1> */}
      <img
        src={logo}
        alt=""
        onClick={() => navigate("/")}
        className="w-16 h-16 cursor-pointer overflow-hidden"
      />

      {/* Navigation Links */}
      <div className="flex space-x-8 text-md text-gray-700">
        <button
          onClick={() => navigate("/aboutus")}
          className="font-bold text-xl cursor-pointer hover:scale-110 transition duration-300 ease-in-out"
        >
          About us
        </button>
        <button
          onClick={() => navigate("/userprofile")}
          className="font-bold text-xl cursor-pointer hover:scale-110 transition duration-300 ease-in-out"
        >
          Profile
        </button>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 text-xl bg-[#f9a08a] text-black font-bold rounded-md cursor-pointer hover:scale-110 transition duration-300 ease-in-out"
        >
          Login
        </button>
      </div>
    </div>
  );
}
