import { useEffect, useState, useRef } from 'react';
import { deliveryApi } from '../services/api';

/**
 * Hook untuk in-app notification badge
 * Poll setiap 30 detik untuk cek delivery baru / status urgent
 */
export default function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [urgentDeliveries, setUrgentDeliveries] = useState([]);
  const lastCheckedRef = useRef(Date.now());

  const checkNotifications = async () => {
    try {
      const { data } = await deliveryApi.list({ per_page: 50 });
      const deliveries = data.data || data || [];

      // Hitung pengiriman urgent (NEAR_DESTINATION / DELIVERED / CREATED > 2 jam)
      const urgent = deliveries.filter(d => {
        if (['NEAR_DESTINATION', 'DELIVERED'].includes(d.status)) return true;
        if (d.status === 'CREATED') {
          const created = new Date(d.created_at);
          const hoursOld = (Date.now() - created.getTime()) / (1000 * 60 * 60);
          return hoursOld > 2;
        }
        return false;
      });

      setUrgentDeliveries(urgent);
      setUnreadCount(urgent.length);
    } catch (err) {
      // Gagal poll — tidak masalah
    }
  };

  useEffect(() => {
    checkNotifications();
    const interval = setInterval(checkNotifications, 30000); // poll setiap 30 detik
    return () => clearInterval(interval);
  }, []);

  const clearNotifications = () => setUnreadCount(0);

  return { unreadCount, urgentDeliveries, clearNotifications };
}
