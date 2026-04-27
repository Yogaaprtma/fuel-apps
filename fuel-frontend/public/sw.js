// Service Worker untuk FDS Push Notifications
// File ini harus ada di: fuel-frontend/public/sw.js

const CACHE_NAME = 'fds-cache-v1';

// Handle push events dari server
self.addEventListener('push', function(event) {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body:    data.body  || 'Ada update pengiriman',
    icon:    data.icon  || '/vite.svg',
    badge:   data.badge || '/vite.svg',
    vibrate: [200, 100, 200],
    tag:     'fds-notification',
    renotify: true,
    data:    data.data  || {},
    actions: [
      { action: 'view', title: '👁 Lihat Detail' },
      { action: 'close', title: '✕ Tutup' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Fuel Delivery System', options)
  );
});

// Handle klik notifikasi
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'close') return;

  const deliveryId = event.notification.data?.delivery_id;
  const url = deliveryId ? `/deliveries/${deliveryId}` : '/deliveries';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Cek apakah ada tab yang sudah buka app
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Buka tab baru jika belum ada
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Background sync (opsional untuk future use)
self.addEventListener('sync', function(event) {
  console.log('[SW] Background sync:', event.tag);
});
