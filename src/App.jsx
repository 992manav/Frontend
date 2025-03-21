import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Login from './Pages/Login';
// import Signup from './Pages/Signup';
import { toast, Toaster } from "react-hot-toast"; 
import LandingPage from './Pages/LandingPage';
import Navbar from './Components/Navbar';



function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
<<<<<<< HEAD
      <Navbar />
=======
>>>>>>> e5c84bd37e69f51df8f1dc2e431e73a4d00ce528
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> */}
      </Routes>
    </Router>
  )
}

export default App
