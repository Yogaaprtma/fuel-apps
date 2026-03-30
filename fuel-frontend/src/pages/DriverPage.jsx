import React, { useEffect, useState, useRef } from 'react';
import { Truck, MapPin, Camera, Navigation, Loader2, AlertCircle } from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import useAuthStore from '../store/authStore';
import { trackingApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PhotoUpload from '../components/PhotoUpload';
import StatusUpdatePanel from '../components/StatusUpdatePanel';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function DriverPage() {
    const { deliveries, fetchDeliveries } = useDeliveryStore();
    const { user } = useAuthStore();
    const [tracking, setTracking] = useState(false);
    const [currentDelivery, setCurrentDelivery] = useState(null);
    const [position, setPosition] = useState(null);
    const watchId = useRef(null);

    useEffect(() => {
        fetchDeliveries({ status: 'IN_TRANSIT' });
    }, []);

    const activeDeliveries = deliveries.filter(d =>
        ['PACKED', 'IN_TRANSIT', 'NEAR_DESTINATION'].includes(d.status)
    );

    const startTracking = (delivery) => {
        setCurrentDelivery(delivery);
        setTracking(true);

        watchId.current = navigator.geolocation.watchPosition(
            async (pos) => {
                const { latitude, longitude, accuracy, speed, heading } = pos.coords;
                setPosition({ lat: latitude, lng: longitude });

                try {
                    await trackingApi.send(delivery.id, {
                        latitude, longitude, accuracy,
                        speed: speed || 0,
                        heading: heading || 0,
                    });
                } catch (e) {
                    console.error('Tracking error:', e);
                }
            },
            (err) => toast.error('GPS error: ' + err.message),
            { 
                enableHighAccuracy: true, 
                timeout: 10000, 
                maximumAge: 5000 
            }
        );
    };

    const stopTracking = () => {
        if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
        setTracking(false);
        setCurrentDelivery(null);
        setPosition(null);
    };

    return (
        <div className="space-y-5">
            <div>
                <h1 className="font-display text-2xl font-bold text-white">Driver Panel</h1>
                <p className="text-slate-500 text-sm">Halo, {user?.name} 👋</p>
            </div>

            {/* GPS Tracking Status */}
            <div className={`card border ${tracking ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-slate-700/50'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            tracking ? 'bg-emerald-600' : 'bg-slate-700'
                        }`}>
                            <Navigation size={20} className="text-white" />
                        </div>

                        <div>
                            <p className="font-medium text-white">GPS Tracking</p>
                            <p className="text-xs text-slate-500">
                                {tracking
                                    ? `Aktif · ${position ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}` : 'Mendapat sinyal...'}`
                                    : 'Tidak aktif'}
                            </p>
                        </div>
                    </div>
                    {tracking && (
                        <button onClick={stopTracking} className="text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-900/20 transition-all">
                            Stop
                        </button>
                    )}
                </div>
            </div>

            {/* Active Deliveries */}
            <div>
                <h2 className="font-semibold text-white mb-3">Delivery Aktif</h2>
                {activeDeliveries.length === 0 ? (
                    <div className="card text-center py-10">
                        <Truck size={40} className="text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500">Tidak ada delivery aktif</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeDeliveries.map(d => (
                            <div key={d.id} className="card space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-mono font-semibold text-white">{d.delivery_code}</p>
                                        <p className="text-sm text-slate-400">{d.customer_name}</p>
                                    </div>
                                    <StatusBadge status={d.status} />
                                </div>

                                <div className="flex items-start gap-2 text-sm text-slate-400">
                                    <MapPin size={14} className="text-flame mt-0.5 flex-shrink-0" />
                                    <span>{d.destination_address}</span>
                                </div>

                                <StatusUpdatePanel delivery={d} onUpdated={() => fetchDeliveries({ status: 'IN_TRANSIT' })} />

                                <div className="flex gap-2">
                                    {!tracking ? (
                                        <button onClick={() => startTracking(d)} className="btn-primary flex-1 text-sm">
                                            <Navigation size={16} /> Mulai Tracking GPS
                                        </button>
                                    ) : currentDelivery?.id === d.id ? (
                                        <div className="flex-1 flex items-center gap-2 text-emerald-400 text-sm">
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                            GPS Aktif
                                        </div>
                                    ) : null}
                                    <Link to={`/deliveries/${d.id}`} className="btn-ghost text-sm">Detail</Link>
                                </div>

                                <PhotoUpload deliveryId={d.id} compact onUploaded={() => {}} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}