import React, { useState } from 'react';
import { ArrowRight, Navigation, Loader2, AlertCircle, CheckCircle, ChevronUp } from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import toast from 'react-hot-toast';

const STATUS_FLOW = {
  CREATED: 'PACKED', PACKED: 'IN_TRANSIT', IN_TRANSIT: 'NEAR_DESTINATION',
  NEAR_DESTINATION: 'DELIVERED', DELIVERED: 'COMPLETED',
};

const STATUS_CONFIG = {
  PACKED:           { label: 'Tandai Sudah Dikemas',     color: '#60a5fa', needsGps: false },
  IN_TRANSIT:       { label: 'Mulai Perjalanan',          color: '#fb923c', needsGps: true },
  NEAR_DESTINATION: { label: 'Tandai Hampir Tiba',        color: '#22d3ee', needsGps: true },
  DELIVERED:        { label: 'Konfirmasi Terkirim',       color: '#4ade80', needsGps: true },
  COMPLETED:        { label: 'Selesaikan Pengiriman',     color: '#a78bfa', needsGps: false },
};

export default function StatusUpdatePanel({ delivery, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const { updateStatus } = useDeliveryStore();

  const nextStatus = STATUS_FLOW[delivery.status];
  const config = nextStatus ? STATUS_CONFIG[nextStatus] : null;

  if (!nextStatus || !config) return null;

  const handleUpdate = async () => {
    setLoading(true);
    try {
      let lat, lng;
      if (config.needsGps) {
        toast('Mengambil lokasi GPS...', { icon: '📍' });
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }

      await updateStatus(delivery.id, { status: nextStatus, notes, latitude: lat, longitude: lng });
      toast.success(`Status → ${nextStatus.replace(/_/g, ' ')}`);
      setNotes('');
      onUpdated?.();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal update status';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl p-4 space-y-3"
      style={{
        background: `linear-gradient(135deg, ${config.color}08, ${config.color}04)`,
        border: `1px solid ${config.color}25`,
      }}>
      {/* Status flow indicator */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4a6080' }}>
          {delivery.status?.replace(/_/g, ' ')}
        </span>
        <ArrowRight size={13} style={{ color: config.color }} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: config.color }}>
          {nextStatus.replace(/_/g, ' ')}
        </span>
      </div>

      {/* GPS warning */}
      {config.needsGps && (
        <div className="flex items-start gap-2 rounded-xl p-2.5 text-xs"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
          <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
          <span>
            GPS diperlukan.
            {nextStatus === 'DELIVERED' ? ` Harus dalam radius ${delivery.geofence_radius}m dari tujuan.` : ' Lokasi akan direkam.'}
          </span>
        </div>
      )}

      {/* Notes */}
      <input
        type="text"
        className="input text-sm py-2.5"
        placeholder="Catatan (opsional)..."
        value={notes}
        onChange={e => setNotes(e.target.value)}
        id={`status-notes-${delivery.id}`}
      />

      {/* Update button */}
      <button
        id={`update-status-${delivery.id}`}
        onClick={handleUpdate}
        className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2"
        disabled={loading}
        style={{
          background: loading ? 'rgba(30,45,66,0.5)' : `linear-gradient(135deg, ${config.color}, ${config.color}cc)`,
          color: loading ? '#4a6080' : '#000',
          boxShadow: loading ? undefined : `0 4px 16px ${config.color}35`,
        }}
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" /> Memproses...</>
        ) : (
          <><ChevronUp size={16} /> {config.label}</>
        )}
      </button>
    </div>
  );
}