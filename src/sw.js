import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

// Take control immediately when updated
self.skipWaiting();
clientsClaim();

// Precache all assets injected by vite-plugin-pwa at build time
// The __WB_MANIFEST placeholder is replaced with the full asset list
precacheAndRoute(self.__WB_MANIFEST);

// Remove caches from old versions
cleanupOutdatedCaches();

// Respond to navigation requests with index.html (SPA fallback)
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).catch(() =>
          caches.match('index.html')
        );
      })
    );
  }
});
