import React, { useEffect, useState } from 'react';
import { MapPin, Loader2, RefreshCw } from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import DeliveryMap from '../components/DeliveryMap';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { trackingApi } from '../services/api';

export default function TrackingPage() {
  const { deliveries, fetchDeliveries, loading } = useDeliveryStore();
  const [selected, setSelected] = useState(null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchDeliveries({ status: 'IN_TRANSIT' });
  }, []);

  const selectDelivery = async (d) => {
    setSelected(d);
    const { data } = await trackingApi.history(d.id);
    setLocations(data.locations || []);
  };

  const inTransit = deliveries.filter(d => ['IN_TRANSIT','NEAR_DESTINATION'].includes(d.status));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Live Tracking</h1>
        <button onClick={() => fetchDeliveries({ status: 'IN_TRANSIT' })} className="btn-ghost p-2">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Delivery list */}
        <div className="space-y-3 md:col-span-1">
          <p className="text-sm text-slate-500">{inTransit.length} delivery aktif</p>
          {inTransit.length === 0 ? (
            <div className="card text-center py-8">
              <MapPin size={32} className="text-slate-700 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">Tidak ada delivery dalam perjalanan</p>
            </div>
          ) : inTransit.map(d => (
            <button key={d.id} onClick={() => selectDelivery(d)}
              className={`card w-full text-left hover:border-flame/30 transition-all cursor-pointer ${
                selected?.id === d.id ? 'border-flame/50 bg-flame/5' : ''
              }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-semibold text-white">{d.delivery_code}</span>
                <StatusBadge status={d.status} />
              </div>
              <p className="text-xs text-slate-500 truncate">{d.customer_name}</p>
              <p className="text-xs text-slate-600 truncate mt-0.5">{d.destination_address}</p>
            </button>
          ))}
        </div>

        {/* Map */}
        <div className="md:col-span-2">
          <div className="card !p-0 overflow-hidden rounded-2xl" style={{ height: 450 }}>
            {selected ? (
              <DeliveryMap delivery={selected} locations={locations} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600">
                <MapPin size={48} className="mb-3" />
                <p>Pilih delivery untuk melihat tracking</p>
              </div>
            )}
          </div>
          {selected && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-slate-500">{locations.length} titik lokasi tercatat</p>
              <Link to={`/deliveries/${selected.id}`} className="text-sm text-flame hover:text-flame-400">
                Lihat Detail →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}