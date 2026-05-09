import React, { useState } from 'react';
import { ChevronRight, Loader2, MapPin, AlertTriangle, Navigation } from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import toast from 'react-hot-toast';

const STATUS_FLOW = {
  CREATED:          'PACKED',
  PACKED:           'IN_TRANSIT',
  IN_TRANSIT:       'NEAR_DESTINATION',
  NEAR_DESTINATION: 'DELIVERED',
  DELIVERED:        'COMPLETED',
};

const NEXT_LABELS = {
  PACKED:           { label: 'Tandai: Dikemas',           color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  IN_TRANSIT:       { label: 'Mulai Pengiriman',          color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  NEAR_DESTINATION: { label: 'Mendekati Tujuan',          color: '#0E7490', bg: '#ECFEFF', border: '#A5F3FC' },
  DELIVERED:        { label: 'Konfirmasi Terkirim (GPS)', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  COMPLETED:        { label: 'Selesai',                   color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
};

export default function StatusUpdatePanel({ delivery, onUpdated, currentPosition = null }) {
  const { updateStatus } = useDeliveryStore();
  const [loading, setLoading] = useState(false);
  const [notes,   setNotes]   = useState('');
  const [showNote, setShowNote] = useState(false);

  const nextStatus = STATUS_FLOW[delivery.status];
  const nextInfo   = NEXT_LABELS[nextStatus];

  if (!nextStatus || delivery.status === 'COMPLETED') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
        style={{ background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
        <div className="w-2 h-2 rounded-full bg-violet-500" />
        <p className="text-sm font-semibold text-violet-700">Pengiriman Selesai</p>
      </div>
    );
  }

  // Saat DELIVERED, driver harus isi POD Form (tanda tangan) — bukan tombol langsung
  if (delivery.status === 'DELIVERED' && !delivery.proof) {
    return (
      <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
        style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
        <div className="w-5 h-5 mt-0.5 flex-shrink-0 text-emerald-500">✅</div>
        <div>
          <p className="text-sm font-semibold text-emerald-700">BBM sudah terkirim!</p>
          <p className="text-xs text-emerald-600 mt-0.5">
            Isi form bukti penerimaan (tanda tangan) di bawah untuk menyelesaikan pengiriman.
          </p>
        </div>
      </div>
    );
  }

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = { status: nextStatus };
      if (notes.trim()) payload.notes = notes.trim();

      if (nextStatus === 'DELIVERED') {
        // Gunakan posisi dari GPS tracking yang aktif jika ada,
        // supaya tidak ada konflik 2 request geolocation sekaligus
        if (currentPosition?.lat && currentPosition?.lng) {
          payload.latitude  = currentPosition.lat;
          payload.longitude = currentPosition.lng;
        } else {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true, timeout: 15000,
            });
          });
          payload.latitude  = pos.coords.latitude;
          payload.longitude = pos.coords.longitude;
        }
      }

      await updateStatus(delivery.id, payload);
      toast.success(`Status diperbarui ke ${nextStatus.replace(/_/g, ' ')}`);
      setNotes('');
      setShowNote(false);
      onUpdated?.();
    } catch (err) {
      if (err.code === 1) {
        toast.error('Akses GPS ditolak. Izinkan akses lokasi terlebih dahulu.');
      } else {
        toast.error(err.response?.data?.message || 'Gagal update status');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* GPS warning untuk DELIVERED */}
      {nextStatus === 'DELIVERED' && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
          style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <Navigation size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            GPS akan diaktifkan untuk validasi lokasi pengiriman.
          </p>
        </div>
      )}

      {/* Note toggle */}
      <button
        onClick={() => setShowNote(!showNote)}
        className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
      >
        {showNote ? '− Tutup catatan' : '+ Tambah catatan (opsional)'}
      </button>

      {showNote && (
        <textarea
          className="input text-xs resize-none"
          rows={2}
          placeholder="Tambah catatan untuk update ini..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      )}

      {/* Update button */}
      <button
        onClick={handleUpdate}
        disabled={loading}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50"
        style={{
          background: nextInfo.bg,
          color:      nextInfo.color,
          border:     `1.5px solid ${nextInfo.border}`,
        }}
        id={`update-status-${delivery.id}`}
      >
        <span>{loading ? 'Memproses...' : nextInfo.label}</span>
        {loading
          ? <Loader2 size={15} className="animate-spin" />
          : <ChevronRight size={15} />
        }
      </button>
    </div>
  );
}