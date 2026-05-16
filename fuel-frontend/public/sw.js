// Service Worker untuk PWA Offline & Push Notifications
const CACHE_NAME = 'fuel-ds-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/icon-192.png',
    '/icon-512.png'
];

// Install: Simpan file penting ke Cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('SW: Caching App Shell');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate: Bersihkan cache lama
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('SW: Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// Fetch: Ambil dari Cache jika Offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Jika ada di cache, kembalikan. Jika tidak, ambil dari network.
            return response || fetch(event.request).catch(() => {
                // Jika network gagal (Offline), dan ini permintaan halaman, beri fallback (opsional)
                return caches.match('/');
            });
        })
    );
});

// Handle Push Notifications
self.addEventListener('push', (event) => {
    let data = { title: 'Notifikasi FuelDS', body: 'Ada update baru!' };
    try {
        data = event.data.json();
    } catch (e) {
        console.log('Push data is not JSON');
    }

    const options = {
        body: data.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
