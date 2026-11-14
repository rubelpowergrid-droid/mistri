// MISTRI24 Service Worker for Offline & Background Push Notifications
const CACHE_NAME = 'mistri24-pwa-v2'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/mistri24.png',
  '/search',
  '/categories',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {})
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Network-first with cache fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)

  // Do not cache API requests, auth, admin or dynamic onboarding pages
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/register') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/onboarding')
  ) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse
          if (event.request.mode === 'navigate') {
            return caches.match('/')
          }
        })
      })
  )
})

// ── Background Web Push Handler (Works when screen is OFF) ────────────────────
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (e) {
    try {
      data = { title: 'mistri24 - নতুন বিজ্ঞপ্তি', body: event.data ? event.data.text() : '' }
    } catch {}
  }

  const title = data.title || '🔔 mistri24 - নতুন বুকিং অনুরোধ!'
  const body =
    data.body ||
    'আপনার জন্য নতুন একটি কাজের বুকিং এসেছে। বিস্তারিত দেখতে এখানে চাপ দিন।'

  const options = {
    body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-192x192.png',
    vibrate: [400, 150, 400, 150, 600],
    tag: data.tag || `mistri-alert-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || '/mistri/profile',
      timestamp: Date.now(),
    },
    actions: [
      { action: 'open', title: '👁️ বিস্তারিত দেখুন' },
    ],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// ── Notification Click Handler ───────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/mistri/profile'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus and navigate it
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url && client.url.includes(targetUrl)) {
            return client.focus()
          }
          if ('navigate' in client) {
            client.navigate(targetUrl)
            return client.focus()
          }
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
