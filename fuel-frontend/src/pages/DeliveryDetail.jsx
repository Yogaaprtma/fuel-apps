import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, Truck, MapPin, Camera, FileText, Clock } from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import useAuthStore from '../store/authStore';
import StatusBadge from '../components/StatusBadge';
import StatusTimeline from '../components/StatusTimeline';
import DeliveryMap from '../components/DeliveryMap';
import PhotoUpload from '../components/PhotoUpload';
import StatusUpdatePanel from '../components/StatusUpdatePanel';

export default function DeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { current, fetchDelivery } = useDeliveryStore();
  const { hasRole } = useAuthStore();
  const [tab, setTab] = useState('detail');

  useEffect(() => { fetchDelivery(id); }, [id]);

  if (!current) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-2 border-flame border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const tabs = [
    { id: 'detail', label: 'Detail', icon: Package },
    { id: 'map', label: 'Map', icon: MapPin },
    { id: 'photos', label: 'Foto', icon: Camera },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ];

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl font-bold text-white font-mono">{current.delivery_code}</h1>
            <StatusBadge status={current.status} />
          </div>
          <p className="text-slate-500 text-sm mt-0.5">{current.customer_name} · {current.fuel_type}</p>
        </div>
      </div>

      {/* Status Update Panel (driver) */}
      {hasRole('driver') && !['DELIVERED','COMPLETED'].includes(current.status) && (
        <StatusUpdatePanel delivery={current} onUpdated={() => fetchDelivery(id)} />
      )}

      {/* Tabs */}
      <div className="flex gap-1 glass rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-flame text-white' : 'text-slate-500 hover:text-white'
            }`}>
            <t.icon size={16} /> <span className="hidden sm:block">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'detail' && (
        <div className="space-y-4">
          <div className="card space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2"><User size={16} className="text-flame" /> Info Pelanggan</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-slate-500">Nama</p><p className="text-white font-medium">{current.customer_name}</p></div>
              <div><p className="text-slate-500">Telepon</p><p className="text-white">{current.customer_phone}</p></div>
              <div className="col-span-2"><p className="text-slate-500">Alamat</p><p className="text-white">{current.destination_address}</p></div>
            </div>
          </div>

          <div className="card space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2"><Truck size={16} className="text-flame" /> Detail Pengiriman</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-slate-500">Driver</p><p className="text-white">{current.driver?.name ?? '-'}</p></div>
              <div><p className="text-slate-500">Jenis BBM</p><p className="text-white">{current.fuel_type?.replace('_', ' ')}</p></div>
              <div><p className="text-slate-500">Volume</p><p className="text-white font-mono">{current.volume_liters} L</p></div>
              <div><p className="text-slate-500">Total Harga</p><p className="text-white font-mono">Rp {Number(current.total_price).toLocaleString('id-ID')}</p></div>
            </div>
          </div>

          {current.proof && (
            <div className="card space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2"><FileText size={16} className="text-flame" /> Bukti Pengiriman</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-slate-500">Penerima</p><p className="text-white">{current.proof.recipient_name}</p></div>
                <div><p className="text-slate-500">Geofence</p>
                  <p className={current.proof.geofence_valid ? 'text-emerald-400' : 'text-red-400'}>
                    {current.proof.geofence_valid ? '✅ Valid' : '❌ Di luar zona'}
                  </p>
                </div>
              </div>
              {current.proof.signature_url && (
                <div>
                  <p className="text-slate-500 text-sm mb-2">Tanda Tangan</p>
                  <img src={current.proof.signature_url} alt="Tanda tangan" className="h-20 bg-white rounded-lg p-2" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'map' && (
        <div className="card !p-0 overflow-hidden rounded-2xl" style={{ height: 400 }}>
          <DeliveryMap delivery={current} locations={current.locations || []} />
        </div>
      )}

      {tab === 'photos' && (
        <div className="space-y-4">
          {hasRole(['driver']) && !['COMPLETED'].includes(current.status) && (
            <PhotoUpload deliveryId={current.id} onUploaded={() => fetchDelivery(id)} />
          )}
          <div className="grid grid-cols-2 gap-3">
            {(current.photos || []).map(photo => (
              <div key={photo.id} className="card !p-0 overflow-hidden rounded-xl">
                <img src={photo.photo_url} alt={photo.caption} className="w-full h-40 object-cover" />
                <div className="p-3">
                  <p className="text-xs text-flame font-medium">{photo.photo_type}</p>
                  {photo.caption && <p className="text-xs text-slate-500 mt-0.5">{photo.caption}</p>}
                </div>
              </div>
            ))}
            {(current.photos || []).length === 0 && !hasRole(['driver']) && (
              <p className="col-span-2 text-center text-slate-600 py-8">Belum ada foto</p>
            )}
          </div>
        </div>
      )}

      {tab === 'timeline' && (
        <div className="card">
          <StatusTimeline logs={current.statusLogs || []} />
        </div>
      )}
    </div>
  );
}