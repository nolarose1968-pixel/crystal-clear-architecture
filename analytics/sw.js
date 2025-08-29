/**
 * Fire22 Analytics Dashboard Service Worker
 *
 * Progressive Web App features for offline access and caching
 */

const CACHE_NAME = "fire22-analytics-v1.0.0";
const API_CACHE_NAME = "fire22-api-cache-v1.0.0";

// Files to cache immediately
const STATIC_CACHE_URLS = [
  "/analytics/",
  "/analytics/index.html",
  "/analytics/analytics.css",
  "/analytics/analytics.js",
  "/analytics/config.js",
  "/analytics/manifest.json",
  "/terminal-framework.css",
  "/performance-dashboard.html",
];

// API endpoints to cache
const API_ENDPOINTS = [
  "/api/dashboard/metrics",
  "/api/dashboard/analytics",
  "/api/dashboard/health",
  "/api/dashboard/performance",
];

/**
 * Install Event - Cache static assets
 */
self.addEventListener("install", (event) => {
  console.log("🔧 Installing Fire22 Analytics Service Worker...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("📦 Caching static assets...");
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log("✅ Static assets cached successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("❌ Failed to cache static assets:", error);
      }),
  );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener("activate", (event) => {
  console.log("🚀 Activating Fire22 Analytics Service Worker...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log("🗑️ Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log("✅ Service Worker activated successfully");
        return self.clients.claim();
      }),
  );
});

/**
 * Fetch Event - Handle requests with caching strategy
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (isStaticAsset(request.url)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Default network-first strategy for other requests
  event.respondWith(handleNetworkFirst(request));
});

/**
 * Check if request is for API endpoints
 */
function isApiRequest(url) {
  return API_ENDPOINTS.some((endpoint) => url.pathname.includes(endpoint));
}

/**
 * Check if request is for static assets
 */
function isStaticAsset(url) {
  const staticExtensions = [
    ".css",
    ".js",
    ".png",
    ".jpg",
    ".jpeg",
    ".svg",
    ".ico",
    ".woff",
    ".woff2",
  ];
  return (
    staticExtensions.some((ext) => url.includes(ext)) ||
    STATIC_CACHE_URLS.includes(url)
  );
}

/**
 * Handle API requests with network-first strategy
 */
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());

      return networkResponse;
    }
  } catch (error) {
    console.log("🌐 Network failed for API request, trying cache:", error);
  }

  // Fallback to cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log("📦 Serving API response from cache");
    return cachedResponse;
  }

  // Return offline fallback for API
  return new Response(
    JSON.stringify({
      error: "Offline",
      message:
        "You are currently offline. Please check your internet connection.",
      offline: true,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 503,
      headers: { "Content-Type": "application/json" },
    },
  );
}

/**
 * Handle static asset requests with cache-first strategy
 */
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error("Failed to fetch static asset:", error);

    // Return offline fallback for HTML pages
    if (request.headers.get("accept").includes("text/html")) {
      const cache = await caches.open(CACHE_NAME);
      const fallbackResponse = await cache.match("/analytics/index.html");
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }

    return new Response("Offline - Asset not available", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

/**
 * Handle other requests with network-first strategy
 */
async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log("🌐 Network failed, trying cache:", error);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      const cache = await caches.open(CACHE_NAME);
      const offlineResponse = await cache.match("/analytics/index.html");
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    return new Response("Offline - Content not available", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

/**
 * Background Sync for offline actions
 */
self.addEventListener("sync", (event) => {
  console.log("🔄 Background sync triggered:", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(syncOfflineData());
  }
});

/**
 * Sync offline data when connection is restored
 */
async function syncOfflineData() {
  console.log("📤 Syncing offline data...");

  try {
    // Get stored offline actions
    const offlineActions = await getOfflineActions();

    for (const action of offlineActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });
        console.log("✅ Synced offline action:", action.id);
      } catch (error) {
        console.error("❌ Failed to sync offline action:", action.id, error);
      }
    }

    // Clear synced actions
    await clearOfflineActions();

    // Notify clients
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETE",
        message: "Offline data synced successfully",
      });
    });
  } catch (error) {
    console.error("❌ Background sync failed:", error);
  }
}

/**
 * Push Notifications
 */
self.addEventListener("push", (event) => {
  console.log("🔔 Push notification received:", event);

  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: "/analytics/icons/icon-192x192.png",
    badge: "/analytics/icons/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: [
      {
        action: "view",
        title: "View Dashboard",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || "Fire22 Analytics",
      options,
    ),
  );
});

/**
 * Notification Click Handler
 */
self.addEventListener("notificationclick", (event) => {
  console.log("🔔 Notification clicked:", event);

  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  // Open dashboard
  event.waitUntil(clients.openWindow("/analytics/index.html"));
});

/**
 * Message Handler for client communication
 */
self.addEventListener("message", (event) => {
  console.log("💬 Message received from client:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({
      version: "1.0.0",
      cacheName: CACHE_NAME,
    });
  }
});

/**
 * Offline Data Storage Helpers
 */
async function getOfflineActions() {
  // In a real implementation, this would use IndexedDB
  // For now, return empty array
  return [];
}

async function clearOfflineActions() {
  // Clear offline actions from storage
  console.log("🧹 Cleared offline actions");
}

/**
 * Periodic Background Sync (if supported)
 */
if ("periodicSync" in self.registration) {
  self.registration.periodicSync
    .register("analytics-sync", {
      minInterval: 24 * 60 * 60 * 1000, // 24 hours
    })
    .then(() => {
      console.log("⏰ Periodic sync registered");
    })
    .catch((error) => {
      console.log("❌ Periodic sync not supported:", error);
    });
}

console.log("🔥 Fire22 Analytics Service Worker loaded successfully");
