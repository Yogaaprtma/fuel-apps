import React, { useEffect, useState } from 'react';
import { MapPin, Loader2, RefreshCw, Navigation, Activity } from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import DeliveryMap from '../components/DeliveryMap';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { trackingApi } from '../services/api';

export default function TrackingPage() {
  const { deliveries, fetchDeliveries, loading } = useDeliveryStore();
  const [selected, setSelected] = useState(null);
  const [locations, setLocations] = useState([]);
  const [locLoading, setLocLoading] = useState(false);

  useEffect(() => {
    fetchDeliveries({ per_page: 50 });
  }, []);

  const selectDelivery = async (d) => {
    setSelected(d);
    setLocLoading(true);
    try {
      const { data } = await trackingApi.history(d.id);
      setLocations(data.locations || []);
    } catch {
      setLocations([]);
    } finally {
      setLocLoading(false);
    }
  };

  const inTransit = (deliveries ?? []).filter(d =>
    ['IN_TRANSIT', 'NEAR_DESTINATION'].includes(d.status)
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {inTransit.length > 0 && <div className="live-dot" />}
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4a6080' }}>
              {inTransit.length > 0 ? 'Live' : 'Monitoring'}
            </span>
          </div>
          <h1 className="page-title">Live Tracking</h1>
        </div>
        <button onClick={() => fetchDeliveries({ per_page: 50 })} className="btn-ghost p-2.5" id="refresh-tracking">
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* ── Left: Delivery List ── */}
        <div className="lg:col-span-2 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#4a6080' }}>
            {inTransit.length} kendaraan aktif
          </p>

          {loading && inTransit.length === 0 ? (
            <div className="space-y-2">
              {[1,2,3].map(i => (
                <div key={i} className="skeleton rounded-2xl h-20" />
              ))}
            </div>
          ) : inTransit.length === 0 ? (
            <div className="card py-10 text-center">
              <Navigation size={32} className="mx-auto mb-3" style={{ color: '#2a3f5a' }} />
              <p className="text-sm font-medium" style={{ color: '#4a6080' }}>Tidak ada delivery dalam perjalanan</p>
            </div>
          ) : inTransit.map(d => (
            <button
              key={d.id}
              onClick={() => selectDelivery(d)}
              className="w-full text-left card transition-all duration-200"
              id={`track-select-${d.id}`}
              style={selected?.id === d.id ? {
                borderColor: 'rgba(249,115,22,0.4)',
                background: 'rgba(249,115,22,0.04)',
              } : {}}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold text-text-primary">{d.delivery_code}</span>
                <StatusBadge status={d.status} pulse />
              </div>
              <p className="text-xs truncate" style={{ color: '#8fa3bd' }}>{d.customer_name}</p>
              <div className="flex items-start gap-1 mt-1.5">
                <MapPin size={11} className="flex-shrink-0 mt-0.5" style={{ color: '#f97316' }} />
                <p className="text-[11px] line-clamp-2" style={{ color: '#4a6080' }}>{d.destination_address}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── Right: Map ── */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl overflow-hidden"
            style={{
              height: 480,
              border: '1px solid rgba(30,45,66,0.8)',
              background: 'rgba(13,20,36,0.8)',
            }}>
            {locLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <Loader2 size={28} className="animate-spin" style={{ color: '#f97316' }} />
                <p className="text-sm" style={{ color: '#4a6080' }}>Memuat data lokasi...</p>
              </div>
            ) : selected ? (
              <DeliveryMap delivery={selected} locations={locations} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center"
                style={{ background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.03), transparent 70%)' }}>
                <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center"
                  style={{
                    background: 'rgba(249,115,22,0.08)',
                    border: '1px solid rgba(249,115,22,0.15)',
                  }}>
                  <Activity size={28} style={{ color: '#f97316' }} />
                </div>
                <p className="font-semibold text-sm" style={{ color: '#4a6080' }}>Pilih delivery untuk melihat map</p>
                <p className="text-xs mt-1" style={{ color: '#2a3f5a' }}>Klik salah satu delivery di kiri</p>
              </div>
            )}
          </div>

          {selected && (
            <div className="flex items-center justify-between mt-3 px-1">
              <p className="text-xs" style={{ color: '#4a6080' }}>
                {locations.length} titik lokasi · <span style={{ color: '#8fa3bd' }}>{selected.delivery_code}</span>
              </p>
              <Link to={`/deliveries/${selected.id}`}
                className="text-xs font-semibold flex items-center gap-1 transition-colors"
                style={{ color: '#f97316' }}>
                Lihat Detail →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}