import axios from "axios";

/**
 * Central API Client for BabyCare
 *
 * Smart URL Detection:
 * - Localhost (laptop): uses localhost:8000
 * - Mobile (network IP): automatically uses laptop's IP from window.location
 * - Production: uses same domain (no /api duplication)
 *
 * Yeh ek baar setup karne se sab devices pe chalega — mobile, laptop, deployed!
 */

// ─── SMART BASE URL ───
const getBaseURL = () => {
  // 1. Production override via .env file
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 2. Auto-detect based on how user accessed the frontend
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // Development: backend is on port 8000
  return `${protocol}//${hostname}:8000/api`;
};

const API_BASE = getBaseURL();
console.log("[API] Base URL:", API_BASE);

// ─── AXIOS INSTANCE ───
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── REQUEST INTERCEPTOR: Add JWT Token ───
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR: Handle 401 (token expired) ───
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const res = await axios.post(`${API_BASE}/auth/refresh/`, {
            refresh: refreshToken,
          });
          const newAccessToken = res.data.access;
          localStorage.setItem("access_token", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        // Refresh failed — logout user
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_BASE };