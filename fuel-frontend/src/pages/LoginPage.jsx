import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Fuel, MapPin, Shield, Zap, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const FEATURES = [
  {
    icon: MapPin,
    title: 'Live GPS Tracking',
    desc: 'Pantau posisi driver secara real-time dengan peta interaktif.',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    icon: Shield,
    title: 'Anti-Fraud Geofencing',
    desc: 'Validasi lokasi pengiriman secara otomatis dengan radius aman.',
    color: '#10B981',
    bg: '#ECFDF5',
  },
  {
    icon: Zap,
    title: 'Update Status Instan',
    desc: 'Status pengiriman terupdate langsung dari aplikasi driver.',
    color: '#F97316',
    bg: '#FFF7ED',
  },
];

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, loading }      = useAuthStore();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Selamat datang!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Login gagal. Periksa email & password.');
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: '#F8FAFF' }}>

      {/* ── Left Panel — Hero ── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 50%, #2563EB 100%)' }}>

        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />

        {/* Soft gradient orbs */}
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #60A5FA, transparent 70%)', transform: 'translate(30%, 30%)' }} />
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #BFDBFE, transparent 70%)', transform: 'translate(-30%, -30%)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm"
            style={{ border: '1px solid rgba(255,255,255,0.3)' }}>
            <Fuel size={20} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-white" style={{ letterSpacing: '-0.02em' }}>FuelDS</span>
            <span className="text-xs block text-blue-200">Fuel Delivery System</span>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <div className="w-24 h-24 rounded-3xl mb-8 flex items-center justify-center bg-white/15 backdrop-blur-sm animate-bounce-subtle"
            style={{ border: '1px solid rgba(255,255,255,0.25)' }}>
            <Fuel size={44} className="text-white" />
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight" style={{ letterSpacing: '-0.03em' }}>
            Monitor Distribusi<br />
            <span className="text-blue-200">Bahan Bakar</span>
          </h1>
          <p className="text-blue-100 text-base leading-relaxed max-w-sm">
            Sistem tracking pengiriman BBM real-time dengan geofencing,
            bukti pengiriman digital, dan monitoring live map.
          </p>
        </div>

        {/* Feature cards */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="p-4 rounded-2xl backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-white/20">
                <Icon size={17} className="text-white" />
              </div>
              <p className="text-xs font-semibold text-white">{title}</p>
              <p className="text-[11px] mt-1 text-blue-200 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div className="flex-1 lg:max-w-lg flex flex-col items-center justify-center px-6 py-12 bg-white relative"
        style={{ background: 'var(--bg-card)', boxShadow: '-4px 0 20px rgba(0,0,0,0.04)' }}>

        {/* Mobile logo */}
        <div className="lg:hidden mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}>
            <Fuel size={28} className="text-white" />
          </div>
          <h1 className="font-bold text-2xl" style={{ color: 'var(--text-main)', letterSpacing: '-0.02em' }}>FuelDS</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Fuel Delivery System</p>
        </div>

        <div className="w-full max-w-sm animate-slide-up">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="font-bold text-2xl" style={{ color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Masuk ke Sistem
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Gunakan akun yang telah diberikan oleh admin.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                className="input"
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label" htmlFor="login-password">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="input pr-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  id="toggle-password"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 mt-2 text-base"
              disabled={loading}
              id="login-submit"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Memproses...</>
              ) : (
                <><span>Masuk ke Dashboard</span><ArrowRight size={17} /></>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-8 p-4 rounded-xl" style={{ background: '#F8FAFF', border: '1px solid #E2E8F0' }}>
            <p className="text-xs font-semibold text-slate-500 mb-2">ℹ️ Informasi Login</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Akun dibuat oleh administrator sistem. Jika Anda belum memiliki akun atau lupa password,
              silakan hubungi admin operasional Anda.
            </p>
          </div>

          {/* Track link */}
          <div className="mt-4 text-center">
            <a
              href="/track"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Lacak pengiriman tanpa login →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}