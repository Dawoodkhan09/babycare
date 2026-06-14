// ═══════════════════════════════════════════════════════════
// AuthContext — Global Authentication State
// Har component se user info access kar sakte hain
// ═══════════════════════════════════════════════════════════

import { createContext, useContext, useState, useEffect } from "react";
import { 
  loginUser as loginAPI, 
  registerUser as registerAPI, 
  logoutUser as logoutAPI,
  getStoredUser 
} from "../api/auth";

// Context create karo
const AuthContext = createContext(null);

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // App load hote hi check karo — localStorage mein user hai kya?
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // ─── LOGIN ───
  const login = async (email, password) => {
    const data = await loginAPI(email, password);
    setUser(data.user);                        // State update karo
    return data;
  };

  // ─── REGISTER ───
  const register = async (userData) => {
    const data = await registerAPI(userData);
    setUser(data.user);                        // State update karo
    return data;
  };

  // ─── LOGOUT ───
  const logout = () => {
    logoutAPI();                               // localStorage clear
    setUser(null);                             // State clear
  };

  // ─── Helper: Is user logged in? ───
  const isAuthenticated = !!user;

  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — easy access ke liye
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}