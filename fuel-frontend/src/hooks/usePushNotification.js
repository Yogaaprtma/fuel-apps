import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

/**
 * Hook untuk mengelola browser push notification subscription
 * Gunakan di AppLayout atau App.jsx agar aktif di seluruh app
 */
export default function usePushNotification() {
  const [permission, setPermission] = useState(Notification.permission);
  const [subscribed, setSubscribed]  = useState(false);

  useEffect(() => {
    // Register service worker saat app load
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('[Push] Service Worker registered');
          // Cek apakah sudah subscribe
          return reg.pushManager.getSubscription();
        })
        .then(sub => {
          if (sub) setSubscribed(true);
        })
        .catch(err => console.warn('[Push] SW registration failed:', err));
    }
  }, []);

  const subscribe = async () => {
    if (!('serviceWorker' in navigator)) {
      toast.error('Browser tidak mendukung push notification');
      return;
    }

    try {
      // Minta izin
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        toast.error('Izin notifikasi ditolak');
        return;
      }

      // Ambil VAPID public key dari backend
      const { data } = await api.get('/push/vapid-key');
      if (!data.public_key) {
        toast('Push notification belum dikonfigurasi admin', { icon: 'ℹ️' });
        return;
      }

      const sw  = await navigator.serviceWorker.ready;
      const sub = await sw.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(data.public_key),
      });

      const subJson = sub.toJSON();
      await api.post('/push/subscribe', {
        endpoint:    subJson.endpoint,
        p256dh_key: subJson.keys.p256dh,
        auth_key:   subJson.keys.auth,
      });

      setSubscribed(true);
      toast.success('🔔 Notifikasi berhasil diaktifkan!');
    } catch (err) {
      console.error('[Push]', err);
      toast.error('Gagal mengaktifkan notifikasi');
    }
  };

  const unsubscribe = async () => {
    try {
      const sw  = await navigator.serviceWorker.ready;
      const sub = await sw.pushManager.getSubscription();
      if (sub) {
        await api.post('/push/unsubscribe', { endpoint: sub.endpoint });
        await sub.unsubscribe();
      }
      setSubscribed(false);
      toast.success('Notifikasi dinonaktifkan');
    } catch (err) {
      toast.error('Gagal menonaktifkan notifikasi');
    }
  };

  return { permission, subscribed, subscribe, unsubscribe };
}

// Helper: konversi VAPID public key dari base64 ke Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = window.atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}
