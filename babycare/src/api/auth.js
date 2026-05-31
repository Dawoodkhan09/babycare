// ═══════════════════════════════════════════════════════════
// Authentication API Calls
// ═══════════════════════════════════════════════════════════

import api from "./axios";


// ─── REGISTER (Parent) ───
export const registerUser = async (userData) => {
  // userData = { email, password, first_name, last_name, phone }
  const response = await api.post("/auth/register/", userData);
  
  // Tokens automatically save karo
  if (response.data.tokens) {
    localStorage.setItem("access_token",  response.data.tokens.access);
    localStorage.setItem("refresh_token", response.data.tokens.refresh);
    localStorage.setItem("user",          JSON.stringify(response.data.user));
  }
  
  return response.data;
};


// ─── LOGIN ───
export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login/", { email, password });
  
  // Tokens save karo
  if (response.data.tokens) {
    localStorage.setItem("access_token",  response.data.tokens.access);
    localStorage.setItem("refresh_token", response.data.tokens.refresh);
    localStorage.setItem("user",          JSON.stringify(response.data.user));
  }
  
  return response.data;
};


// ─── LOGOUT ───
export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};


// ─── CURRENT USER INFO ───
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me/");
  return response.data.user;
};


// ─── HELPER: Check If User Is Logged In ───
export const isLoggedIn = () => {
  return !!localStorage.getItem("access_token");
};


// ─── HELPER: Get User From localStorage ───
export const getStoredUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// ═══════════════════════════════════════════════════════════
// PASSWORD RESET
// ═══════════════════════════════════════════════════════════

// ─── Step 1: Request OTP ───
export const requestPasswordReset = async (email) => {
  const response = await api.post("/auth/forgot-password/", { email });
  return response.data;
};

// ─── Step 2: Verify OTP ───
export const verifyResetOTP = async (email, otp_code) => {
  const response = await api.post("/auth/verify-otp/", { email, otp_code });
  return response.data;
};

// ─── Step 3: Reset password ───
export const resetPassword = async (email, otp_code, new_password) => {
  const response = await api.post("/auth/reset-password/", {
    email,
    otp_code,
    new_password,
  });
  return response.data;
};