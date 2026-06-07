const CACHE_NAME = 'pwa-studio-cache-v1';
const OFFLINE_URL = '/';

// Core assets to cache immediately on worker install
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css'
];

// Service Worker Install State
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install Event starting...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching core offline assets');
      return cache.addAll(CORE_ASSETS);
    }).then(() => {
      console.log('[Service Worker] Pre-caching completed successfully.');
      return self.skipWaiting();
    })
  );
});

// Service Worker Activation State
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation Event starting...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Cleaning up deprecated cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Now fully active and controlling pages.');
      return self.clients.claim();
    })
  );
});

// Intercept Fetch Requests for Offline Support
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and local/same-site HTTP requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch a fresh version in the background to update cache (Stale-While-Revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Silence network fetch errors when offline during background revalidation
          });

        return cachedResponse;
      }

      // Fallback to network if not in cache
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // Cache newly fetched same-origin resource
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch((error) => {
          console.log('[Service Worker] Fetch failed, client offline. Attempting offline fallback:', error);
          
          // For navigation/page loading requests, fallback to root OFFLINE_URL
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          
          return new Response('Network error occurred. App is working offline.', {
            status: 408,
            statusText: 'Network Connect Timeout',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        });
    })
  );
});
