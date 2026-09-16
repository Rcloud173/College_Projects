const CACHE_NAME = "pharmacy-pwa-shell-v7";
const SHELL_FILES = [
    "/",
    "/index.html",
    "/offline.html",
    "/css/site.css",
    "/js/app.js",
    "/js/medicines-data.js",
    "/js/medicine-store.js",
    "/js/search.js",
    "/js/notifications.js",
    "/manifest.json",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
    "/medicines.html",
    "/search.html",
    "/stock.html",
    "/notifications.html",
    "/dashboard.html"
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(SHELL_FILES);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.filter(function (key) {
                    return key !== CACHE_NAME;
                }).map(function (key) {
                    return caches.delete(key);
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", function (event) {
    if (event.request.method !== "GET") {
        return;
    }

    const requestUrl = new URL(event.request.url);
    if (requestUrl.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(function (cached) {
            if (cached) {
                return cached;
            }

            return fetch(event.request).catch(function () {
                if (event.request.mode === "navigate") {
                    return caches.match("/offline.html");
                }
                return caches.match("/offline.html");
            });
        })
    );
});
