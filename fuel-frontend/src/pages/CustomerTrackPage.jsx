import React, { useState } from 'react';
import { Search, MapPin, Package, Truck, CheckCircle, Clock, Fuel, Loader2, AlertCircle, Phone } from 'lucide-react';
import { deliveryApi } from '../services/api';
import DeliveryMap from '../components/DeliveryMap';

const STATUSES = ['CREATED','PACKED','IN_TRANSIT','NEAR_DESTINATION','DELIVERED','COMPLETED'];

const STATUS_CONFIG = {
  CREATED:          { label: 'Dibuat',            icon: Clock,         color: '#94a3b8' },
  PACKED:           { label: 'Dikemas',           icon: Package,       color: '#60a5fa' },
  IN_TRANSIT:       { label: 'Dalam Perjalanan',  icon: Truck,         color: '#fb923c' },
  NEAR_DESTINATION: { label: 'Hampir Tiba',       icon: MapPin,        color: '#22d3ee' },
  DELIVERED:        { label: 'Terkirim',          icon: CheckCircle,   color: '#4ade80' },
  COMPLETED:        { label: 'Selesai',           icon: CheckCircle,   color: '#a78bfa' },
};

export default function CustomerTrackPage() {
  const [code, setCode] = useState('');
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setDelivery(null);
    try {
      const { data } = await deliveryApi.publicTrack(code.trim());
      setDelivery(data);
    } catch {
      setError('Kode pengiriman tidak ditemukan. Periksa kembali kode Anda.');
    } finally {
      setLoading(false);
    }
  };

  const currentIdx = delivery ? STATUSES.indexOf(delivery.status) : -1;

  return (
    <div className="min-h-screen pb-10" style={{ background: '#030712' }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-80 opacity-10"
          style={{ background: 'radial-gradient(ellipse at top, #f97316, transparent 70%)' }} />
      </div>

      <div className="max-w-md mx-auto px-4 pt-10 space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center pb-2">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-float"
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea6c0a)',
              boxShadow: '0 0 30px rgba(249,115,22,0.4)',
            }}>
            <Fuel size={30} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">Lacak Pengiriman</h1>
          <p className="text-sm mt-1" style={{ color: '#4a6080' }}>
            Masukkan kode pengiriman yang tertera pada nota Anda
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            className="input flex-1 font-mono uppercase text-sm tracking-widest"
            placeholder="FDS-20240101-001"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            id="track-code-input"
          />
          <button
            type="submit"
            className="btn-primary px-5 flex-shrink-0"
            disabled={loading || !code.trim()}
            id="track-submit"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#f87171' }} />
            <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
          </div>
        )}

        {/* Result */}
        {delivery && (
          <div className="space-y-4 animate-slide-up">
            {/* Header card */}
            <div className="card"
              style={{
                borderColor: `${STATUS_CONFIG[delivery.status]?.color}25` || 'rgba(249,115,22,0.25)',
              }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-mono font-bold text-text-primary text-lg">{delivery.delivery_code}</p>
                  <p className="text-sm mt-0.5" style={{ color: '#8fa3bd' }}>{delivery.customer_name}</p>
                </div>
                <span className="badge text-xs"
                  style={{
                    background: `${STATUS_CONFIG[delivery.status]?.color}15`,
                    color: STATUS_CONFIG[delivery.status]?.color,
                    border: `1px solid ${STATUS_CONFIG[delivery.status]?.color}30`,
                  }}>
                  {STATUS_CONFIG[delivery.status]?.label ?? delivery.status}
                </span>
              </div>

              {/* Progress stepper */}
              <div className="space-y-0">
                {STATUSES.map((s, i) => {
                  const cfg = STATUS_CONFIG[s];
                  const Icon = cfg.icon;
                  const done = i <= currentIdx;
                  const isActive = i === currentIdx;

                  return (
                    <div key={s} className="flex items-center gap-3 relative">
                      {/* Connector line */}
                      {i < STATUSES.length - 1 && (
                        <div className="absolute left-3.5 top-8 w-0.5 h-6"
                          style={{
                            background: done ? `linear-gradient(${cfg.color}, ${STATUS_CONFIG[STATUSES[i+1]]?.color}60)` : 'rgba(30,45,66,0.8)'
                          }} />
                      )}

                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all duration-300"
                        style={{
                          background: done ? `${cfg.color}20` : 'rgba(30,45,66,0.8)',
                          border: `1.5px solid ${done ? cfg.color : 'rgba(30,45,66,0.8)'}`,
                          boxShadow: isActive ? `0 0 12px ${cfg.color}50` : undefined,
                        }}>
                        <Icon size={13} style={{ color: done ? cfg.color : '#2a3f5a' }} strokeWidth={2} />
                      </div>

                      <div className="flex-1 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold"
                            style={{ color: done ? cfg.color : '#2a3f5a' }}>
                            {cfg.label}
                          </span>
                          {isActive && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                              style={{ background: `${cfg.color}20`, color: cfg.color }}>
                              Sekarang
                            </span>
                          )}
                        </div>
                      </div>

                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info card */}
            <div className="card space-y-3">
              <h3 className="font-semibold text-text-primary text-sm">Detail Pengiriman</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Jenis BBM', value: delivery.fuel_type?.replace(/_/g, ' ') },
                  { label: 'Volume', value: `${delivery.volume_liters} Liter`, mono: true },
                  { label: 'Driver', value: delivery.driver?.name ?? 'Sedang diproses' },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex items-center justify-between py-2"
                    style={{ borderBottom: '1px solid rgba(30,45,66,0.5)' }}>
                    <span className="text-xs" style={{ color: '#4a6080' }}>{label}</span>
                    <span className={`text-xs font-semibold text-text-primary ${mono ? 'font-mono' : ''}`}>{value}</span>
                  </div>
                ))}
                <div className="pt-1">
                  <p className="text-[11px] uppercase font-semibold tracking-wide mb-1" style={{ color: '#4a6080' }}>Alamat Tujuan</p>
                  <p className="text-xs text-text-secondary">{delivery.destination_address}</p>
                </div>
              </div>
            </div>

            {/* Map */}
            {delivery.latest_location && (
              <div className="rounded-2xl overflow-hidden" style={{ height: 260, border: '1px solid rgba(30,45,66,0.8)' }}>
                <DeliveryMap
                  delivery={{ destination_lat: delivery.destination_lat, destination_lng: delivery.destination_lng }}
                  locations={[delivery.latest_location]}
                />
              </div>
            )}

            {/* Contact driver */}
            {delivery.driver?.phone && (
              <a href={`tel:${delivery.driver.phone}`}
                className="card flex items-center gap-3 transition-all hover:border-glow-orange"
                style={{ borderColor: 'rgba(249,115,22,0.2)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(249,115,22,0.1)' }}>
                  <Phone size={16} style={{ color: '#f97316' }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary">Hubungi Driver</p>
                  <p className="text-xs mt-0.5" style={{ color: '#4a6080' }}>{delivery.driver.phone}</p>
                </div>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}