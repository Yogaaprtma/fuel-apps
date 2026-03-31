import React, { useState } from 'react';
import { Search, MapPin, Package, Truck, CheckCircle, Clock, Fuel, Loader2 } from 'lucide-react';
import { deliveryApi } from '../services/api';
import DeliveryMap from '../components/DeliveryMap';

const STATUSES = ['CREATED','PACKED','IN_TRANSIT','NEAR_DESTINATION','DELIVERED','COMPLETED'];
const STATUS_ICONS = { CREATED: Clock, PACKED: Package, IN_TRANSIT: Truck, NEAR_DESTINATION: MapPin, DELIVERED: CheckCircle, COMPLETED: CheckCircle };
const STATUS_LABELS = {
  CREATED: 'Dibuat', PACKED: 'Dikemas', IN_TRANSIT: 'Dalam Perjalanan',
  NEAR_DESTINATION: 'Hampir Tiba', DELIVERED: 'Terkirim', COMPLETED: 'Selesai'
};

export default function CustomerTrackPage() {
  const [code, setCode] = useState('');
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDelivery(null);
    try {
      const { data } = await deliveryApi.publicTrack(code);
      setDelivery(data);
    } catch {
      setError('Kode pengiriman tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  const currentIdx = delivery ? STATUSES.indexOf(delivery.status) : -1;

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-lg mx-auto pt-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex w-14 h-14 bg-flame rounded-2xl items-center justify-center mb-3">
            <Fuel size={28} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Lacak Pengiriman</h1>
          <p className="text-slate-500 text-sm mt-1">Masukkan kode pengiriman Anda</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text" className="input flex-1 font-mono uppercase"
            placeholder="FDS-20240101-001"
            value={code} onChange={e => setCode(e.target.value.toUpperCase())}
          />
          <button type="submit" className="btn-primary px-5" disabled={loading || !code}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          </button>
        </form>

        {error && (
          <div className="card border border-red-500/30 bg-red-900/10 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {delivery && (
          <div className="space-y-4 animate-slide-up">
            {/* Info Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-mono font-bold text-white text-lg">{delivery.delivery_code}</p>
                  <p className="text-slate-500 text-sm">{delivery.customer_name}</p>
                </div>
                <span className={`status-badge ${currentIdx >= 4 ? 'bg-emerald-900 text-emerald-300' : 'bg-flame/20 text-flame'}`}>
                  {STATUS_LABELS[delivery.status]}
                </span>
              </div>

              {/* Stepper */}
              <div className="space-y-3">
                {STATUSES.map((s, i) => {
                  const Icon = STATUS_ICONS[s];
                  const done = i <= currentIdx;
                  const current = i === currentIdx;
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                        done ? (current ? 'bg-flame shadow-lg shadow-flame/30' : 'bg-emerald-600') : 'bg-slate-800'
                      }`}>
                        <Icon size={16} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${done ? 'text-white' : 'text-slate-600'}`}>
                          {STATUS_LABELS[s]}
                        </p>
                      </div>
                      {current && <div className="w-2 h-2 bg-flame rounded-full animate-pulse" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detail */}
            <div className="card text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Jenis BBM</span>
                <span className="text-white font-medium">{delivery.fuel_type?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Volume</span>
                <span className="text-white font-mono">{delivery.volume_liters} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Driver</span>
                <span className="text-white">{delivery.driver?.name ?? '-'}</span>
              </div>
              <div className="pt-2 border-t border-slate-700/50">
                <p className="text-slate-500 mb-1">Tujuan</p>
                <p className="text-white">{delivery.destination_address}</p>
              </div>
            </div>

            {/* Map */}
            {delivery.latest_location && (
              <div className="card !p-0 overflow-hidden rounded-2xl" style={{ height: 300 }}>
                <DeliveryMap
                  delivery={{
                    destination_lat: delivery.destination_lat,
                    destination_lng: delivery.destination_lng,
                  }}
                  locations={[delivery.latest_location]}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}