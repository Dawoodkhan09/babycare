// ═══════════════════════════════════════════════════════════
// Axios Configuration
// Saari API calls iss instance se honge — clean aur reusable
// ═══════════════════════════════════════════════════════════

import axios from "axios";

// Backend ka base URL
const API_URL = "http://127.0.0.1:8000/api";

// Axios instance banao
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ───
// Har request ke saath JWT token automatically attach hoga (agar login hai)
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

// ─── Response Interceptor ───
// Agar token expire ho jaye to automatic refresh karne ki koshish karega
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 = Unauthorized (token expire ho gaya)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          // Naya access token le lo
          const res = await axios.post(`${API_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = res.data.access;
          localStorage.setItem("access_token", newAccessToken);

          // Original request retry karo naye token ke saath
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh bhi fail ho gaya — logout karo
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;