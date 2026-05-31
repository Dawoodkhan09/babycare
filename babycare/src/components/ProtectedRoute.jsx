import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = null }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Loading state — abhi check ho raha hai
  if (loading) {
    return (
      <div style={styles.loading}>
        <div className="bc-spinner" style={{ width: 40, height: 40 }} />
        <p>Loading...</p>
      </div>
    );
  }

  // Not logged in → Login page pe bhejo
  // Saath mein "from" save karo — login ke baad wapas yahin le aayenge
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check (agar allowedRoles diya hai)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={styles.unauthorized}>
        <h2>🚫 Access Denied</h2>
        <p>Aap ko iss page ka access nahi hai.</p>
        <p>Required role: {allowedRoles.join(", ")}</p>
        <p>Your role: {user.role}</p>
      </div>
    );
  }

  // Sab sahi hai → page render karo
  return children;
}

const styles = {
  loading: {
    minHeight: "60vh",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: 16, color: "#5a7a6a",
  },
  unauthorized: {
    minHeight: "60vh",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    textAlign: "center", padding: 40,
  },
};