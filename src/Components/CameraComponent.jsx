import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

const CameraComponent = ({ onCapture, onCancel }) => {
  const webcamRef = useRef(null);
  const [capturing, setCapturing] = useState(false);

  const capture = useCallback(() => {
    setCapturing(true);
    const imageSrc = webcamRef.current.getScreenshot();
    onCapture(imageSrc);
    setCapturing(false);
  }, [onCapture]);

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-md">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="rounded-lg"
      />
      <div className="mt-4 flex gap-4">
        <button
          onClick={capture}
          className="px-4 py-2 bg-green-500 text-white rounded-md shadow-md"
        >
          {capturing ? "Capturing..." : "Capture Photo"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-400 text-white rounded-md shadow-md"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CameraComponent;
