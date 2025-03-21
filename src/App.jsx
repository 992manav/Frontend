import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import { toast, Toaster } from "react-hot-toast";
import LandingPage from "./Pages/LandingPage";
import Navbar from "./Components/Navbar";
import UserProfile from "./Pages/UserProfile";

function App() {
  return (
    <Router>
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/userprofile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
