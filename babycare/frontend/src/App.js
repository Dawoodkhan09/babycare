import { lazy, Suspense } from "react";
import InstallPrompt from "./components/InstallPrompt";
import BottomNav from "./components/BottomNav";
import "./animations.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Eagerly loaded (critical path)
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

// Lazy loaded (reduces initial bundle)
const Symptomchecker  = lazy(() => import("./pages/Symptomchecker"));
const DoctorDashboard = lazy(() => import("./pages/DoctorDashboard"));
const About           = lazy(() => import("./pages/About"));
const DoctorRegister  = lazy(() => import("./pages/DoctorRegister"));
const UserDashboard   = lazy(() => import("./pages/UserDashboard"));
const AdminDashboard  = lazy(() => import("./pages/AdminDashboard"));
const DoctorBooking   = lazy(() => import("./pages/DoctorBooking"));
const Shop            = lazy(() => import("./pages/Shop"));
const ComplaintForm   = lazy(() => import("./pages/ComplaintForm"));
const MyComplaints    = lazy(() => import("./pages/MyComplaints"));

function PageLoader() {
  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 12,
      color: "#1a6e3f",
      fontFamily: "'Inter',sans-serif",
    }}>
      <div style={{
        width: 36, height: 36,
        border: "3px solid #e8f8ef",
        borderTop: "3px solid #1a6e3f",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

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

      <Suspense fallback={<PageLoader />}>
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
      </Suspense>

      {!hideLayout && <Footer />}
      {!hideLayout && <BottomNav />}
      <InstallPrompt />
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