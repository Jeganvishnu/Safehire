const CACHE_NAME = "safehire-cache-v2";
const urlsToCache = [
    "/",
    "/index.html",
    "/manifest.json",
    "/SafeHire.png"
];

self.addEventListener("install", event => {
    // Force the new service worker to become the active service worker
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Opened cache");
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("activate", event => {
    // Tell the active service worker to take control of the page immediately
    event.waitUntil(self.clients.claim());
    
    // Clear old caches to ensure users get the newest files
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log("Deleting old cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Network-first strategy: always try the network first for the most up-to-date content,
// fallback to cache only if offline or network fails.
self.addEventListener("fetch", event => {
    // Skip cross-origin requests, like those for Google Fonts or Firebase
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Update the cache with the fresh response
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Fallback to cache if network request fails (e.g. offline)
                return caches.match(event.request);
            })
    );
});
