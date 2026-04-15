import React, { useState } from 'react';
import { Search, MapPin, Package, Truck, CheckCircle, Clock, Fuel, Loader2, AlertCircle, Phone } from 'lucide-react';
import { deliveryApi } from '../services/api';
import DeliveryMap from '../components/DeliveryMap';

const STATUSES = ['CREATED','PACKED','IN_TRANSIT','NEAR_DESTINATION','DELIVERED','COMPLETED'];

const STATUS_CONFIG = {
  CREATED:          { label: 'Dibuat',           icon: Clock,       color: '#94A3B8', bg: '#F8FAFC' },
  PACKED:           { label: 'Dikemas',           icon: Package,     color: '#2563EB', bg: '#EFF6FF' },
  IN_TRANSIT:       { label: 'Dalam Perjalanan',  icon: Truck,       color: '#EA580C', bg: '#FFF7ED' },
  NEAR_DESTINATION: { label: 'Hampir Tiba',       icon: MapPin,      color: '#0E7490', bg: '#ECFEFF' },
  DELIVERED:        { label: 'Terkirim',          icon: CheckCircle, color: '#059669', bg: '#ECFDF5' },
  COMPLETED:        { label: 'Selesai',           icon: CheckCircle, color: '#7C3AED', bg: '#F5F3FF' },
};

export default function CustomerTrackPage() {
  const [code,     setCode]     = useState('');
  const [delivery, setDelivery] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

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
    <div className="min-h-screen pb-10" style={{ background: '#F8FAFF' }}>

      {/* Top banner */}
      <div className="pt-10 pb-6 text-center"
        style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)' }}>
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-white/20"
          style={{ border: '1px solid rgba(255,255,255,0.3)' }}>
          <Fuel size={30} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
          Lacak Pengiriman
        </h1>
        <p className="text-sm mt-1 text-blue-200">
          Masukkan kode pengiriman yang tertera pada nota Anda
        </p>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">

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
          <div className="alert-error">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Result */}
        {delivery && (
          <div className="space-y-4 animate-slide-up">

            {/* Status card */}
            <div className="card">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="font-mono font-bold text-lg" style={{ color: '#0F172A' }}>
                    {delivery.delivery_code}
                  </p>
                  <p className="text-sm mt-0.5 text-slate-500">{delivery.customer_name}</p>
                </div>
                <span className="badge"
                  style={{
                    background: STATUS_CONFIG[delivery.status]?.bg,
                    color: STATUS_CONFIG[delivery.status]?.color,
                    border: `1px solid ${STATUS_CONFIG[delivery.status]?.color}30`,
                  }}>
                  {STATUS_CONFIG[delivery.status]?.label ?? delivery.status}
                </span>
              </div>

              {/* Progress stepper */}
              <div className="space-y-0">
                {STATUSES.map((s, i) => {
                  const cfg    = STATUS_CONFIG[s];
                  const Icon   = cfg.icon;
                  const done   = i <= currentIdx;
                  const isActive = i === currentIdx;

                  return (
                    <div key={s} className="flex items-center gap-3 relative">
                      {/* Connector */}
                      {i < STATUSES.length - 1 && (
                        <div className="absolute left-3.5 top-8 w-0.5 h-6 rounded-full"
                          style={{ background: done && i < currentIdx ? '#A7F3D0' : '#E2E8F0' }} />
                      )}

                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all duration-300"
                        style={{
                          background: done ? cfg.bg : '#F8FAFC',
                          border: `1.5px solid ${done ? cfg.color + '60' : '#E2E8F0'}`,
                          boxShadow: isActive ? `0 0 0 3px ${cfg.color}20` : undefined,
                        }}>
                        <Icon size={13} style={{ color: done ? cfg.color : '#CBD5E1' }} strokeWidth={2} />
                      </div>

                      <div className="flex-1 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold"
                            style={{ color: done ? cfg.color : '#CBD5E1' }}>
                            {cfg.label}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                              Sekarang
                            </span>
                          )}
                        </div>
                      </div>

                      {isActive && (
                        <div className="w-2 h-2 rounded-full animate-pulse"
                          style={{ background: cfg.color }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detail info */}
            <div className="card space-y-3">
              <h3 className="font-semibold text-sm" style={{ color: '#0F172A' }}>Detail Pengiriman</h3>
              <div className="space-y-2">
                {[
                  { label: 'Jenis BBM', value: delivery.fuel_type?.replace(/_/g, ' ') },
                  { label: 'Volume',    value: `${delivery.volume_liters} Liter`, mono: true },
                  { label: 'Driver',    value: delivery.driver?.name ?? 'Sedang diproses' },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex items-center justify-between py-2"
                    style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <span className="text-xs text-slate-400">{label}</span>
                    <span className={`text-xs font-semibold text-slate-700 ${mono ? 'font-mono' : ''}`}>
                      {value}
                    </span>
                  </div>
                ))}
                <div className="pt-1">
                  <p className="text-xs uppercase font-semibold tracking-wider mb-1 text-slate-400">Alamat Tujuan</p>
                  <p className="text-xs text-slate-500">{delivery.destination_address}</p>
                </div>
              </div>
            </div>

            {/* Map */}
            {delivery.latest_location && (
              <div className="rounded-2xl overflow-hidden" style={{ height: 260, border: '1px solid #E2E8F0' }}>
                <DeliveryMap
                  delivery={{ destination_lat: delivery.destination_lat, destination_lng: delivery.destination_lng }}
                  locations={[delivery.latest_location]}
                />
              </div>
            )}

            {/* Contact driver */}
            {delivery.driver?.phone && (
              <a href={`tel:${delivery.driver.phone}`}
                className="card flex items-center gap-3 transition-all hover:border-blue-200 hover:bg-blue-50">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: '#EFF6FF' }}>
                  <Phone size={17} style={{ color: '#2563EB' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>Hubungi Driver</p>
                  <p className="text-xs mt-0.5 text-slate-400">{delivery.driver.phone}</p>
                </div>
              </a>
            )}

            {/* Login link */}
            <div className="text-center">
              <a href="/login" className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Punya akun? Masuk ke dashboard →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}