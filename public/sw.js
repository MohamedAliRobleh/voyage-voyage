// Minimal service worker — enables PWA install
const CACHE = "vv-admin-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(["/admin", "/images/pics/logo/logovoyage.webp"])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", () => self.clients.claim());

self.addEventListener("fetch", (e) => {
  // Only intercept admin pages
  if (e.request.url.includes("/admin")) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match("/admin"))
    );
  }
});
