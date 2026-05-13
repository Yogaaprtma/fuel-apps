import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Package, User, Truck, MapPin, Camera,
  Clock, Phone, Fuel, CheckCircle, DollarSign, FileText, Printer, Star, CopyPlus
} from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import useAuthStore from '../store/authStore';
import StatusBadge from '../components/StatusBadge';
import StatusTimeline from '../components/StatusTimeline';
import DeliveryMap from '../components/DeliveryMap';
import PhotoUpload from '../components/PhotoUpload';
import StatusUpdatePanel from '../components/StatusUpdatePanel';
import ProofOfDeliveryForm from '../components/ProofOfDeliveryForm';
import RatingForm from '../components/RatingForm';
import useTheme from '../hooks/useTheme';

const TABS = [
  { id: 'detail',   label: 'Detail',   icon: Package },
  { id: 'map',      label: 'Peta',     icon: MapPin },
  { id: 'photos',   label: 'Foto',     icon: Camera },
  { id: 'timeline', label: 'Timeline', icon: Clock },
];

function InfoRow({ label, value, mono = false, accent }) {
  const { isDark } = useTheme();
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
        {label}
      </p>
      <p className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}
        style={{ color: accent ?? 'var(--text-main)' }}>
        {value ?? '—'}
      </p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, color = '#2563EB', bg = '#EFF6FF' }) {
  const { isDark } = useTheme();
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--bg-muted)' }}>
        <Icon size={16} style={{ color }} />
      </div>
      <h3 className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>{title}</h3>
    </div>
  );
}

