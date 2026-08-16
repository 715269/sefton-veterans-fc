// A minimal service worker. Its main job here is to satisfy the browser's
// requirement for a "controlling" service worker before it will offer the
// Add to Home Screen / install prompt. It also gives basic offline support
// by falling back to the network, then the cache.
const CACHE_NAME = 'sefton-veterans-fc-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Leave anything that isn't a same-origin GET alone. That covers the
  // Apps Script calls, which must reach the network untouched.
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      // Only serve from cache if we actually have it
      .catch(() => caches.match(event.request).then((hit) => hit || Response.error()))
  );
});
