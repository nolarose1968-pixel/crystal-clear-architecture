// service-worker.js
const CACHE_NAME = 'token-service-cache-v1';
const OFFLINE_TOKEN_PAGE = '/offline-token.html';

// Install event - cache the offline token page
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.add(OFFLINE_TOKEN_PAGE);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Fetch event - handle token endpoint requests
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/api/v1/token')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match(OFFLINE_TOKEN_PAGE);
                })
        );
    }
});
