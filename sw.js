// Service worker mínimo: solo permite que el navegador ofrezca "Instalar app".
// No cachea datos de cartas (esos siempre deben venir frescos de Google Sheets).
const CACHE_NAME = "cartas-cca-shell-v1";
const SHELL_FILES = ["./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Solo el "cascarón" (HTML/manifest/íconos) se sirve desde caché si no hay red.
// Las peticiones a la API de Google Sheets NUNCA se cachean: siempre van a la red.
self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (url.includes("script.google.com")) return; // deja pasar directo a la red

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
