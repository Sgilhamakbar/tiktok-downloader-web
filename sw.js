const CACHE_NAME = 'tiktok-app-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png'
];

// Saat aplikasi diinstal pertama kali, simpan file penting
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Saat aplikasi dibuka, ambil dari cache dulu biar cepat
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});