import "./animations.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Symptomchecker from "./pages/Symptomchecker";
import DoctorDashboard from "./pages/DoctorDashboard";
import About from "./pages/About";
import DoctorRegister from "./pages/DoctorRegister";

import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorBooking from "./pages/DoctorBooking";
import Shop from "./pages/Shop";

import ComplaintForm from "./pages/ComplaintForm";
import MyComplaints from "./pages/MyComplaints";
import ForgotPassword from "./pages/ForgotPassword";

// ─── Yeh pages full-screen hain, inko Navbar/Footer NAHI dikhana ───
const HIDE_LAYOUT_ON = [
  "/doctordashboard",
  "/AdminDashboard",
  "/doctor-register",
];

function AppContent() {
  const location = useLocation();
  const hideLayout = HIDE_LAYOUT_ON.some((path) =>
    location.pathname.toLowerCase().startsWith(path.toLowerCase())
  );

  return (
    <>
      {!hideLayout && <Navbar />}

      <Routes>
        {/* ═══ PUBLIC ROUTES (Login nahi chahiye) ═══ */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> 
        <Route path="/about" element={<About />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/doctor-register" element={<DoctorRegister />} />

        {/* ═══ PROTECTED — KOI BHI LOGGED IN USER ═══ */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Symptomchecker"
          element={
            <ProtectedRoute>
              <Symptomchecker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/DoctorBooking"
          element={
            <ProtectedRoute>
              <DoctorBooking />
            </ProtectedRoute>
          }
        />

        {/* ═══ COMPLAINTS — User aur Doctor dono submit kar sakte hain ═══ */}
        <Route
          path="/file-complaint"
          element={
            <ProtectedRoute>
              <ComplaintForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-complaints"
          element={
            <ProtectedRoute>
              <MyComplaints />
            </ProtectedRoute>
          }
        />

        {/* ═══ PROTECTED — SIRF DOCTOR ═══ */}
        <Route
          path="/doctordashboard"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        {/* ═══ PROTECTED — SIRF ADMIN ═══ */}
        <Route
          path="/AdminDashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!hideLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;