// Bump CACHE on releases that must invalidate old assets.
const CACHE = 'coffee-companion-v1'
const BASE = self.registration.scope

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll([BASE, BASE + 'manifest.webmanifest', BASE + 'icons/icon-192.png']))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return

  // Pages: network first so updates show up, cached shell when offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(BASE, copy))
          return res
        })
        .catch(() => caches.match(BASE))
    )
    return
  }

  // Assets (hashed by Vite): cache first, fill on miss.
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        })
    )
  )
})
