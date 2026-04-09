import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, MapPin, Users, User, Truck,
  LogOut, Fuel, Bell, Settings, ChevronDown, Activity
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const NAV_ITEMS = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard', roles: ['super-admin','admin-operasional','driver','customer'] },
  { to: '/deliveries', icon: Package,         label: 'Delivery',  roles: ['super-admin','admin-operasional','driver','customer'] },
  { to: '/tracking',   icon: MapPin,          label: 'Tracking',  roles: ['super-admin','admin-operasional','driver'] },
  { to: '/driver',     icon: Truck,           label: 'Driver',    roles: ['driver'] },
  { to: '/users',      icon: Users,           label: 'Users',     roles: ['super-admin','admin-operasional'] },
  { to: '/profile',    icon: User,            label: 'Profil',    roles: ['super-admin','admin-operasional','driver','customer'] },
];

const ROLE_LABELS = {
  'super-admin': 'Super Admin',
  'admin-operasional': 'Admin Ops',
  'driver': 'Driver',
  'customer': 'Customer',
};

export default function AppLayout() {
  const { user, logout, hasRole } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const visibleNav = NAV_ITEMS.filter(item => item.roles.some(r => hasRole(r)));
  const mobileNav = visibleNav.slice(0, 5);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleLabel = ROLE_LABELS[user?.roles?.[0]] ?? user?.roles?.[0];

  return (
    <div className="flex h-screen overflow-hidden bg-void">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #f97316, transparent 70%)' }} />
        <div className="absolute top-1/2 -right-40 w-80 h-80 rounded-full opacity-4"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }} />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full opacity-3"
          style={{ background: 'radial-gradient(circle, #f97316, transparent 70%)' }} />
      </div>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 xl:w-64 flex-shrink-0 relative z-10"
        style={{
          background: 'rgba(6, 13, 26, 0.95)',
          borderRight: '1px solid rgba(30, 45, 66, 0.8)',
        }}>
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea6c0a)',
              boxShadow: '0 0 20px rgba(249,115,22,0.4)',
            }}>
            <Fuel size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-text-primary text-base leading-tight">FuelDS</h1>
            <p className="text-[10px] font-medium mt-0.5" style={{ color: '#4a6080' }}>Delivery System</p>
          </div>
        </div>

        {/* Divider */}
        <div className="divider mx-4 mb-4" />

        {/* Nav section */}
        <div className="px-3 mb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2" style={{ color: '#2a3f5a' }}>
            Navigation
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 flex flex-col gap-0.5">
          {visibleNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'text-orange-400'
                    : 'text-text-muted hover:text-text-secondary'
                }`
              }
              style={({ isActive }) => isActive ? {
                background: 'rgba(249, 115, 22, 0.1)',
                border: '1px solid rgba(249, 115, 22, 0.2)',
              } : {}}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-orange-400" />
                  )}
                  <Icon size={17} className={isActive ? 'text-orange-400' : 'text-text-muted group-hover:text-text-secondary'} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div className="divider mx-4 my-3" />

        {/* User info + logout */}
        <div className="px-3 pb-4 space-y-2">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="relative flex-shrink-0">
              <img
                src={user?.avatar_url}
                alt={user?.name}
                className="w-9 h-9 rounded-xl object-cover"
                style={{ border: '1px solid rgba(249,115,22,0.3)' }}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400"
                style={{ border: '1.5px solid #060d1a', boxShadow: '0 0 6px rgba(74,222,128,0.6)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{user?.name}</p>
              <p className="text-xs mt-0.5 truncate"
                style={{ color: '#4a6080' }}>{roleLabel}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
            style={{ color: '#4a6080' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
              e.currentTarget.style.color = '#f87171';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '';
              e.currentTarget.style.color = '#4a6080';
              e.currentTarget.style.borderColor = '';
            }}
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 relative z-10"
          style={{
            background: 'rgba(6, 13, 26, 0.95)',
            borderBottom: '1px solid rgba(30, 45, 66, 0.6)',
          }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea6c0a)',
                boxShadow: '0 0 12px rgba(249,115,22,0.4)',
              }}>
              <Fuel size={15} className="text-white" />
            </div>
            <span className="font-display font-bold text-text-primary text-base">FuelDS</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-shrink-0">
              <img
                src={user?.avatar_url}
                alt={user?.name}
                className="w-8 h-8 rounded-lg object-cover cursor-pointer"
                style={{ border: '1px solid rgba(249,115,22,0.3)' }}
                onClick={() => navigate('/profile')}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400"
                style={{ border: '1.5px solid #060d1a' }} />
            </div>
          </div>
        </header>

        {/* Desktop top bar */}
        <header className="hidden lg:flex items-center justify-between px-6 py-4 relative z-10"
          style={{
            background: 'rgba(3, 7, 18, 0.6)',
            borderBottom: '1px solid rgba(30, 45, 66, 0.4)',
            backdropFilter: 'blur(20px)',
          }}>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">
              {NAV_ITEMS.find(n => n.to === location.pathname)?.label ?? 'Dashboard'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#4a6080' }}>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', color: '#4ade80' }}>
              <div className="live-dot" style={{ width: '6px', height: '6px' }} />
              System Online
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6 px-4 py-4 lg:px-6 lg:py-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>

        {/* ── Mobile Bottom Navigation ── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 safe-bottom z-50"
          style={{
            background: 'rgba(6, 13, 26, 0.97)',
            borderTop: '1px solid rgba(30, 45, 66, 0.7)',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
          }}>
          <div className="flex items-center justify-around px-2 pt-2 pb-2.5">
            {mobileNav.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className="flex flex-col items-center gap-1 min-w-0 flex-1 relative"
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-orange-500"
                        style={{ boxShadow: '0 0 8px rgba(249,115,22,0.6)' }} />
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      isActive ? 'text-orange-400' : 'text-text-muted'
                    }`}
                      style={isActive ? {
                        background: 'rgba(249, 115, 22, 0.12)',
                      } : {}}>
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                    </div>
                    <span className={`text-[9px] font-semibold uppercase tracking-wide transition-colors duration-200 ${
                      isActive ? 'text-orange-400' : 'text-text-muted'
                    }`}>{label}</span>
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