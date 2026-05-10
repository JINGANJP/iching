// Service Worker for I Ching Divination App
const CACHE_NAME = 'iching-v2';

const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/iching-data.js',
  '/app.js',
  '/js/settings.js',
  '/js/advice-engine.js',
  '/js/api-client.js',
  '/icon.svg',
  '/manifest.json'
];

// Install: cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
