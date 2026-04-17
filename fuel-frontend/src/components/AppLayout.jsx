import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, MapPin, Users, User, Truck,
  LogOut, Fuel, ChevronRight
} from 'lucide-react';
import useAuthStore from '../store/authStore';

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
    <div className="flex h-screen overflow-hidden" style={{ background: '#F8FAFF' }}>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 xl:w-64 flex-shrink-0 bg-white"
        style={{ borderRight: '1px solid #E2E8F0', boxShadow: '1px 0 0 #E2E8F0' }}>

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', boxShadow: '0 2px 8px rgba(37,99,235,0.35)' }}>
            <Fuel size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>
              FuelDS
            </h1>
            <p className="text-[10px] font-medium mt-0.5" style={{ color: '#94A3B8' }}>
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
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'} />
                  <span className="flex-1">{label}</span>
                  {isActive && (
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
            style={{ hover: 'background:#F8FAFF' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F8FAFF'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            <AvatarImage
              src={user?.avatar_url}
              alt={user?.name}
              className="w-8 h-8 rounded-xl"
              style={{ border: '2px solid #E2E8F0' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: '#0F172A' }}>{user?.name}</p>
              <span className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md mt-0.5"
                style={{ background: roleInfo.bg, color: roleInfo.text }}>
                {roleInfo.label}
              </span>
            </div>
            <ChevronRight size={14} style={{ color: '#CBD5E1' }} />
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#FEF2F2';
              e.currentTarget.style.color = '#DC2626';
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white"
          style={{ borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 0 #F1F5F9' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}>
              <Fuel size={14} className="text-white" />
            </div>
            <span className="font-bold text-base" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>FuelDS</span>
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
        <header className="hidden lg:flex items-center justify-between px-6 py-3.5 bg-white"
          style={{ borderBottom: '1px solid #E2E8F0' }}>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: '#0F172A' }}>{pageLabel}</h2>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
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