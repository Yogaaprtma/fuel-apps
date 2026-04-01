import React, { useState } from 'react';
import { User, Save, Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user } = useAuthStore();
    const [form, setForm] = useState({
        name: user?.name || '', phone: user?.phone || '',
        current_password: '', new_password: '', new_password_confirmation: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
            await authApi.update(fd);
            toast.success('Profil berhasil diupdate');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal update profil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg space-y-5">
            <h1 className="font-display text-2xl font-bold text-white">Profil Saya</h1>

            <div className="card text-center">
                <img src={user?.avatar_url} alt={user?.name}
                    className="w-20 h-20 rounded-2xl object-cover mx-auto mb-3 ring-4 ring-flame/20" />
                <p className="font-semibold text-white text-lg">{user?.name}</p>
                <p className="text-slate-500 text-sm">{user?.email}</p>
                <div className="mt-2 inline-flex gap-2">
                    {user?.roles?.map(r => (
                        <span key={r} className="status-badge bg-flame/20 text-flame capitalize">{r.replace('-', ' ')}</span>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="card space-y-4">
                <h2 className="font-semibold text-white">Edit Profil</h2>
                <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Nama</label>
                    <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Nomor HP</label>
                    <input className="input" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>

                <div className="pt-2 border-t border-slate-700/50">
                    <h3 className="font-medium text-white mb-3">Ganti Password</h3>
                    <div className="space-y-3">
                        {['current_password', 'new_password', 'new_password_confirmation'].map(field => (
                            <div key={field}>
                                <label className="block text-sm text-slate-400 mb-1.5">
                                    {field === 'current_password' ? 'Password Lama' : field === 'new_password' ? 'Password Baru' : 'Konfirmasi Password'}
                                </label>
                                <input className="input" type="password" value={form[field]}
                                    onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="btn-primary w-full" disabled={loading}>
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </form>
        </div>
    );
}