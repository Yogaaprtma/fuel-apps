import React, { useEffect, useState } from 'react';
import { MapPin, Loader2, RefreshCw, Navigation, Activity, ArrowRight } from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import DeliveryMap from '../components/DeliveryMap';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { trackingApi } from '../services/api';

export default function TrackingPage() {
  const { deliveries, fetchDeliveries, loading } = useDeliveryStore();
  const [selected,   setSelected]   = useState(null);
  const [locations,  setLocations]  = useState([]);
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
          <div className="flex items-center gap-2 mb-1">
            {inTransit.length > 0 && <div className="live-dot w-2 h-2" />}
            <span className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: '#94A3B8', letterSpacing: '0.07em' }}>
              {inTransit.length > 0 ? 'Live Tracking' : 'Monitoring'}
            </span>
          </div>
          <h1 className="page-title">Live Map</h1>
          <p className="page-subtitle">{inTransit.length} kendaraan sedang bergerak</p>
        </div>
        <button onClick={() => fetchDeliveries({ per_page: 50 })} className="btn-ghost p-2.5" id="refresh-tracking">
          <RefreshCw size={17} className={loading ? 'animate-spin text-blue-500' : 'text-slate-400'} />
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">

        {/* Left: Delivery list */}
        <div className="lg:col-span-2 space-y-2">
          <p className="section-title">{inTransit.length} kendaraan aktif</p>

          {loading && inTransit.length === 0 ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="skeleton rounded-2xl h-20" />)}
            </div>
          ) : inTransit.length === 0 ? (
            <div className="card py-10 text-center">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Navigation size={24} className="text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-400">Tidak ada kendaraan dalam perjalanan</p>
            </div>
          ) : inTransit.map(d => (
            <button
              key={d.id}
              onClick={() => selectDelivery(d)}
              className="w-full text-left card transition-all duration-200"
              id={`track-select-${d.id}`}
              style={selected?.id === d.id
                ? { borderColor: '#BFDBFE', background: '#EFF6FF' }
                : {}
              }
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold" style={{ color: '#0F172A' }}>
                  {d.delivery_code}
                </span>
                <StatusBadge status={d.status} pulse />
              </div>
              <p className="text-xs text-slate-500 truncate">{d.customer_name}</p>
              <div className="flex items-start gap-1.5 mt-2">
                <MapPin size={11} className="flex-shrink-0 mt-0.5" style={{ color: '#F97316' }} />
                <p className="text-xs text-slate-400 line-clamp-2">{d.destination_address}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Right: Map */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl overflow-hidden" style={{ height: 480, border: '1px solid #E2E8F0' }}>
            {locLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 bg-slate-50">
                <Loader2 size={28} className="animate-spin text-blue-500" />
                <p className="text-sm text-slate-400">Memuat data lokasi...</p>
              </div>
            ) : selected ? (
              <DeliveryMap delivery={selected} locations={locations} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-slate-50">
                <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center"
                  style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                  <Activity size={28} style={{ color: '#2563EB' }} />
                </div>
                <p className="font-semibold text-sm text-slate-500">Pilih delivery untuk melihat peta</p>
                <p className="text-xs mt-1 text-slate-400">Klik salah satu delivery di panel kiri</p>
              </div>
            )}
          </div>

          {selected && (
            <div className="flex items-center justify-between mt-3 px-1">
              <p className="text-xs text-slate-400">
                {locations.length} titik lokasi terekam ·{' '}
                <span className="text-slate-500 font-mono">{selected.delivery_code}</span>
              </p>
              <Link to={`/deliveries/${selected.id}`}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                Lihat Detail <ArrowRight size={11} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}