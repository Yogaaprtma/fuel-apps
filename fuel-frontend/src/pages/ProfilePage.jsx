import React, { useState } from 'react';
import { User, Save, Loader2, Mail, Phone, Lock, Shield, LogOut, Bell, BellOff } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import usePushNotification from '../hooks/usePushNotification';
import useTheme from '../hooks/useTheme';

// Komponen avatar dengan fallback icon
function AvatarImage({ src, alt, className, style }) {
  const [imgError, setImgError] = useState(false);
  const hasValidSrc = src && src !== 'null' && src !== 'undefined';

  const { isDark } = useTheme();

    return (
      <div
        className={`flex items-center justify-center flex-shrink-0 ${className ?? ''}`}
        style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-main)', ...style }}
      >
        <User size={28} style={{ color: 'var(--text-dim)' }} />
      </div>
    );

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover flex-shrink-0 ${className ?? ''}`}
      style={style}
      onError={() => setImgError(true)}
    />
  );
}

const ROLE_CONFIG = {
  'super-admin':       { label: 'Super Admin',        color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  'admin-operasional': { label: 'Admin Operasional',  color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  'driver':            { label: 'Driver',              color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  'customer':          { label: 'Customer',            color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
};

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { subscribed, subscribe, unsubscribe } = usePushNotification();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState('info');
  const { isDark } = useTheme();

  const role       = user?.roles?.[0];
  const roleCfg    = ROLE_CONFIG[role] ?? ROLE_CONFIG['customer'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      await authApi.update(fd);
      toast.success('Profil berhasil diperbarui!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil');
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
      <h1 className="page-title">Profil Saya</h1>

      {/* Profile hero */}
      <div className="card text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative flex-shrink-0">
            <AvatarImage
              src={user?.avatar_url}
              alt={user?.name}
              className="w-20 h-20 rounded-2xl"
              style={{ border: '2px solid #E2E8F0' }}
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
              style={{ border: '2px solid white' }}>
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>{user?.name}</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            {user?.phone && <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{user.phone}</p>}
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              {user?.roles?.map(r => {
                const cfg = ROLE_CONFIG[r] ?? roleCfg;
                return (
                  <span key={r} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                    <Shield size={11} />
                    {cfg.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--bg-muted)' }}>
        {[
          { id: 'info',     label: 'Informasi', icon: User },
          { id: 'password', label: 'Password',  icon: Lock },
        ].map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
            id={`section-${s.id}`}
            style={section === s.id
              ? { background: 'var(--bg-card)', color: 'var(--primary)', boxShadow: 'var(--shadow)' }
              : { color: 'var(--text-muted)' }
            }>
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
              <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-10" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                id="profile-name" placeholder="Nama lengkap" />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-10 bg-slate-50 cursor-not-allowed" type="email"
                value={user?.email} disabled />
            </div>
            <p className="text-xs mt-1 text-slate-400">Email tidak dapat diubah</p>
          </div>

          <div>
            <label className="label">Nomor HP</label>
            <div className="relative">
              <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-10" type="tel" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                id="profile-phone" placeholder="08xxxxxxxxxx" />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading} id="save-profile">
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
              : <><Save size={16} /> Simpan Perubahan</>
            }
          </button>
        </form>
      )}

      {/* Password form */}
      {section === 'password' && (
        <form onSubmit={handleSubmit} className="card space-y-5 animate-fade-in">
          {[
            { field: 'current_password',          label: 'Password Saat Ini' },
            { field: 'new_password',               label: 'Password Baru' },
            { field: 'new_password_confirmation',  label: 'Konfirmasi Password Baru' },
          ].map(({ field, label }) => (
            <div key={field}>
              <label className="label">{label}</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input pl-10" type="password" value={form[field]}
                  onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                  id={`profile-${field}`} placeholder="••••••••" />
              </div>
            </div>
          ))}
          <div className="alert-info text-sm">
            <Shield size={16} className="flex-shrink-0" />
            <p className="text-xs">Password minimal 8 karakter. Gunakan kombinasi huruf dan angka.</p>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading} id="save-password">
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Mengubah...</>
              : <><Lock size={16} /> Ubah Password</>
            }
          </button>
        </form>
      )}

      {/* Push Notification Toggle */}
      <div className="card">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: subscribed ? (isDark ? '#1E3A8A' : '#EFF6FF') : (isDark ? '#1E293B' : '#F8FAFC'), border: `1.5px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
              {subscribed
                ? <Bell size={16} style={{ color: isDark ? '#60A5FA' : '#2563EB' }} />
                : <BellOff size={16} style={{ color: isDark ? '#64748B' : '#94A3B8' }} />
              }
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: isDark ? '#F1F5F9' : '#334155' }}>Notifikasi Browser</p>
              <p className="text-xs" style={{ color: isDark ? '#94A3B8' : '#94A3B8' }}>{subscribed ? 'Notifikasi aktif di perangkat ini' : 'Aktifkan untuk dapat update real-time'}</p>
            </div>
          </div>
          <button
            onClick={subscribed ? unsubscribe : subscribe}
            id="push-toggle"
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              subscribed
                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            {subscribed ? 'Matikan' : 'Aktifkan'}
          </button>
        </div>
      </div>

      {/* Logout */}
      <button onClick={handleLogout}
        className="w-full btn-danger flex items-center justify-center gap-2 py-3" id="logout-btn">
        <LogOut size={16} /> Keluar dari Akun
      </button>
    </div>
  );
}