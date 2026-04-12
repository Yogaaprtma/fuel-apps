import React, { useEffect, useState, useRef } from 'react';
import { Truck, MapPin, Camera, Navigation, Loader2, Package, AlertTriangle, Signal, RefreshCw } from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import useAuthStore from '../store/authStore';
import { trackingApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PhotoUpload from '../components/PhotoUpload';
import StatusUpdatePanel from '../components/StatusUpdatePanel';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// Bug #7 Fix: fetch semua status aktif (bukan hanya IN_TRANSIT)
const ACTIVE_STATUSES = ['PACKED', 'IN_TRANSIT', 'NEAR_DESTINATION', 'DELIVERED'];

export default function DriverPage() {
  const { deliveries, fetchDeliveries, loading } = useDeliveryStore();
  const { user } = useAuthStore();
  const [tracking, setTracking] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [position, setPosition] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const watchId = useRef(null);
  const sendInterval = useRef(null);

  useEffect(() => {
    // Bug #7 Fix: Fetch tanpa filter status agar bisa filter di sisi klien
    fetchDeliveries({});
    return () => stopTracking();
  }, []);

  const activeDeliveries = (deliveries ?? []).filter(d =>
    ACTIVE_STATUSES.includes(d.status)
  );

  const startTracking = (delivery) => {
    if (!navigator.geolocation) {
      toast.error('Browser tidak mendukung GPS');
      return;
    }
    setCurrentDelivery(delivery);
    setTracking(true);
    toast.success('GPS Tracking dimulai');

    watchId.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy, speed, heading } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        setGpsAccuracy(Math.round(accuracy));

        try {
          await trackingApi.send(delivery.id, {
            latitude, longitude, accuracy,
            speed: speed ?? 0,
            heading: heading ?? 0,
          });
        } catch (e) {
          console.warn('Tracking send error:', e.message);
        }
      },
      (err) => {
        toast.error('GPS error: ' + err.message);
        stopTracking();
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  };

  const stopTracking = () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    if (sendInterval.current) clearInterval(sendInterval.current);
    setTracking(false);
    setCurrentDelivery(null);
    setPosition(null);
    setGpsAccuracy(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Driver Panel</h1>
          <p className="page-subtitle">Halo, {user?.name} 👋</p>
        </div>
        <button onClick={() => fetchDeliveries({})} className="btn-ghost p-2.5" id="refresh-driver">
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* GPS Status Card */}
      <div className="card"
        style={tracking ? {
          borderColor: 'rgba(74,222,128,0.3)',
          background: 'rgba(74,222,128,0.04)',
        } : {}}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: tracking ? 'rgba(74,222,128,0.15)' : 'rgba(30,45,66,0.6)',
                border: `1px solid ${tracking ? 'rgba(74,222,128,0.3)' : 'rgba(30,45,66,0.8)'}`,
              }}>
              <Signal size={18} style={{ color: tracking ? '#4ade80' : '#4a6080' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-text-primary">GPS Tracking</p>
                {tracking && <div className="live-dot" style={{ width: '6px', height: '6px' }} />}
              </div>
              <p className="text-xs mt-0.5" style={{ color: '#4a6080' }}>
                {tracking
                  ? position
                    ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)} · Akurasi: ${gpsAccuracy}m`
                    : 'Mencari sinyal GPS...'
                  : 'Tidak aktif'}
              </p>
            </div>
          </div>

          {tracking && (
            <button onClick={stopTracking}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{
                color: '#f87171',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
              id="stop-tracking">
              Stop
            </button>
          )}
        </div>
      </div>

      {/* Active Deliveries */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-text-primary">Delivery Aktif</h2>
          <span className="badge-orange text-xs">{activeDeliveries.length} delivery</span>
        </div>

        {activeDeliveries.length === 0 ? (
          <div className="card py-14 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(30,45,66,0.5)', border: '1px solid rgba(30,45,66,0.8)' }}>
              <Truck size={26} style={{ color: '#2a3f5a' }} />
            </div>
            <p className="font-semibold text-sm text-text-secondary">Tidak ada delivery aktif</p>
            <p className="text-xs mt-1" style={{ color: '#4a6080' }}>
              Delivery akan muncul ketika status Packed, In Transit, atau Near Destination
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeDeliveries.map(d => (
              <div key={d.id} className="card space-y-4"
                style={currentDelivery?.id === d.id ? {
                  borderColor: 'rgba(74,222,128,0.3)',
                  background: 'rgba(74,222,128,0.03)',
                } : {}}>

                {/* Delivery header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono font-bold text-text-primary">{d.delivery_code}</p>
                    <p className="text-sm mt-0.5" style={{ color: '#8fa3bd' }}>{d.customer_name}</p>
                  </div>
                  <StatusBadge status={d.status} pulse />
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                  style={{ background: 'rgba(30,45,66,0.4)', border: '1px solid rgba(30,45,66,0.8)' }}>
                  <MapPin size={13} className="mt-0.5 flex-shrink-0" style={{ color: '#f97316' }} />
                  <span className="text-xs" style={{ color: '#8fa3bd' }}>{d.destination_address}</span>
                </div>

                {/* Fuel info */}
                <div className="flex gap-4 text-xs">
                  <div>
                    <p style={{ color: '#4a6080' }}>BBM</p>
                    <p className="font-medium text-text-primary">{d.fuel_type?.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p style={{ color: '#4a6080' }}>Volume</p>
                    <p className="font-mono font-medium text-text-primary">{d.volume_liters}L</p>
                  </div>
                </div>

                {/* Status update */}
                <StatusUpdatePanel delivery={d} onUpdated={() => fetchDeliveries({})} />

                {/* GPS + Photo actions */}
                <div className="flex gap-2">
                  {!tracking ? (
                    <button onClick={() => startTracking(d)}
                      className="btn-primary flex-1 text-sm py-2.5"
                      id={`start-tracking-${d.id}`}>
                      <Navigation size={15} /> Mulai GPS Tracking
                    </button>
                  ) : currentDelivery?.id === d.id ? (
                    <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>
                      <div className="live-dot" style={{ width: '8px', height: '8px' }} />
                      GPS Aktif & Tracking
                    </div>
                  ) : null}

                  <Link to={`/deliveries/${d.id}`}
                    className="btn-secondary text-sm py-2.5 px-4"
                    id={`detail-${d.id}`}>
                    Detail
                  </Link>
                </div>

                {/* Photo upload (compact) */}
                <PhotoUpload deliveryId={d.id} compact onUploaded={() => {}} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}