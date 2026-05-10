import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Clock, Truck, CheckCircle, Plus, ArrowRight,
  TrendingUp, Activity, Fuel, Zap, BarChart3, AlertTriangle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import useAuthStore from '../store/authStore';
import useDeliveryStore from '../store/deliveryStore';
import useTheme from '../hooks/useTheme';
import StatusBadge from '../components/StatusBadge';

const STATUS_CONFIG = {
  CREATED:          { color: '#475569', bg: '#F8FAFC', border: '#E2E8F0',  label: 'Created',    barColor: '#CBD5E1' },
  PACKED:           { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE',  label: 'Packed',     barColor: '#60A5FA' },
  IN_TRANSIT:       { color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA',  label: 'In Transit', barColor: '#FB923C' },
  NEAR_DESTINATION: { color: '#0E7490', bg: '#ECFEFF', border: '#A5F3FC',  label: 'Near Dest',  barColor: '#22D3EE' },
  DELIVERED:        { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0',  label: 'Delivered',  barColor: '#34D399' },
  COMPLETED:        { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE',  label: 'Completed',  barColor: '#A78BFA' },
};

const STAT_CARDS = [
  { key: 'total',           label: 'Total Delivery', sub: 'all time',        icon: Package,     accent: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  { key: 'today',           label: 'Hari Ini',        sub: 'pengiriman baru', icon: Clock,       accent: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
  { key: 'in_transit',      label: 'Dalam Perjalanan',sub: 'sedang bergerak', icon: Truck,       accent: '#F97316', bg: '#FFF7ED', border: '#FED7AA' },
  { key: 'completed_today', label: 'Selesai Hari Ini',sub: 'terkirim',        icon: CheckCircle, accent: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
];

function StatCard({ label, value, icon: Icon, accent, bg, border, sub, isDark }) {
  return (
    <div className="stat-card">
      {/* Left accent strip */}
      <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full" style={{ background: accent }} />

      <div className="pl-3 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94A3B8', letterSpacing: '0.06em' }}>
            {label}
          </p>
          <p className="text-3xl font-bold leading-none" style={{ color: isDark ? '#F1F5F9' : '#0F172A', letterSpacing: '-0.02em' }}>
            {value ?? '–'}
          </p>
          {sub && <p className="text-xs mt-1.5" style={{ color: '#64748B' }}>{sub}</p>}
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: bg, border: `1px solid ${border}` }}>
          <Icon size={22} style={{ color: accent }} />
        </div>
      </div>
    </div>
  );
}

function DeliveryRow({ delivery, isDark }) {
  const cfg = STATUS_CONFIG[delivery.status] ?? STATUS_CONFIG.CREATED;
  return (
    <Link
      to={`/deliveries/${delivery.id}`}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
        <Package size={17} style={{ color: cfg.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-mono font-semibold" style={{ color: isDark ? '#F1F5F9' : '#0F172A' }}>
          {delivery.delivery_code}
        </p>
        <p className="text-xs truncate mt-0.5" style={{ color: '#64748B' }}>
          {delivery.customer_name} · {delivery.fuel_type?.replace(/_/g, ' ')}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusBadge status={delivery.status} />
        <ArrowRight size={14} className="text-slate-400 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user, hasRole }                              = useAuthStore();
  const { stats, deliveries, fetchStats, fetchDeliveries } = useDeliveryStore();
  const { isDark } = useTheme();

  useEffect(() => {
    fetchStats();
    fetchDeliveries({ per_page: 100 }); // lebih banyak untuk chart analytics
  }, []);

  const firstName        = user?.name?.split(' ')[0];
  const recentDeliveries = deliveries ?? [];
  const statusEntries    = Object.entries(stats?.by_status ?? {});
  const fuelEntries      = Object.entries(stats?.by_fuel ?? {});
  const canCreate        = hasRole(['super-admin', 'admin-operasional']);

  // ── Analytics: 7 hari terakhir ──
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      const count = recentDeliveries.filter(del =>
        del.created_at?.slice(0, 10) === key
      ).length;
      days.push({ label, count, date: key });
    }
    return days;
  }, [recentDeliveries]);

  // ── Pie chart data: distribusi jenis BBM ──
  const PIE_COLORS = ['#2563EB', '#F97316', '#10B981', '#8B5CF6', '#EC4899'];
  const pieData = fuelEntries.map(([name, value]) => ({
    name: name.replace(/_/g, ' '), value
  }));

  // ── Auto reminder: delivery CREATED/PACKED > 2 jam ──
  const lateDeliveries = recentDeliveries.filter(d => {
    if (!['CREATED', 'PACKED'].includes(d.status)) return false;
    const hours = (Date.now() - new Date(d.created_at).getTime()) / (1000 * 60 * 60);
    return hours > 2;
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="live-dot w-2 h-2" />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94A3B8', letterSpacing: '0.07em' }}>
              Live Dashboard
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: isDark ? '#F1F5F9' : '#0F172A', letterSpacing: '-0.025em' }}>
            {greeting()}, {firstName}! 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
            Ringkasan distribusi bahan bakar hari ini
          </p>
        </div>

        {canCreate && (
          <Link to="/deliveries/new" className="btn-primary flex-shrink-0" id="create-delivery">
            <Plus size={17} />
            <span className="hidden sm:inline">Delivery Baru</span>
          </Link>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, ...rest }) => (
          <StatCard key={key} value={stats?.[key]} isDark={isDark} {...rest} />
        ))}
      </div>

      {/* Two-column content */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Recent Deliveries */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#EFF6FF' }}>
                <Activity size={15} style={{ color: '#2563EB' }} />
              </div>
              <h2 className="font-semibold text-sm" style={{ color: isDark ? '#F1F5F9' : '#0F172A' }}>Delivery Terbaru</h2>
            </div>
            <Link to="/deliveries"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
              Lihat semua <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-1">
            {recentDeliveries.length === 0 ? (
              <div className="py-14 text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Package size={26} className="text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-400">Belum ada data delivery</p>
                {canCreate && (
                  <Link to="/deliveries/new" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-2 font-medium">
                    <Plus size={12} /> Buat delivery pertama
                  </Link>
                )}
              </div>
            ) : (
              recentDeliveries.map(d => <DeliveryRow key={d.id} delivery={d} isDark={isDark} />)
            )}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">

          {/* Status Distribution */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#FFF7ED' }}>
                <BarChart3 size={15} style={{ color: '#F97316' }} />
              </div>
              <h2 className="font-semibold text-sm" style={{ color: isDark ? '#F1F5F9' : '#0F172A' }}>Status Distribusi</h2>
            </div>

            <div className="space-y-3.5">
              {statusEntries.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-xs text-slate-400">Belum ada data</p>
                </div>
              ) : statusEntries.map(([status, count]) => {
                const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.CREATED;
                  const pct = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={status}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{cfg.label}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold font-mono" style={{ color: cfg.color }}>{count}</span>
                          <span className="text-[10px]" style={{ color: '#475569' }}>{pct}%</span>
                        </div>
                      </div>
                    <div className="progress-track">
                      <div className="progress-fill"
                        style={{ width: `${pct}%`, background: cfg.barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fuel Distribution */}
          {fuelEntries.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#EFF6FF' }}>
                  <Fuel size={15} style={{ color: '#2563EB' }} />
                </div>
                <h2 className="font-semibold text-sm" style={{ color: isDark ? '#F1F5F9' : '#0F172A' }}>Jenis BBM</h2>
              </div>
              <div className="space-y-2.5">
                {fuelEntries.map(([fuel, count]) => (
                    <div key={fuel} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-xs font-medium" style={{ color: isDark ? '#94A3B8' : '#475569' }}>
                          {fuel.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-xs font-bold font-mono" style={{ color: isDark ? '#F1F5F9' : '#0F172A' }}>{count}</span>
                    </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Auto Reminder: Delivery Terlambat ── */}
      {lateDeliveries.length > 0 && canCreate && (
        <div className="rounded-xl p-4 flex items-start gap-3"
          style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-700">
              ⚠️ {lateDeliveries.length} Delivery belum dimulai lebih dari 2 jam
            </p>
            <div className="mt-2 space-y-1">
              {lateDeliveries.slice(0, 3).map(d => (
                <Link key={d.id} to={`/deliveries/${d.id}`}
                  className="flex items-center justify-between text-xs text-amber-700 hover:text-amber-900 font-mono hover:underline">
                  <span>{d.delivery_code} — {d.customer_name}</span>
                  <span className="font-semibold ml-2">{d.status}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Analytics Charts ── */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#EFF6FF' }}>
              <TrendingUp size={15} style={{ color: '#2563EB' }} />
            </div>
            <h2 className="font-semibold text-sm" style={{ color: isDark ? '#F1F5F9' : '#0F172A' }}>Pengiriman 7 Hari Terakhir</h2>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={last7Days} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, background: isDark ? '#1E293B' : '#FFFFFF', color: isDark ? '#F1F5F9' : '#0F172A' }}
                formatter={(v) => [v, 'Pengiriman']}
              />
              <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#FFF7ED' }}>
              <Fuel size={15} style={{ color: '#F97316' }} />
            </div>
            <h2 className="font-semibold text-sm" style={{ color: isDark ? '#F1F5F9' : '#0F172A' }}>Distribusi Jenis BBM</h2>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, background: isDark ? '#1E293B' : '#FFFFFF', color: isDark ? '#F1F5F9' : '#0F172A' }}
                  formatter={(v, n) => [v + ' delivery', n]}
                />
                <Legend iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 10, color: isDark ? '#94A3B8' : '#64748B' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-10 text-center text-xs text-slate-400">Belum ada data BBM</div>
          )}
        </div>
      </div>
    </div>
  );
}
