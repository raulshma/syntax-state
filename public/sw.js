// Service Worker for PWA support
const CACHE_NAME = "mylearningprep-v1";
const LESSONS_CACHE_NAME = "mylearningprep-lessons-v1";
const JOURNEYS_CACHE_NAME = "mylearningprep-journeys-v1";

// Static assets to precache on install
const PRECACHE_ASSETS = [
  "/",
  "/favicon.ico",
  "/favicon-16x16.png",
  "/favicon-32x32.png",
  "/apple-touch-icon.png",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
];

// Cacheable API routes - static content only (no user data)
const CACHEABLE_API_PATTERNS = [
  "/api/lessons/content", // MDX lesson content
  "/api/journeys", // Journey structure (nodes, edges, milestones, topics, objectives)
];

// Install event - precache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  const currentCaches = [CACHE_NAME, LESSONS_CACHE_NAME, JOURNEYS_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - stale-while-revalidate for static assets, network-first for API
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip auth routes - always network
  if (url.pathname.startsWith("/login")) {
    return;
  }

  // Cacheable API routes - stale-while-revalidate
  // Includes: lessons content, journeys (static structure only, no user progress)
  if (CACHEABLE_API_PATTERNS.some((pattern) => url.pathname.startsWith(pattern))) {
    // Use appropriate cache based on route
    const cacheName = url.pathname.startsWith("/api/journeys")
      ? JOURNEYS_CACHE_NAME
      : LESSONS_CACHE_NAME;

    event.respondWith(
      caches.open(cacheName).then((cache) => {
        return cache.match(request).then((cached) => {
          if (cached) {
            // Return cached, update in background
            event.waitUntil(
              fetch(request)
                .then((response) => {
                  if (response.ok) {
                    cache.put(request, response.clone());
                  }
                })
                .catch(() => {})
            );
            return cached;
          }
          // Not cached, fetch and cache
          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // Other API routes - always network (no caching)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Static assets (images, fonts, icons) - cache first
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|ico|woff2?|ttf|eot)$/) ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Return cached, but update in background
          event.waitUntil(
            fetch(request).then((response) => {
              if (response.ok) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, response);
                });
              }
            })
          );
          return cached;
        }
        // Not cached, fetch and cache
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML pages - network first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.mode === "navigate") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Push notification support
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || "/android-chrome-192x192.png",
      badge: "/android-chrome-192x192.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "1",
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
