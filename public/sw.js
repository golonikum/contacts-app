const CACHE_NAME = "contacts-app-v1";
const urlsToCache = [
  "/",
  "/contacts",
  "/events",
  "/manifest.json",
  "/icon.svg",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/_next/static/css/app/layout.css",
  "/_next/static/chunks/webpack.js",
  "/_next/static/chunks/main-app.js",
  "/_next/static/chunks/app/_not-found.js",
  "/_next/static/chunks/app/contacts/page.js",
  "/_next/static/chunks/app/events/page.js"
];

// Install event - cache resources
self.addEventListener("install", (event) => {
  console.log("Service Worker installing");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker caching files");
        // Используем Promise.allSettled для обработки каждого ресурса отдельно
        return Promise.allSettled(
          urlsToCache.map(url => {
            return cache.add(url).catch(error => {
              console.error(`Failed to cache ${url}:`, error);
              return null;
            });
          })
        );
      })
      .then(() => {
        console.log("Service Worker installed");
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For API requests, try network first
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ error: "Network request failed. You appear to be offline." }),
          { status: 408, headers: { "Content-Type": "application/json" } }
        );
      })
    );
    return;
  }

  // For HTML pages, always try network first, then fallback to cache
  if (event.request.headers.get("accept").includes("text/html")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If request succeeds, clone it and store in cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating");
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log("Service Worker deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log("Service Worker activated");
      // Take control of all pages
      return self.clients.claim();
    })
  );
});
