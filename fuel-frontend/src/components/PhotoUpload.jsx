import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Image, CheckCircle } from 'lucide-react';
import { photoApi } from '../services/api';
import toast from 'react-hot-toast';

const PHOTO_TYPES = ['PICKUP', 'IN_TRANSIT', 'DESTINATION', 'OTHER'];

export default function PhotoUpload({ deliveryId, compact = false, onUploaded }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [photoType, setPhotoType] = useState('IN_TRANSIT');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      fd.append('photo_type', photoType);
      if (caption) fd.append('caption', caption);
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
        );
        fd.append('latitude', pos.coords.latitude);
        fd.append('longitude', pos.coords.longitude);
      } catch {}

      await photoApi.upload(deliveryId, fd);
      toast.success('Foto berhasil diupload!');
      setSuccess(true);
      setFile(null); setPreview(null); setCaption('');
      onUploaded?.();
    } catch {
      toast.error('Gagal upload foto');
    } finally {
      setLoading(false);
    }
  };

  if (compact) return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} id={`photo-file-compact-${deliveryId}`} />
      <button type="button" onClick={() => fileRef.current?.click()}
        className="flex items-center gap-2 text-sm transition-all duration-200 py-2"
        style={{ color: '#4a6080' }}
        onMouseEnter={e => e.currentTarget.style.color = '#f97316'}
        onMouseLeave={e => e.currentTarget.style.color = '#4a6080'}
        id={`take-photo-${deliveryId}`}>
        <Camera size={15} /> Ambil / Upload Foto
      </button>
      {preview && (
        <div className="mt-2 flex items-center gap-2">
          <img src={preview} alt="preview" className="w-14 h-14 rounded-xl object-cover"
            style={{ border: '1px solid rgba(30,45,66,0.8)' }} />
          <div className="flex flex-col gap-1.5">
            <button onClick={handleUpload} className="btn-primary text-xs py-1.5 px-3" disabled={loading} id={`upload-photo-${deliveryId}`}>
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {loading ? 'Upload...' : 'Upload'}
            </button>
            <button onClick={() => { setFile(null); setPreview(null); }}
              className="text-xs" style={{ color: '#4a6080' }}>
              <X size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-2">
        <Image size={16} style={{ color: '#f97316' }} />
        <h3 className="font-semibold text-text-primary text-sm">Upload Foto</h3>
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} id={`photo-file-${deliveryId}`} />

      {!preview ? (
        <button type="button" onClick={() => fileRef.current?.click()}
          className="w-full rounded-xl py-10 flex flex-col items-center gap-3 transition-all duration-200"
          style={{
            border: '2px dashed rgba(30,45,66,0.8)',
            color: '#4a6080',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)';
            e.currentTarget.style.color = '#f97316';
            e.currentTarget.style.background = 'rgba(249,115,22,0.03)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(30,45,66,0.8)';
            e.currentTarget.style.color = '#4a6080';
            e.currentTarget.style.background = '';
          }}
          id={`open-camera-${deliveryId}`}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}>
            <Camera size={24} style={{ color: '#f97316' }} />
          </div>
          <div>
            <p className="text-sm font-medium">Ambil foto atau pilih dari galeri</p>
            <p className="text-xs mt-0.5" style={{ color: '#2a3f5a' }}>Maks. 5MB · JPG, PNG</p>
          </div>
        </button>
      ) : (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full rounded-xl object-cover max-h-52" />
          <button onClick={() => { setFile(null); setPreview(null); }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(0,0,0,0.6)' }}>
            <X size={15} className="text-white" />
          </button>
        </div>
      )}

      {/* Photo type selection */}
      <div className="grid grid-cols-4 gap-1.5">
        {PHOTO_TYPES.map(t => (
          <button key={t} type="button" onClick={() => setPhotoType(t)}
            className="py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all"
            style={photoType === t ? {
              background: 'rgba(249,115,22,0.15)',
              color: '#f97316',
              border: '1px solid rgba(249,115,22,0.3)',
            } : {
              background: 'rgba(30,45,66,0.4)',
              color: '#4a6080',
              border: '1px solid rgba(30,45,66,0.8)',
            }}>
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      <input type="text" className="input text-sm" placeholder="Keterangan foto (opsional)"
        value={caption} onChange={e => setCaption(e.target.value)} id={`photo-caption-${deliveryId}`} />

      <button onClick={handleUpload} className="btn-primary w-full" disabled={!file || loading} id={`submit-photo-${deliveryId}`}>
        {loading
          ? <><Loader2 size={17} className="animate-spin" /> Mengupload...</>
          : <><Upload size={17} /> Upload Foto</>
        }
      </button>
    </div>
  );
}