import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, MapPin, Users, User, Truck, LogOut, Menu, X, Fuel } from 'lucide-react';
import useAuthStore from '../store/authStore';

const navItems = [
    { to: '/',           icon: LayoutDashboard, label: 'Dashboard', roles: ['super-admin','admin-operasional','driver','customer'] },
    { to: '/deliveries', icon: Package,         label: 'Delivery',  roles: ['super-admin','admin-operasional','driver','customer'] },
    { to: '/tracking',   icon: MapPin,          label: 'Tracking',  roles: ['super-admin','admin-operasional','driver'] },
    { to: '/driver',     icon: Truck,           label: 'Driver',    roles: ['driver'] },
    { to: '/users',      icon: Users,           label: 'Users',     roles: ['super-admin','admin-operasional'] },
    { to: '/profile',    icon: User,            label: 'Profile',   roles: ['super-admin','admin-operasional','driver','customer'] },
];

export default function AppLayout() {
  const { user, logout, hasRole } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleNav = navItems.filter(item => item.roles.some(r => hasRole(r)));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink to={to} end={to === '/'} onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
          isActive ? 'bg-flame text-white shadow-lg shadow-flame/25' : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`
      }>
      <Icon size={20} />
      <span className="hidden md:block">{label}</span>
    </NavLink>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass border-r border-slate-700/50 p-4 gap-2">
        <div className="flex items-center gap-3 px-4 py-4 mb-4">
          <div className="w-10 h-10 bg-flame rounded-xl flex items-center justify-center">
            <Fuel size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-lg leading-none">FDS</h1>
            <p className="text-xs text-slate-500">Fuel Delivery System</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {visibleNav.map(item => <NavItem key={item.to} {...item} />)}
        </nav>

        <div className="border-t border-slate-700/50 pt-4">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <img src={user?.avatar_url} alt={user?.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-flame/30" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.roles?.[0]?.replace('-', ' ')}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-ghost w-full text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar (mobile) */}
        <header className="md:hidden glass border-b border-slate-700/50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-flame rounded-lg flex items-center justify-center">
              <Fuel size={16} className="text-white" />
            </div>
            <h1 className="font-display font-bold text-white">FDS</h1>
          </div>
          <div className="flex items-center gap-2">
            <img src={user?.avatar_url} alt={user?.name} className="w-8 h-8 rounded-full object-cover" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 p-4 md:p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>

        {/* Bottom Navigation (mobile) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-slate-700/50 px-2 py-2">
          <div className="flex justify-around items-center max-w-lg mx-auto">
            {visibleNav.slice(0, 5).map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                    isActive ? 'text-flame' : 'text-slate-500'
                  }`
                }>
                <Icon size={22} />
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}