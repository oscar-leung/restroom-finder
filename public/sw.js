/* Gotta Go service worker — minimal, hand-rolled.
 *
 * Caching strategy:
 *   - HTML: network-first, fall back to cache. Lets users hot-reload
 *     to pick up new versions but still works offline.
 *   - JS / CSS / icons: cache-first. Versioned filenames mean stale
 *     cache is fine.
 *   - API responses (Refuge, OSM, NYC, SF): network-first with cache
 *     fallback. The app's own runtime cache (in restroomApi.js) handles
 *     the data layer separately; this is a belt-and-suspenders.
 *
 * Bump CACHE_VERSION when shipping a major change to force cache reset.
 */
const CACHE_VERSION = "gg-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// On install, prime the cache with the shell so the app is loadable
// the very first time a user goes offline.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll([
        "./",
        "./index.html",
        "./icon-192.svg",
        "./icon-512.svg",
        "./icon-maskable.svg",
        "./manifest.json",
      ]).catch(() => {
        // First-install on Pages can race with assets — non-fatal.
      })
    )
  );
  self.skipWaiting();
});

// On activate, nuke any old version's caches.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Routing
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // App shell HTML — network-first
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(networkFirst(req, RUNTIME_CACHE));
    return;
  }

  // Same-origin static assets — cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // Cross-origin (data APIs, tile images) — network-first with cache fallback
  if (
    url.hostname.includes("refugerestrooms.org") ||
    url.hostname.includes("overpass-api.de") ||
    url.hostname.includes("data.cityofnewyork.us") ||
    url.hostname.includes("data.sfgov.org") ||
    url.hostname.includes("openstreetmap.org") ||
    url.hostname.includes("tile.openstreetmap.org")
  ) {
    event.respondWith(networkFirst(req, RUNTIME_CACHE));
    return;
  }

  // Everything else: pass through
});

async function networkFirst(req, cacheName) {
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch (err) {
    const cached = await caches.match(req);
    if (cached) return cached;
    // Last-ditch: return the cached index.html for navigation requests
    if (req.mode === "navigate") {
      return (await caches.match("./index.html")) || Response.error();
    }
    throw err;
  }
}

async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const fresh = await fetch(req);
  if (fresh && fresh.ok) {
    const cache = await caches.open(cacheName);
    cache.put(req, fresh.clone()).catch(() => {});
  }
  return fresh;
}
