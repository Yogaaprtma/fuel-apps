import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Image, CheckCircle2 } from 'lucide-react';
import { photoApi } from '../services/api';
import toast from 'react-hot-toast';

const PHOTO_TYPES = [
  { value: 'PICKUP',        label: 'Pickup',        color: '#2563EB' },
  { value: 'IN_TRANSIT',    label: 'In Transit',    color: '#F97316' },
  { value: 'DESTINATION',   label: 'Destination',   color: '#10B981' },
  { value: 'VOLUME_METER',  label: 'Struk/Meter',   color: '#7C3AED' },
  { value: 'OTHER',         label: 'Lainnya',       color: '#94A3B8' },
];

export default function PhotoUpload({ deliveryId, compact = false, onUploaded }) {
  const [preview,   setPreview]   = useState(null);
  const [file,      setFile]      = useState(null);
  const [type,      setType]      = useState('IN_TRANSIT');
  const [caption,   setCaption]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [uploaded,  setUploaded]  = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setUploaded(false);
  };

  const handleCamera = () => fileRef.current?.click();

  const handleUpload = async () => {
    if (!file) return toast.error('Pilih foto terlebih dahulu');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo',      file);
      formData.append('photo_type', type);
      if (caption) formData.append('caption', caption);

      // Try to get GPS
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
        );
        formData.append('latitude',  pos.coords.latitude);
        formData.append('longitude', pos.coords.longitude);
      } catch {
        // GPS optional
      }

      await photoApi.upload(deliveryId, formData);
      toast.success('Foto berhasil diunggah!');
      setPreview(null);
      setFile(null);
      setCaption('');
      setUploaded(true);
      onUploaded?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal upload foto');
    } finally {
      setLoading(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setFile(null);
    setUploaded(false);
  };

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => handleFile(e.target.files[0])}
      />

      {/* Type selector */}
      {!compact && (
        <div className="flex flex-wrap gap-1.5">
          {PHOTO_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
              style={type === t.value ? {
                background: `${t.color}15`,
                color: t.color,
                border: `1px solid ${t.color}40`,
              } : {
                background: '#F8FAFC',
                color: '#94A3B8',
                border: '1px solid #E2E8F0',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Preview */}
      {preview ? (
        <div className="relative">
          <img src={preview} alt="preview" className="w-full rounded-xl object-cover max-h-48"
            style={{ border: '1px solid #E2E8F0' }} />
          <button onClick={clearPreview}
            className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #E2E8F0' }}>
            <X size={14} className="text-slate-600" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleCamera}
          className={`w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 ${
            compact ? 'py-3' : 'py-6'
          }`}
          style={{ borderColor: '#CBD5E1', background: '#F8FAFC' }}
        >
          {uploaded ? (
            <>
              <CheckCircle2 size={compact ? 18 : 24} className="text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600">{compact ? 'Upload lagi' : 'Foto terupload!'}</span>
            </>
          ) : (
            <>
              <Camera size={compact ? 18 : 24} className="text-slate-400" />
              <span className="text-xs font-medium text-slate-500">
                {compact ? 'Ambil Foto' : 'Ambil foto / pilih dari galeri'}
              </span>
            </>
          )}
        </button>
      )}

      {/* Caption (non-compact) */}
      {preview && !compact && (
        <input
          type="text"
          className="input text-xs"
          placeholder="Keterangan foto (opsional)..."
          value={caption}
          onChange={e => setCaption(e.target.value)}
        />
      )}

      {/* Upload button */}
      {preview && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="btn-primary w-full py-2.5"
        >
          {loading
            ? <><Loader2 size={15} className="animate-spin" /> Mengupload...</>
            : <><Upload size={15} /> Upload Foto</>
          }
        </button>
      )}
    </div>
  );
}