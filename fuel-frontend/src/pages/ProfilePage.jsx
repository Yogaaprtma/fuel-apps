import React, { useState } from 'react';
import { User, Save, Loader2, Mail, Phone, Lock, Shield, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ROLE_LABELS = {
  'super-admin': 'Super Admin',
  'admin-operasional': 'Admin Operasional',
  'driver': 'Driver',
  'customer': 'Customer',
};

const ROLE_COLORS = {
  'super-admin': { color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.25)' },
  'admin-operasional': { color: '#60a5fa', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.25)' },
  'driver': { color: '#fb923c', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.25)' },
  'customer': { color: '#4ade80', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.25)' },
};

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    current_password: '', new_password: '', new_password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState('info'); // 'info' | 'password'

  const role = user?.roles?.[0];
  const roleConfig = ROLE_COLORS[role] ?? ROLE_COLORS['customer'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      await authApi.update(fd);
      toast.success('Profil berhasil diupdate!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal update profil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-lg space-y-5 animate-fade-in">
      {/* Header */}
      <h1 className="page-title">Profil Saya</h1>

      {/* Profile hero card */}
      <div className="card relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top right, ${roleConfig.color}10, transparent 60%)` }} />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative flex-shrink-0">
            <img
              src={user?.avatar_url}
              alt={user?.name}
              className="w-20 h-20 rounded-2xl object-cover"
              style={{ border: `2px solid ${roleConfig.color}40` }}
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 flex items-center justify-center"
              style={{ border: '2px solid #060d1a', boxShadow: '0 0 8px rgba(74,222,128,0.6)' }}>
              <div className="w-2 h-2 bg-green-400 rounded-full" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="font-display text-xl font-bold text-text-primary">{user?.name}</h2>
            <p className="text-sm mt-0.5" style={{ color: '#4a6080' }}>{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              {user?.roles?.map(r => {
                const cfg = ROLE_COLORS[r] ?? roleConfig;
                return (
                  <span key={r} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                    <Shield size={11} />
                    {ROLE_LABELS[r] ?? r}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Section toggle */}
      <div className="flex gap-1 p-1 rounded-xl"
        style={{ background: 'rgba(6,13,26,0.8)', border: '1px solid rgba(30,45,66,0.8)' }}>
        {[{ id: 'info', label: 'Informasi', icon: User }, { id: 'password', label: 'Password', icon: Lock }].map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
            id={`section-${s.id}`}
            style={section === s.id ? {
              background: 'linear-gradient(135deg, #f97316, #ea6c0a)',
              color: 'white',
              boxShadow: '0 2px 12px rgba(249,115,22,0.3)',
            } : { color: '#4a6080' }}>
            <s.icon size={15} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Info form */}
      {section === 'info' && (
        <form onSubmit={handleSubmit} className="card space-y-5 animate-fade-in">
          <div>
            <label className="label">Nama Lengkap</label>
            <div className="relative">
              <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#4a6080' }} />
              <input className="input pl-10" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                id="profile-name" placeholder="Nama lengkap" />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#4a6080' }} />
              <input className="input pl-10 opacity-50" type="email" value={user?.email}
                disabled placeholder="Email tidak bisa diubah" />
            </div>
          </div>
          <div>
            <label className="label">Nomor HP</label>
            <div className="relative">
              <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#4a6080' }} />
              <input className="input pl-10" type="tel" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                id="profile-phone" placeholder="08xxxxxxxxxx" />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading} id="save-profile">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Save size={16} /> Simpan Perubahan</>}
          </button>
        </form>
      )}

      {/* Password form */}
      {section === 'password' && (
        <form onSubmit={handleSubmit} className="card space-y-5 animate-fade-in">
          {[
            { field: 'current_password', label: 'Password Lama' },
            { field: 'new_password', label: 'Password Baru' },
            { field: 'new_password_confirmation', label: 'Konfirmasi Password Baru' },
          ].map(({ field, label }) => (
            <div key={field}>
              <label className="label">{label}</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#4a6080' }} />
                <input className="input pl-10" type="password" value={form[field]}
                  onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                  id={`profile-${field}`} placeholder="••••••••" />
              </div>
            </div>
          ))}
          <button type="submit" className="btn-primary w-full" disabled={loading} id="save-password">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Mengubah...</> : <><Lock size={16} /> Ubah Password</>}
          </button>
        </form>
      )}

      {/* Logout button */}
      <button onClick={handleLogout}
        className="w-full btn-danger flex items-center justify-center gap-2 py-3" id="logout-btn">
        <LogOut size={16} /> Keluar dari Akun
      </button>
    </div>
  );
}