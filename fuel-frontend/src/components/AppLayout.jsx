import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, MapPin, Users, User, Truck,
  LogOut, Fuel, ChevronRight, Moon, Sun, Bell
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useTheme from '../hooks/useTheme';
import useNotifications from '../hooks/useNotifications';

// Komponen avatar dengan fallback icon jika foto gagal load / kosong
function AvatarImage({ src, alt, className, style, onClick }) {
  const [imgError, setImgError] = useState(false);
  const hasValidSrc = src && src !== 'null' && src !== 'undefined';

  if (!hasValidSrc || imgError) {
    return (
      <div
        className={`flex items-center justify-center flex-shrink-0 ${className ?? ''}`}
        style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', ...style }}
        onClick={onClick}
      >
        <User size={16} style={{ color: '#2563EB' }} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover flex-shrink-0 ${className ?? ''}`}
      style={style}
      onClick={onClick}
      onError={() => setImgError(true)}
    />
  );
}

const NAV_ITEMS = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard', roles: ['super-admin','admin-operasional','driver','customer'] },
  { to: '/deliveries', icon: Package,         label: 'Delivery',  roles: ['super-admin','admin-operasional','driver','customer'] },
  { to: '/tracking',   icon: MapPin,          label: 'Tracking',  roles: ['super-admin','admin-operasional','driver'] },
  { to: '/driver',     icon: Truck,           label: 'Driver',    roles: ['driver'] },
  { to: '/users',      icon: Users,           label: 'Users',     roles: ['super-admin','admin-operasional'] },
  { to: '/profile',    icon: User,            label: 'Profil',    roles: ['super-admin','admin-operasional','driver','customer'] },
];

const ROLE_COLORS = {
  'super-admin':      { bg: '#EFF6FF', text: '#2563EB', label: 'Super Admin' },
  'admin-operasional':{ bg: '#F0FDF4', text: '#16A34A', label: 'Admin Ops' },
  'driver':           { bg: '#FFF7ED', text: '#EA580C', label: 'Driver' },
  'customer':         { bg: '#F5F3FF', text: '#7C3AED', label: 'Customer' },
};

export default function AppLayout() {
  const { user, logout, hasRole } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount, urgentDeliveries, clearNotifications } = useNotifications();
  const [showBell, setShowBell] = useState(false);

  const visibleNav = NAV_ITEMS.filter(item => item.roles.some(r => hasRole(r)));
  const mobileNav  = visibleNav.slice(0, 5);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleKey   = user?.roles?.[0];
  const roleInfo  = ROLE_COLORS[roleKey] ?? { bg: '#F1F5F9', text: '#475569', label: roleKey };
  const pageLabel = NAV_ITEMS.find(n => n.to === location.pathname)?.label ?? 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-main)' }}>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 xl:w-64 flex-shrink-0"
        style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-main)', boxShadow: 'var(--shadow)' }}>

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', boxShadow: '0 2px 8px rgba(37,99,235,0.35)' }}>
            <Fuel size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight" style={{ color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              FuelDS
            </h1>
            <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Fuel Delivery System
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="divider mx-4 mb-3" />

        {/* Section label */}
        <div className="px-4 mb-1">
          <p className="section-title">Menu</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto">
          {visibleNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? (isDark ? 'bg-blue-900/40 text-blue-400 font-semibold' : 'bg-blue-50 text-blue-600 font-semibold')
                    : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700')
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'} 
                    style={{ color: isActive ? 'var(--primary)' : 'var(--text-dim)' }} />
                  <span className="flex-1">{label}</span>
                  {/* Badge notifikasi di menu Delivery */}
                  {label === 'Delivery' && unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: '#EF4444', minWidth: '18px', textAlign: 'center' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  {isActive && unreadCount === 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div className="divider mx-4 my-3" />

        {/* User info */}
        <div className="px-3 pb-4 space-y-1">
          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left"
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <AvatarImage
              src={user?.avatar_url}
              alt={user?.name}
              className="w-10 h-10 rounded-xl"
              style={{ border: '2px solid var(--border-main)' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-main)' }}>{user?.name}</p>
              <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
            <ChevronRight size={14} style={{ color: 'var(--text-dim)' }} />
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = isDark ? '#450a0a' : '#FEF2F2';
              e.currentTarget.style.color = '#EF4444';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '';
              e.currentTarget.style.color = '#94A3B8';
            }}
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: 'var(--bg-main)' }}>

        {/* Mobile Topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3"
          style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-main)' }}>
          <div className="flex items-center gap-2.5">
            <Fuel size={18} className="text-blue-600" />
            <span className="font-bold text-base" style={{ color: 'var(--text-main)', letterSpacing: '-0.02em' }}>FuelDS</span>
          </div>

          <div className="flex items-center gap-2">
            <AvatarImage
              src={user?.avatar_url}
              alt={user?.name}
              className="w-8 h-8 rounded-xl cursor-pointer"
              style={{ border: '2px solid #E2E8F0' }}
              onClick={() => navigate('/profile')}
            />
          </div>
        </header>

        {/* Desktop Topbar */}
        <header className="hidden lg:flex items-center justify-between px-6 py-3.5"
          style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-main)' }}>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{pageLabel}</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Fuel Delivery Tracking System
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="btn-ghost p-2"
              style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-main)' }}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark
                ? <Sun size={14} className="text-yellow-400" />
                : <Moon size={14} className="text-slate-400" />
              }
            </button>

            {/* Notification bell with dropdown */}
            {unreadCount > 0 && (
              <div className="relative">
                <button
                  onClick={() => { setShowBell(v => !v); clearNotifications(); }}
                  className="relative w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
                  title={`${unreadCount} delivery perlu perhatian`}
                >
                  <Bell size={14} className="text-red-500" />
                  <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </button>

                {/* Dropdown panel */}
                {showBell && (
                  <>
                    {/* Overlay untuk close */}
                    <div className="fixed inset-0 z-40" onClick={() => setShowBell(false)} />
                    <div className="absolute right-0 top-10 z-50 w-72 rounded-2xl shadow-xl"
                      style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Delivery Perlu Perhatian</p>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {urgentDeliveries.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-6">Tidak ada notifikasi</p>
                        ) : urgentDeliveries.map(d => (
                          <button key={d.id}
                            onClick={() => { setShowBell(false); navigate(`/deliveries/${d.id}`); }}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-semibold text-slate-700">{d.delivery_code}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{
                                  background: d.status === 'DELIVERED' ? '#ECFDF5' : d.status === 'NEAR_DESTINATION' ? '#ECFEFF' : '#FFFBEB',
                                  color: d.status === 'DELIVERED' ? '#059669' : d.status === 'NEAR_DESTINATION' ? '#0E7490' : '#D97706',
                                }}>
                                {d.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{d.customer_name}</p>
                          </button>
                        ))}
                      </div>
                      <div className="px-4 py-2.5 border-t border-slate-100">
                        <button onClick={() => { setShowBell(false); navigate('/deliveries'); }}
                          className="text-xs text-blue-600 font-semibold hover:text-blue-700">
                          Lihat semua delivery →
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              System Online
            </div>
          </div>
        </header>

        {/* Page Content */}
        {/* pb-32 mobile: memberi ruang cukup agar konten tidak tertutup bottom nav (~72px) + safe area */}
        <main className="flex-1 overflow-y-auto pb-32 lg:pb-6 px-4 py-5 lg:px-6 lg:py-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>

        {/* ── Mobile Bottom Navigation ── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white"
          style={{ borderTop: '1px solid #E2E8F0', boxShadow: '0 -4px 20px rgba(0,0,0,0.06)', paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
          <div className="flex items-center justify-around px-1 pt-1.5 pb-2">
            {mobileNav.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className="flex flex-col items-center gap-0.5 flex-1 min-w-0 relative py-1"
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      isActive ? 'bg-blue-50' : ''
                    }`}>
                      <Icon
                        size={20}
                        strokeWidth={isActive ? 2.5 : 1.8}
                        className={isActive ? 'text-blue-600' : 'text-slate-400'}
                      />
                    </div>
                    <span className={`text-[9px] font-semibold uppercase tracking-wide transition-colors duration-200 ${
                      isActive ? 'text-blue-600' : 'text-slate-400'
                    }`}>
                      {label}
                    </span>
                    {isActive && (
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-blue-600" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}