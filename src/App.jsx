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
import ReportPage from "./Pages/ReportPage";
import { VideoCall } from "./Components/VideoCall";
import DoctorProfile from "./Pages/DoctorProfile";
import Forum from "./Pages/Forum";
import Community from "./Pages/Community";
import CheckPatient from "./Pages/CheckPatient";
import AboutUs from "./Pages/AboutUs";

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
        <Route path="/checkpatient/:patientID" element={<CheckPatient />} />
        <Route path="/doctorprofile" element={<DoctorProfile />} />
        <Route path="/uploadmedicalrecord" element={<UploadMedicalRecord />} />
        <Route path="/emergency" element={<Emergency />}></Route>
        <Route path="/reportpage/:reportId" element={<ReportPage />} />
        <Route path="/videocall" element={<VideoCall />} />
        <Route path="/doctorprofile" element={<DoctorProfile />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/aboutus" element={<AboutUs />}></Route>
        <Route path="/community" element={<Community />} />
      </Routes>
    </Router>
  );
}

export default App;
