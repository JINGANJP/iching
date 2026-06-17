// Service Worker for I Ching Divination App
const CACHE_NAME = 'iching-v3';

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
  '/icons/icon-180.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/splash-1170x2532.png',
  '/icons/splash-1290x2796.png',
  '/icons/splash-750x1334.png',
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