export default function DeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { current, fetchDelivery } = useDeliveryStore();
  const { hasRole }               = useAuthStore();
  const [tab, setTab]             = useState('detail');
  const { isDark }                = useTheme();

  useEffect(() => { fetchDelivery(id); }, [id]);

  if (!current) {
    return (
      <div className="flex h-64 items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-sm text-slate-400">Memuat data pengiriman...</p>
      </div>
    );
  }

  const canUpdateStatus = hasRole(['driver','super-admin','admin-operasional'])
    && !['COMPLETED'].includes(current.status);

  return (
    <div className="max-w-2xl space-y-4 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button className="btn-ghost p-2" onClick={() => navigate(-1)} id="back-btn">
          <ArrowLeft size={19} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-mono text-xl font-bold" style={{ color: 'var(--text-main)' }}>
              {current.delivery_code}
            </h1>
            <StatusBadge status={current.status} size="lg" pulse />
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {current.customer_name} · {current.fuel_type?.replace(/_/g, ' ')}
          </p>
        </div>
        {/* Invoice button */}
        {['DELIVERED','COMPLETED'].includes(current.status) && (
          <button
            onClick={() => navigate(`/deliveries/${id}/invoice`)}
            className="btn-secondary flex items-center gap-1.5 text-xs"
            id="invoice-btn"
          >
            <Printer size={14} /> Invoice
          </button>
        )}
        {/* Repeat Order button */}
        {hasRole(['super-admin','admin-operasional']) && (
          <button
            onClick={() => navigate('/deliveries/new', {
              state: {
                prefill: {
                  customer_name:        current.customer_name,
                  customer_phone:       current.customer_phone,
                  customer_id:          current.customer_id,
                  destination_address:  current.destination_address,
                  destination_lat:      current.destination_lat,
                  destination_lng:      current.destination_lng,
                  fuel_type:            current.fuel_type,
                  volume_liters:        current.volume_liters,
                  price_per_liter:      current.price_per_liter,
                  geofence_radius:      current.geofence_radius,
                }
              }
            })}
            className="btn-ghost flex items-center gap-1.5 text-xs text-blue-600 border border-blue-200"
            id="repeat-order-btn"
            title="Buat pengiriman baru dengan data yang sama"
          >
            <CopyPlus size={14} /> Pesan Ulang
          </button>
        )}
      </div>

      {/* Status Update Panel */}
      {canUpdateStatus && (
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
            Update Status
          </p>
          <StatusUpdatePanel delivery={current} onUpdated={() => fetchDelivery(id)} />
        </div>
      )}

      {/* POD Form — muncul saat status DELIVERED dan belum ada proof */}
      {current.status === 'DELIVERED' && !current.proof &&
        hasRole(['driver', 'super-admin', 'admin-operasional']) && (
        <div className="card" style={{ border: '1.5px solid #A7F3D0' }}>
          <ProofOfDeliveryForm delivery={current} onCompleted={() => fetchDelivery(id)} />
        </div>
      )}

      {/* Rating Form — muncul untuk customer setelah COMPLETED */}
      {current.status === 'COMPLETED' && hasRole(['customer']) && !current.rating && (
        <div className="card" style={{ border: '1.5px solid #FDE68A' }}>
          <RatingForm delivery={current} onRated={() => fetchDelivery(id)} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--bg-muted)' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all duration-200"
            style={tab === t.id
              ? { background: 'var(--bg-card)', color: 'var(--primary)', boxShadow: 'var(--shadow)' }
              : { color: 'var(--text-muted)' }
            }
          >
            <t.icon size={13} />
            <span className="hidden sm:block">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Detail */}
      {tab === 'detail' && (
        <div className="space-y-4 animate-fade-in">
          {/* Customer */}
          <div className="card">
            <SectionHeader icon={User} title="Info Pelanggan" color="#2563EB" bg="#EFF6FF" />
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Nama" value={current.customer_name} />
              <InfoRow label="Telepon" value={current.customer_phone} />
              <div className="col-span-2">
                <InfoRow label="Alamat Tujuan" value={current.destination_address} />
              </div>
              <InfoRow label="Koordinat" value={`${current.destination_lat}, ${current.destination_lng}`} mono />
              <InfoRow label="Geofence" value={`${current.geofence_radius}m radius`} />
            </div>
          </div>

          {/* Delivery info */}
          <div className="card">
            <SectionHeader icon={Truck} title="Detail Pengiriman" color="#F97316" bg="#FFF7ED" />
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Driver" value={current.driver?.name ?? 'Belum di-assign'} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: 'var(--text-dim)', letterSpacing: '0.06em' }}>Jenis BBM</p>
                <span className="badge badge-blue">{current.fuel_type?.replace(/_/g, ' ')}</span>
              </div>
              <InfoRow label="Volume" value={`${current.volume_liters} Liter`} mono />
              <InfoRow label="Harga / Liter" value={`Rp ${Number(current.price_per_liter).toLocaleString('id-ID')}`} mono />
              <div className="col-span-2 pt-2 border-t" style={{ borderColor: 'var(--border-light)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: 'var(--text-dim)', letterSpacing: '0.06em' }}>Total Harga</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                  Rp {Number(current.total_price).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          {/* Proof of Delivery */}
          {current.proof && (
            <div className="card" style={{ border: '1px solid #A7F3D0' }}>
              <SectionHeader icon={CheckCircle} title="Bukti Pengiriman (POD)" color="#059669" bg="#ECFDF5" />
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Penerima" value={current.proof.recipient_name} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: 'var(--text-dim)' }}>Validasi Geofence</p>
                  <span className={`badge ${current.proof.geofence_valid ? 'badge-green' : 'badge-red'}`}>
                    {current.proof.geofence_valid ? '✓ Valid' : '✗ Invalid'}
                  </span>
                </div>
                <InfoRow label="Jarak dari Tujuan" value={`${current.proof.distance_from_destination}m`} />
              </div>
              {current.proof.signature_path && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                  <p className="label mb-2">Tanda Tangan</p>
                  <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-main)' }}>
                    <img
                      src={`${import.meta.env.VITE_API_URL?.replace('/api','')}/storage/${current.proof.signature_path}`}
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
          <div className="rounded-2xl overflow-hidden" style={{ height: 420, border: '1px solid #E2E8F0' }}>
            <DeliveryMap delivery={current} locations={current.locations || []} />
          </div>
          {current.locations?.length > 0 && (
            <p className="text-xs mt-2 text-center text-slate-400">
              {current.locations.length} titik lokasi terekam
            </p>
          )}
        </div>
      )}

      {/* Tab: Photos */}
      {tab === 'photos' && (
        <div className="space-y-4 animate-fade-in">
          {/* Upload tersedia untuk driver dan admin (bukan customer), selama belum COMPLETED */}
          {hasRole(['driver', 'super-admin', 'admin-operasional']) && !['COMPLETED'].includes(current.status) && (
            <div className="card">
              <p className="label mb-3">Upload Foto Pengiriman</p>
              <PhotoUpload deliveryId={current.id} onUploaded={() => fetchDelivery(id)} />
            </div>
          )}

          {(current.photos || []).length === 0 ? (
            <div className="card py-14 text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Camera size={26} className="text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-400">Belum ada foto</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {(current.photos || []).map(photo => (
                <div key={photo.id} className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid #E2E8F0' }}>
                  <img src={photo.photo_url} alt={photo.caption || 'Foto'} className="w-full h-40 object-cover" />
                  <div className="p-3 bg-white">
                    <span className="badge badge-orange text-[10px]">{photo.photo_type}</span>
                    {photo.caption && <p className="text-xs mt-1 text-slate-500">{photo.caption}</p>}
                    {photo.uploader && <p className="text-[10px] mt-1 text-slate-400">Oleh: {photo.uploader.name}</p>}
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
          <SectionHeader icon={Clock} title="Riwayat Status" color="#2563EB" bg="#EFF6FF" />
          <StatusTimeline
            currentStatus={current.status}
            logs={current.status_logs || current.statusLogs || []}
            photos={current.photos || []}
          />
        </div>
      )}
    </div>
  );
}