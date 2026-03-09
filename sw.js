const CACHE_NAME = "calculomargem-v2";

const FILES_TO_CACHE = [
  "./",
  "./login.html",
  "./menu.html",
  "./margem.html",
  "./cotacao.html",
  "./style.css",
  "./login.css",
  "./menu.css",
  "./script.js",
  "./cotacao.js",
  "./js/auth.js",
  "./js/app.js",
  "./favicon.ico",
  "./icon-192.png",
  "./icon-512.png",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
