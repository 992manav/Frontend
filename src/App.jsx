import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import { toast, Toaster } from "react-hot-toast";
import ConsultDoctor from "./Pages/ConsultDoctor";
import FirstConsult from "./Pages/FirstConsult";
import LandingPage from "./Pages/LandingPage";
import Navbar from "./Components/Navbar";
import UserProfile from "./Pages/UserProfile";
import AIDiagnose from "./Pages/AIDiagnose";
import UploadMedicalRecord from "./Pages/UploadMedicalRecord";
import Emergency from "./Pages/Emergency";

function App() {
  return (
    <Router>
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/consultdoctor" element={<ConsultDoctor />} />
        <Route path="/firstconsult" element={<FirstConsult />}></Route>
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/aidiagnose" element={<AIDiagnose />} />
        <Route path="/uploadmedicalrecord" element={<UploadMedicalRecord />} />
        <Route path="/emergency" element={<Emergency />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
