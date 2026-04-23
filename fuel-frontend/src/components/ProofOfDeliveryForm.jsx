import React, { useState } from 'react';
import { CheckCircle, Loader2, MapPin, User, PenTool } from 'lucide-react';
import toast from 'react-hot-toast';
import SignaturePad from './SignaturePad';
import { proofApi } from '../services/api';

export default function ProofOfDeliveryForm({ delivery, onCompleted }) {
  const [recipientName, setRecipientName] = useState(delivery.customer_name || '');
  const [signature,     setSignature]     = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [gpsLoading,    setGpsLoading]    = useState(false);
  const [coords,        setCoords]        = useState(null);

  const getGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
        toast.success('GPS berhasil diambil');
      },
      () => { toast.error('Gagal ambil GPS'); setGpsLoading(false); }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipientName.trim()) return toast.error('Nama penerima wajib diisi');
    if (!signature)            return toast.error('Tanda tangan wajib diisi');
    if (!coords)               return toast.error('GPS wajib diambil terlebih dahulu');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('recipient_name', recipientName);
      formData.append('signature',      signature);
      formData.append('latitude',       coords.lat);
      formData.append('longitude',      coords.lng);

      await proofApi.submit(delivery.id, formData);
      toast.success('✅ Bukti pengiriman tersimpan! Status otomatis COMPLETED.');
      onCompleted?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal submit bukti pengiriman');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#ECFDF5' }}>
          <CheckCircle size={16} style={{ color: '#059669' }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Bukti Penerimaan (POD)</p>
          <p className="text-xs text-slate-400">Isi data dan tanda tangan penerima</p>
        </div>
      </div>

      {/* Nama penerima */}
      <div>
        <label className="label flex items-center gap-1.5 mb-1">
          <User size={13} /> Nama Penerima
        </label>
        <input
          type="text"
          className="input"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          placeholder="Nama penerima BBM"
          required
        />
      </div>

      {/* GPS */}
      <div>
        <label className="label flex items-center gap-1.5 mb-1">
          <MapPin size={13} /> Lokasi Konfirmasi
        </label>
        {coords ? (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
            style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
            <MapPin size={14} className="text-emerald-500 flex-shrink-0" />
            <span className="font-mono text-emerald-700 text-xs">
              {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
            </span>
          </div>
        ) : (
          <button type="button" onClick={getGPS} disabled={gpsLoading}
            className="btn-secondary w-full text-sm">
            {gpsLoading
              ? <><Loader2 size={14} className="animate-spin" /> Mengambil GPS...</>
              : <><MapPin size={14} /> Ambil Lokasi GPS Sekarang</>
            }
          </button>
        )}
      </div>

      {/* Signature */}
      <div>
        <label className="label flex items-center gap-1.5 mb-1">
          <PenTool size={13} /> Tanda Tangan Penerima
        </label>
        <SignaturePad onChange={setSignature} />
      </div>

      <button
        type="submit"
        disabled={loading || !signature || !coords}
        className="btn-primary w-full"
        style={{ background: loading || !signature || !coords ? '#E2E8F0' : '' }}
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
          : <><CheckCircle size={16} /> Konfirmasi & Selesaikan Pengiriman</>
        }
      </button>
    </form>
  );
}
