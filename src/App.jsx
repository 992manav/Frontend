import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import { toast, Toaster } from "react-hot-toast"; 



function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* <Route path="/" element={<LandingPage />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  )
}

export default App
