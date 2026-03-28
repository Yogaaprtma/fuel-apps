import React, { useState } from 'react';
import { ArrowRight, MapPin, Loader2, AlertCircle } from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import toast from 'react-hot-toast';

const STATUS_FLOW = {
    CREATED: 'PACKED', PACKED: 'IN_TRANSIT', IN_TRANSIT: 'NEAR_DESTINATION',
    NEAR_DESTINATION: 'DELIVERED', DELIVERED: 'COMPLETED',
};

const STATUS_LABELS = {
    PACKED: 'Tandai Sudah Dikemas', IN_TRANSIT: 'Mulai Perjalanan',
    NEAR_DESTINATION: 'Tandai Hampir Tiba', DELIVERED: 'Konfirmasi Terkirim',
    COMPLETED: 'Selesaikan Pengiriman',
};

export default function StatusUpdatePanel({ delivery, onUpdated }) {
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState('');
    const { updateStatus } = useDeliveryStore();

    const nextStatus = STATUS_FLOW[delivery.status];
    if (!nextStatus) return null;

    const handleUpdate = async () => {
        setLoading(true);
        try {
            let lat, lng;

            // Ambil GPS untuk status yang perlu validasi lokasi
            if (['DELIVERED', 'IN_TRANSIT', 'NEAR_DESTINATION'].includes(nextStatus)) {
                const pos = await new Promise((res, rej) =>
                    navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 8000 })
                );
                lat = pos.coords.latitude;
                lng = pos.coords.longitude;
            }

            await updateStatus(delivery.id, { status: nextStatus, notes, latitude: lat, longitude: lng });
            toast.success(`Status diupdate ke ${nextStatus.replace('_', ' ')}`);
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
        <div className="border border-flame/20 bg-flame/5 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="text-white font-medium">{delivery.status?.replace('_', ' ')}</span>
                <ArrowRight size={14} className="text-flame" />
                <span className="text-flame font-medium">{nextStatus?.replace('_', ' ')}</span>
            </div>

            {nextStatus === 'DELIVERED' && (
                <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-900/20 rounded-lg p-2.5">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    <span>GPS diperlukan. Pastikan Anda berada dalam radius {delivery.geofence_radius}m dari tujuan.</span>
                </div>
            )}

            <input type="text" className="input text-sm py-2" placeholder="Catatan (opsional)"
                value={notes} onChange={e => setNotes(e.target.value)} />

            <button onClick={handleUpdate} className="btn-primary w-full text-sm" disabled={loading}>
                {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Memproses...</>
                ) : (
                    <><MapPin size={16} /> {STATUS_LABELS[nextStatus]}</>
                )}
            </button>
        </div>
    );
}