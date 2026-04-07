const CACHE_NAME = "mundiart-v5";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./menu.html",
  "./cotacao.html",
  "./margem.html",
  "./login.html",

  "./cotacao.js",
  "./script.min.js",
  "./auth.js",

  "./style.css",
  "./menu.css",
  "./login.css",

  "./parametros.json",

  "./favicon.ico",
  "./icon-192.png",
  "./icon-512.png",

  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
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
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        return caches.match("./index.html");
      });
    })
  );
});