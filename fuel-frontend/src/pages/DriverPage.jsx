import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, MapPin, Camera, Navigation, Loader2, Package, Signal, RefreshCw, Clock, Route } from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import useAuthStore from '../store/authStore';
import { trackingApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PhotoUpload from '../components/PhotoUpload';
import StatusUpdatePanel from '../components/StatusUpdatePanel';
import MultiDeliveryRoute from '../components/MultiDeliveryRoute';
import useTheme from '../hooks/useTheme';
import toast from 'react-hot-toast';

const ACTIVE_STATUSES = ['PACKED', 'IN_TRANSIT', 'NEAR_DESTINATION', 'DELIVERED'];

export default function DriverPage() {
  const { deliveries, fetchDeliveries, loading } = useDeliveryStore();
  const { user }                                 = useAuthStore();
  const [tracking,        setTracking]        = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [position,        setPosition]        = useState(null);
  const [gpsAccuracy,     setGpsAccuracy]     = useState(null);
  const [expandedId,      setExpandedId]      = useState(null);
  const [driverView,      setDriverView]      = useState('active'); // 'active' | 'route'
  const { isDark } = useTheme();
  const watchId = React.useRef(null);

  useEffect(() => {
    fetchDeliveries({});
    return () => stopTracking();
  }, []);

  const activeDeliveries = (deliveries ?? []).filter(d => ACTIVE_STATUSES.includes(d.status));

  const startTracking = (delivery) => {
    if (!navigator.geolocation) { toast.error('Browser tidak mendukung GPS'); return; }
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
            latitude, longitude, accuracy, speed: speed ?? 0, heading: heading ?? 0,
          });
        } catch (e) {
          console.warn('Tracking send error:', e.message);
        }
      },
      (err) => { toast.error('GPS error: ' + err.message); stopTracking(); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  };

  const stopTracking = () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
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
          <h1 className="page-title">Panel Driver</h1>
          <p className="page-subtitle">Halo, {user?.name} 👋</p>
        </div>
        <button onClick={() => fetchDeliveries({})} className="btn-ghost p-2.5" id="refresh-driver">
          <RefreshCw size={17} className={loading ? 'animate-spin text-blue-500' : 'text-slate-400'} />
        </button>
      </div>

      {/* GPS Status Card */}
      <div className="card"
        style={tracking
          ? { borderColor: 'var(--success)', background: 'rgba(16, 185, 129, 0.05)' }
          : {}
        }>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: tracking ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-muted)',
                border: `1px solid ${tracking ? 'var(--success)' : 'var(--border-main)'}`,
              }}>
              <Signal size={20} style={{ color: tracking ? 'var(--success)' : 'var(--text-dim)' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>GPS Tracking</p>
                {tracking && <div className="live-dot w-2 h-2" />}
              </div>
              <p className="text-xs mt-0.5 text-slate-400 font-mono">
                {tracking
                  ? position
                    ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)} · ±${gpsAccuracy}m`
                    : 'Mencari sinyal GPS...'
                  : 'Tidak aktif — tekan tombol untuk mulai'
                }
              </p>
            </div>
          </div>
          {tracking && (
            <button onClick={stopTracking}
              className="btn-danger text-xs px-3 py-1.5"
              id="stop-tracking">
              Stop GPS
            </button>
          )}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--bg-muted)' }}>
        <button
          onClick={() => setDriverView('active')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            driverView === 'active'
              ? 'shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
          style={{ 
            background: driverView === 'active' ? 'var(--bg-card)' : 'transparent',
            color: driverView === 'active' ? 'var(--primary)' : 'var(--text-muted)'
          }}
        >
          <Package size={13} /> Aktif ({activeDeliveries.length})
        </button>
        <button
          onClick={() => setDriverView('route')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            driverView === 'route'
              ? 'shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
          style={{ 
            background: driverView === 'route' ? 'var(--bg-card)' : 'transparent',
            color: driverView === 'route' ? 'var(--primary)' : 'var(--text-muted)'
          }}
        >
          <Route size={13} /> Rute Pengiriman
        </button>
      </div>

      {/* Multi-delivery Route View */}
      {driverView === 'route' && <MultiDeliveryRoute />}

      {/* Active Deliveries */}
      {driverView === 'active' && <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm" style={{ color: isDark ? '#F1F5F9' : '#0F172A' }}>Pengiriman Aktif</h2>
          <span className="badge badge-orange">{activeDeliveries.length} delivery</span>
        </div>

        {activeDeliveries.length === 0 ? (
          <div className="card py-14 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Truck size={26} className="text-slate-300" />
            </div>
            <p className="font-medium text-sm text-slate-400">Tidak ada pengiriman aktif</p>
            <p className="text-xs mt-1 text-slate-300">
              Pengiriman muncul ketika status Packed / In Transit / Near Destination
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeDeliveries.map(d => {
              const isCurrentTracking = tracking && currentDelivery?.id === d.id;
              const isExpanded = expandedId === d.id;

              return (
                <div key={d.id} className="card space-y-4"
                  style={isCurrentTracking
                    ? { borderColor: '#A7F3D0', background: 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)' }
                    : {}
                  }>

                  {/* Delivery header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono font-bold" style={{ color: isDark ? '#F1F5F9' : '#0F172A' }}>{d.delivery_code}</p>
                      <p className="text-sm mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{d.customer_name}</p>
                    </div>
                    <StatusBadge status={d.status} pulse />
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                    style={{ background: isDark ? '#431407' : '#FFF7ED', border: `1px solid ${isDark ? '#7c2d12' : '#FED7AA'}` }}>
                    <MapPin size={13} className="mt-0.5 flex-shrink-0" style={{ color: '#F97316' }} />
                    <span className="text-xs" style={{ color: isDark ? '#fed7aa' : '#EA580C' }}>{d.destination_address}</span>
                  </div>

                  {/* Fuel info */}
                  <div className="flex gap-6 text-xs">
                    <div>
                      <p className="text-slate-400 mb-0.5">BBM</p>
                      <p className="font-semibold" style={{ color: isDark ? '#F1F5F9' : '#334155' }}>{d.fuel_type?.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-0.5">Volume</p>
                      <p className="font-mono font-semibold" style={{ color: isDark ? '#F1F5F9' : '#334155' }}>{d.volume_liters}L</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!tracking ? (
                      <button onClick={() => startTracking(d)}
                        className="btn-success flex-1 text-sm"
                        id={`start-tracking-${d.id}`}>
                        <Navigation size={15} /> Mulai GPS Tracking
                      </button>
                    ) : isCurrentTracking ? (
                      <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold"
                        style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669' }}>
                        <div className="live-dot w-2 h-2" />
                        GPS Aktif & Tracking
                      </div>
                    ) : null}

                    <Link to={`/deliveries/${d.id}`}
                      className="btn-secondary text-sm px-4"
                      id={`detail-${d.id}`}>
                      Detail
                    </Link>
                  </div>

                  {/* Status update — kirim posisi GPS aktif agar tidak konflik */}
                  <StatusUpdatePanel
                    delivery={d}
                    onUpdated={() => fetchDeliveries({})}
                    currentPosition={isCurrentTracking ? position : null}
                  />

                  {/* Bug 4 fix: shortcut POD dari driver panel */}
                  {d.status === 'DELIVERED' && (
                    <Link
                      to={`/deliveries/${d.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}
                    >
                      <span>✍️</span> Isi Bukti Penerimaan (Tanda Tangan)
                    </Link>
                  )}

                  {/* Toggle photo upload */}
                  <div>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : d.id)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                    >
                      <Camera size={12} />
                      {isExpanded ? 'Tutup upload foto' : 'Upload foto pengiriman'}
                    </button>
                    {isExpanded && (
                      <div className="mt-3 animate-slide-down">
                        <PhotoUpload deliveryId={d.id} compact onUploaded={() => {}} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>}
    </div>
  );
}