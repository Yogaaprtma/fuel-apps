import { useEffect } from 'react';
import echo from '../utils/echo';
import useDeliveryStore from '../store/deliveryStore';
import toast from 'react-hot-toast';

export default function RealTimeListener() {
    const { deliveries, setDeliveries, updateStatusLocally } = useDeliveryStore();

    useEffect(() => {
        console.log('Echo: Listening for deliveries...');

        const channel = echo.channel('deliveries');

        // Listener 1: Pengiriman Baru
        channel.listen('.delivery.created', (data) => {
            console.log('Echo: New Delivery Created', data);
            
            // Tambahkan ke store tanpa refresh
            useDeliveryStore.setState((state) => ({
                deliveries: [data.delivery, ...state.deliveries]
            }));

            toast.success(`Pengiriman Baru: ${data.delivery.delivery_code}`, {
                icon: '📦',
                duration: 5000
            });
        });

        // Listener 2: Update Status
        channel.listen('.status.updated', (data) => {
            console.log('Echo: Status Updated', data);
            
            // Update data di store secara lokal
            const { delivery } = data;
            useDeliveryStore.setState((state) => ({
                deliveries: state.deliveries.map(d => d.id === delivery.id ? { ...d, ...delivery } : d),
                current: state.current?.id === delivery.id ? delivery : state.current
            }));

            toast(`Status ${delivery.delivery_code} berubah ke ${delivery.status}`, {
                icon: '🔄',
                duration: 3000
            });
        });

        return () => {
            echo.leaveChannel('deliveries');
        };
    }, []);

    return null; // Komponen ini tidak merender apa pun ke layar
}
