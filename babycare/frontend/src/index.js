import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import { registerSW } from "./serviceWorkerRegistration";

// Capture beforeinstallprompt early — before React mounts
// InstallPrompt.jsx reads window.__installPrompt on mount
window.__installPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.__installPrompt = e;
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// ─── Register Service Worker for PWA ───
// Auto-registers in production. Set { devMode: true } to also test in dev.
registerSW({
  onSuccess: () => {
    console.log("[PWA] App ready to work offline! 🎉");
  },
  onUpdate: (registration) => {
    // New version available — prompt user to refresh
    const shouldRefresh = window.confirm(
      "New version available! Refresh to update?"
    );
    if (shouldRefresh && registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  },
});