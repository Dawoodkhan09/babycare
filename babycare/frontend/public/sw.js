/**
 * BabyCare PWA Service Worker
 *
 * Strategy:
 * - Cache-first for static assets (CSS, JS, images, icons)
 * - Network-first for API calls (with offline fallback)
 * - Stale-while-revalidate for pages (HTML)
 */

const CACHE_VERSION = "babycare-v1.0.0";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Assets to precache on install
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/favicon-32.png",
];

// API endpoint base — adjust if needed
const API_BASE = "/api/";

// ─────────────────────────────────────────────
// INSTALL — Precache static assets
// ─────────────────────────────────────────────
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Precaching static assets");
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ─────────────────────────────────────────────
// ACTIVATE — Clean up old caches
// ─────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !name.startsWith(CACHE_VERSION))
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ─────────────────────────────────────────────
// FETCH — Routing strategies
// ─────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests (POST/PUT/DELETE go to network)
  if (request.method !== "GET") return;

  // Ignore Chrome extensions and other schemes
  if (!url.protocol.startsWith("http")) return;

  // Strategy 1: API requests — network-first
  if (url.pathname.startsWith(API_BASE) || url.pathname.includes("/api/")) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Strategy 2: Images — cache-first
  if (request.destination === "image") {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  // Strategy 3: Static assets (CSS, JS, fonts) — cache-first
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font"
  ) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  // Strategy 4: Navigation (HTML pages) — stale-while-revalidate
  if (request.mode === "navigate") {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // Default: try network, fall back to cache
  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

// ─────────────────────────────────────────────
// STRATEGIES
// ─────────────────────────────────────────────

// Cache-first: try cache, fall back to network
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.warn("[SW] Cache-first failed:", request.url);
    throw err;
  }
}

// Network-first: try network, fall back to cache
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) {
      console.log("[SW] Serving from cache (offline):", request.url);
      return cached;
    }
    // Return offline fallback for API failures
    return new Response(
      JSON.stringify({ error: "Offline — no cached data" }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Stale-while-revalidate: serve from cache while updating
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached || caches.match("/"));

  return cached || fetchPromise;
}

// ─────────────────────────────────────────────
// MESSAGE HANDLER — Allow clients to trigger updates
// ─────────────────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
