import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaCamera } from "react-icons/fa";

const CameraComponent = ({ onCapture, onCancel }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 } 
        } 
      });
  
      streamRef.current = stream;
      setCameraActive(true); // Move this before accessing videoRef
  
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.autoplay = true;
          videoRef.current.playsInline = true;
          videoRef.current.play().catch(e => console.error("Play error:", e));
        } else {
          console.error("Video ref is not available after setting camera active");
        }
      }, 100); 
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions and try again.");
    }
  };
  

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraActive(false);
    
    if (onCancel) {
      onCancel();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Create a file from the blob
        const file = new File([blob], "captured-photo.jpg", { type: "image/jpeg" });
        
        // Stop the camera after capturing
        stopCamera();
        
        // Call the onCapture callback with the file and preview URL
        if (onCapture) {
          const previewUrl = URL.createObjectURL(blob);
          onCapture(file, previewUrl);
        }
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div>
      {cameraActive ? (
        <div className="relative">
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-96 object-cover rounded-xl shadow-md border-2 border-[#c94a4a]"
          />
          <div className="flex justify-center mt-4 space-x-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={capturePhoto}
              className="px-6 py-3 bg-gradient-to-r from-[#c94a4a] to-[#d86e6e] text-white font-medium rounded-lg flex items-center"
            >
              <FaCamera className="mr-2" /> Capture Photo
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={stopCamera}
              className="px-6 py-3 bg-gray-500 text-white font-medium rounded-lg"
            >
              Cancel
            </motion.button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <p>{error}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center mt-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={startCamera}
            className="px-6 py-3 bg-gradient-to-r from-[#c94a4a] to-[#d86e6e] text-white font-medium rounded-lg flex items-center"
          >
            <FaCamera className="mr-2" /> Turn on Camera
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default CameraComponent;