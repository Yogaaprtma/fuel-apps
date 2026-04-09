import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Fuel, Zap, Shield, MapPin } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  { role: 'Super Admin', email: 'superadmin@fds.com', color: '#f97316' },
  { role: 'Admin Ops',   email: 'admin@fds.com',      color: '#06b6d4' },
  { role: 'Driver',      email: 'driver1@fds.com',     color: '#22d3ee' },
  { role: 'Customer',    email: 'customer@fds.com',    color: '#a78bfa' },
];

export default function LoginPage() {
  const [email, setEmail]       = useState('');
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
      toast.error(err.message);
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password');
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: '#030712' }}>
      {/* ── Left Panel (hero) — hidden on mobile ── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #060d1a 0%, #030712 100%)' }}>

        {/* Grid bg */}
        <div className="absolute inset-0 bg-grid opacity-40" />

        {/* Energy rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          {[320, 480, 640, 800].map((size, i) => (
            <div key={size} className="absolute rounded-full border"
              style={{
                width: size, height: size,
                top: -size/2, left: -size/2,
                borderColor: `rgba(249,115,22,${0.08 - i*0.015})`,
                animation: `spin ${20 + i*5}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
              }} />
          ))}
          {/* Core glow */}
          <div className="absolute -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(249,115,22,0.15), transparent 70%)',
              animation: 'glowPulse 3s ease-in-out infinite',
            }} />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea6c0a)',
              boxShadow: '0 0 20px rgba(249,115,22,0.5)',
            }}>
            <Fuel size={20} className="text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-white text-lg">FuelDS</span>
            <span className="text-xs block" style={{ color: '#4a6080' }}>Fuel Delivery System</span>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 text-center px-10">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-float"
            style={{
              background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(249,115,22,0.05))',
              border: '1px solid rgba(249,115,22,0.3)',
              boxShadow: '0 0 40px rgba(249,115,22,0.2)',
            }}>
            <Fuel size={36} style={{ color: '#f97316' }} />
          </div>
          <h1 className="font-display text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
            Monitor Distribusi<br />
            <span className="text-gradient-orange">Bahan Bakar</span>
          </h1>
          <p className="text-base leading-relaxed max-w-md mx-auto" style={{ color: '#4a6080' }}>
            Sistem tracking pengiriman BBM real-time dengan geofencing, 
            bukti pengiriman digital, dan monitoring live map.
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { icon: MapPin, label: 'Live Tracking', desc: 'GPS real-time', color: '#f97316' },
            { icon: Shield, label: 'Anti-Fraud', desc: 'Geofencing', color: '#06b6d4' },
            { icon: Zap, label: 'Instant Alert', desc: 'Status update', color: '#a78bfa' },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="text-center p-3 rounded-xl"
              style={{
                background: 'rgba(13, 20, 36, 0.6)',
                border: '1px solid rgba(30, 45, 66, 0.8)',
              }}>
              <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
                style={{ background: `rgba(${color === '#f97316' ? '249,115,22' : color === '#06b6d4' ? '6,182,212' : '167,139,250'},0.15)` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <p className="text-xs font-semibold text-white">{label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: '#4a6080' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="flex-1 lg:max-w-md flex flex-col items-center justify-center px-6 py-12 relative"
        style={{ background: 'rgba(6, 13, 26, 0.98)' }}>

        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea6c0a)',
              boxShadow: '0 0 24px rgba(249,115,22,0.5)',
            }}>
            <Fuel size={26} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">FuelDS</h1>
          <p className="text-sm mt-1" style={{ color: '#4a6080' }}>Fuel Delivery System</p>
        </div>

        <div className="w-full max-w-sm animate-slide-up">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-white">Masuk</h2>
            <p className="text-sm mt-1" style={{ color: '#4a6080' }}>
              Gunakan akun yang diberikan admin
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl p-6 mb-5"
            style={{
              background: 'rgba(13, 20, 36, 0.9)',
              border: '1px solid rgba(30, 45, 66, 0.8)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="nama@perusahaan.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  id="login-email"
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input pr-11"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    id="login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
                    style={{ color: '#4a6080' }}
                    id="toggle-password"
                  >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full mt-2 py-3"
                disabled={loading}
                id="login-submit"
              >
                {loading
                  ? <><Loader2 size={17} className="animate-spin" /> Memproses...</>
                  : 'Masuk ke Dashboard'
                }
              </button>
            </form>
          </div>

          {/* Demo accounts */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-center mb-3"
              style={{ color: '#2a3f5a' }}>
              Akun Demo
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map(({ role, email: demoEmail, color }) => (
                <button
                  key={role}
                  onClick={() => fillDemo(demoEmail)}
                  className="text-left p-3 rounded-xl transition-all duration-200"
                  style={{
                    background: 'rgba(13, 20, 36, 0.6)',
                    border: '1px solid rgba(30, 45, 66, 0.7)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${color}40`;
                    e.currentTarget.style.background = `${color}08`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(30, 45, 66, 0.7)';
                    e.currentTarget.style.background = 'rgba(13, 20, 36, 0.6)';
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                    <span className="text-xs font-semibold text-text-primary">{role}</span>
                  </div>
                  <p className="text-[10px] font-mono truncate" style={{ color: '#4a6080' }}>{demoEmail}</p>
                </button>
              ))}
            </div>
            <p className="text-center text-[10px] mt-2" style={{ color: '#2a3f5a' }}>
              Password: <span className="font-mono">password</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}