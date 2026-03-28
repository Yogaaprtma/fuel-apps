import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Image } from 'lucide-react';
import { photoApi } from '../services/api';
import toast from 'react-hot-toast';

export default function PhotoUpload({ deliveryId, compact = false, onUploaded }) {
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [photoType, setPhotoType] = useState('IN_TRANSIT');
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const fileRef = useRef();

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
        if (!compact) setOpen(true);
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('photo', file);
            fd.append('photo_type', photoType);
            if (caption) fd.append('caption', caption);

            // Ambil GPS
            try {
                const pos = await new Promise((res, rej) =>
                    navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
                );
                fd.append('latitude', pos.coords.latitude);
                fd.append('longitude', pos.coords.longitude);
            } catch {}

            await photoApi.upload(deliveryId, fd);
            toast.success('Foto berhasil diupload');
            setFile(null); setPreview(null); setCaption(''); setOpen(false);
            onUploaded?.();
        } catch {
            toast.error('Gagal upload foto');
        } finally {
            setLoading(false);
        }
    };

    if (compact) return (
        <div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
            <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-flame transition-colors">
                <Camera size={16} /> Ambil Foto
            </button>
            {preview && (
                <div className="mt-2 flex items-center gap-2">
                    <img src={preview} alt="preview" className="w-16 h-16 rounded-lg object-cover" />
                    <button onClick={handleUpload} className="btn-primary text-xs py-1.5" disabled={loading}>
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        Upload
                    </button>

                    <button onClick={() => { setFile(null); setPreview(null); }} className="text-slate-600 hover:text-red-400">
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="card space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2"><Image size={18} className="text-flame" /> Upload Foto</h3>

            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />

            {!preview ? (
                <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-700 rounded-xl py-8 flex flex-col items-center gap-2 text-slate-500 hover:border-flame/50 hover:text-flame transition-all">
                    <Camera size={32} />
                    <span className="text-sm">Tap untuk ambil foto / pilih dari galeri</span>
                </button>
            ) : (
                <div className="relative">
                    <img src={preview} alt="Preview" className="w-full rounded-xl object-cover max-h-48" />
                    <button onClick={() => { setFile(null); setPreview(null); }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white">
                        <X size={16} />
                    </button>
                </div>
            )}

            <select className="input" value={photoType} onChange={e => setPhotoType(e.target.value)}>
                {['PICKUP','IN_TRANSIT','DESTINATION','OTHER'].map(t => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
            </select>

            <input type="text" className="input" placeholder="Keterangan foto (opsional)"
                value={caption} onChange={e => setCaption(e.target.value)} />

            <button onClick={handleUpload} className="btn-primary w-full" disabled={!file || loading}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                {loading ? 'Mengupload...' : 'Upload Foto'}
            </button>
        </div>
    );
}