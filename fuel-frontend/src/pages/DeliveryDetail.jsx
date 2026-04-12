import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Package, User, Truck, MapPin, Camera,
  FileText, Clock, Phone, Fuel, AlertCircle, CheckCircle, DollarSign
} from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import useAuthStore from '../store/authStore';
import StatusBadge from '../components/StatusBadge';
import StatusTimeline from '../components/StatusTimeline';
import DeliveryMap from '../components/DeliveryMap';
import PhotoUpload from '../components/PhotoUpload';
import StatusUpdatePanel from '../components/StatusUpdatePanel';

const TABS = [
  { id: 'detail',   label: 'Detail',   icon: Package },
  { id: 'map',      label: 'Map',      icon: MapPin },
  { id: 'photos',   label: 'Foto',     icon: Camera },
  { id: 'timeline', label: 'Timeline', icon: Clock },
];

function InfoRow({ label, value, mono = false, accent }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#4a6080' }}>{label}</p>
      <p className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}
        style={{ color: accent ?? '#f0f4f8' }}>{value ?? '—'}</p>
    </div>
  );
}

export default function DeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { current, fetchDelivery } = useDeliveryStore();
  const { hasRole } = useAuthStore();
  const [tab, setTab] = useState('detail');

  useEffect(() => { fetchDelivery(id); }, [id]);

  if (!current) {
    return (
      <div className="flex h-64 items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        <p className="text-sm" style={{ color: '#4a6080' }}>Memuat data...</p>
      </div>
    );
  }

  const canUpdateStatus = hasRole(['driver','super-admin','admin-operasional'])
    && !['COMPLETED'].includes(current.status);

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button className="btn-ghost p-2" onClick={() => navigate(-1)} id="back-btn">
          <ArrowLeft size={19} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-mono text-xl font-bold text-text-primary">{current.delivery_code}</h1>
            <StatusBadge status={current.status} size="md" pulse />
          </div>
          <p className="text-sm mt-0.5" style={{ color: '#4a6080' }}>
            {current.customer_name} · {current.fuel_type?.replace(/_/g, ' ')}
          </p>
        </div>
      </div>

      {/* Status update panel */}
      {canUpdateStatus && (
        <StatusUpdatePanel delivery={current} onUpdated={() => fetchDelivery(id)} />
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1"
        style={{ background: 'rgba(6,13,26,0.8)', border: '1px solid rgba(30,45,66,0.8)' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all duration-200"
            style={tab === t.id ? {
              background: 'linear-gradient(135deg, #f97316, #ea6c0a)',
              color: 'white',
              boxShadow: '0 2px 12px rgba(249,115,22,0.3)',
            } : { color: '#4a6080' }}
          >
            <t.icon size={14} />
            <span className="hidden sm:block">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Detail */}
      {tab === 'detail' && (
        <div className="space-y-4 animate-fade-in">
          {/* Customer info */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.1)' }}>
                <User size={14} style={{ color: '#f97316' }} />
              </div>
              <h3 className="font-semibold text-text-primary text-sm">Info Pelanggan</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Nama" value={current.customer_name} />
              <InfoRow label="Telepon" value={current.customer_phone} />
              <div className="col-span-2">
                <InfoRow label="Alamat Tujuan" value={current.destination_address} />
              </div>
              <InfoRow label="Koordinat" value={`${current.destination_lat}, ${current.destination_lng}`} mono />
              <InfoRow label="Geofence Radius" value={`${current.geofence_radius}m`} />
            </div>
          </div>

          {/* Delivery info */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.1)' }}>
                <Truck size={14} style={{ color: '#f97316' }} />
              </div>
              <h3 className="font-semibold text-text-primary text-sm">Detail Pengiriman</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Driver" value={current.driver?.name ?? 'Belum assign'} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#4a6080' }}>Jenis BBM</p>
                <span className="badge-orange text-xs">{current.fuel_type?.replace(/_/g, ' ')}</span>
              </div>
              <InfoRow label="Volume" value={`${current.volume_liters} Liter`} mono />
              <InfoRow label="Harga/L" value={`Rp ${Number(current.price_per_liter).toLocaleString('id-ID')}`} mono />
              <div className="col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#4a6080' }}>Total Harga</p>
                <p className="font-display text-2xl font-bold text-gradient-orange">
                  Rp {Number(current.total_price).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          {/* Proof of delivery */}
          {current.proof && (
            <div className="card" style={{ border: '1px solid rgba(74,222,128,0.2)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.1)' }}>
                  <CheckCircle size={14} style={{ color: '#4ade80' }} />
                </div>
                <h3 className="font-semibold text-text-primary text-sm">Bukti Pengiriman</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Penerima" value={current.proof.recipient_name} />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#4a6080' }}>Geofence</p>
                  <span className={`badge text-xs ${current.proof.geofence_valid ? 'badge-green' : 'badge-red'}`}>
                    {current.proof.geofence_valid ? '✓ Valid' : '✗ Invalid'}
                  </span>
                </div>
                <InfoRow label="Jarak dari Tujuan" value={`${current.proof.distance_from_destination}m`} />
              </div>
              {current.proof.signature_path && (
                <div className="mt-4">
                  <p className="label mb-2">Tanda Tangan</p>
                  <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(30,45,66,0.8)' }}>
                    <img
                      src={`${import.meta.env.VITE_API_URL?.replace('/api','')}` + `/storage/${current.proof.signature_path}`}
                      alt="Tanda tangan"
                      className="h-24 object-contain p-3"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Map */}
      {tab === 'map' && (
        <div className="animate-fade-in">
          <div className="rounded-2xl overflow-hidden" style={{ height: 420, border: '1px solid rgba(30,45,66,0.8)' }}>
            <DeliveryMap delivery={current} locations={current.locations || []} />
          </div>
          {current.locations?.length > 0 && (
            <p className="text-xs mt-2 text-center" style={{ color: '#4a6080' }}>
              {current.locations.length} titik lokasi terekam
            </p>
          )}
        </div>
      )}

      {/* Tab: Photos */}
      {tab === 'photos' && (
        <div className="space-y-4 animate-fade-in">
          {hasRole(['driver']) && !['COMPLETED'].includes(current.status) && (
            <PhotoUpload deliveryId={current.id} onUploaded={() => fetchDelivery(id)} />
          )}
          {(current.photos || []).length === 0 ? (
            <div className="card py-12 text-center">
              <Camera size={36} className="mx-auto mb-3" style={{ color: '#2a3f5a' }} />
              <p className="text-sm" style={{ color: '#4a6080' }}>Belum ada foto</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {(current.photos || []).map(photo => (
                <div key={photo.id} className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(30,45,66,0.8)' }}>
                  <img src={photo.photo_url} alt={photo.caption || 'Foto'} className="w-full h-40 object-cover" />
                  <div className="p-3" style={{ background: 'rgba(13,20,36,0.9)' }}>
                    <span className="badge-orange text-[10px]">{photo.photo_type}</span>
                    {photo.caption && <p className="text-xs mt-1" style={{ color: '#8fa3bd' }}>{photo.caption}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Timeline */}
      {tab === 'timeline' && (
        <div className="card animate-fade-in">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={15} style={{ color: '#f97316' }} />
            <h3 className="font-semibold text-text-primary text-sm">Riwayat Status</h3>
          </div>
          <StatusTimeline currentStatus={current.status} logs={current.status_logs || current.statusLogs || []} />
        </div>
      )}
    </div>
  );
}