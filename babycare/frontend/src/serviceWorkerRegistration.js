/**
 * BabyCare Service Worker Registration
 *
 * Registers the service worker for PWA functionality.
 * Handles update detection and prompts the user to refresh.
 *
 * Usage in src/index.js:
 *   import { registerSW } from "./serviceWorkerRegistration";
 *   registerSW();
 */

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    window.location.hostname === "[::1]" ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/)
);

export function registerSW(config = {}) {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    // Wait for window load to avoid blocking initial render
    window.addEventListener("load", () => {
      const swUrl = `${process.env.PUBLIC_URL || ""}/sw.js`;

      if (isLocalhost) {
        // Check if SW exists before registering (avoids 404 errors in dev)
        checkValidSW(swUrl, config);
      } else {
        registerValidSW(swUrl, config);
      }
    });
  } else if ("serviceWorker" in navigator && config.devMode) {
    // Optional: register in dev mode (for testing)
    window.addEventListener("load", () => {
      const swUrl = `${process.env.PUBLIC_URL || ""}/sw.js`;
      registerValidSW(swUrl, config);
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log("[PWA] Service worker registered:", registration.scope);

      registration.onupdatefound = () => {
        const installing = registration.installing;
        if (!installing) return;

        installing.onstatechange = () => {
          if (installing.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // New version available
              console.log("[PWA] New content available; refresh required.");
              if (config.onUpdate) config.onUpdate(registration);
            } else {
              // First install — content is cached for offline use
              console.log("[PWA] Content cached for offline use.");
              if (config.onSuccess) config.onSuccess(registration);
            }
          }
        };
      };
    })
    .catch((err) => {
      console.error("[PWA] Service worker registration failed:", err);
    });
}

function checkValidSW(swUrl, config) {
  fetch(swUrl, { headers: { "Service-Worker": "script" } })
    .then((response) => {
      const contentType = response.headers.get("content-type");
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf("javascript") === -1)
      ) {
        // No SW found — unregister any existing
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => window.location.reload());
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log("[PWA] Offline mode: no internet connection.");
    });
}

export function unregisterSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => registration.unregister())
      .catch((err) => console.error("[PWA] Unregister failed:", err));
  }
}
