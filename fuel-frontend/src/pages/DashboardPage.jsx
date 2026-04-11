import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, Clock, Package, Plus, Truck,
  TrendingUp, Fuel, Activity, AlertCircle, Zap
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useDeliveryStore from '../store/deliveryStore';

const STATUS_CONFIG = {
  CREATED:          { color: '#94a3b8', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.2)',  label: 'Created' },
  PACKED:           { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.2)',   label: 'Packed' },
  IN_TRANSIT:       { color: '#fb923c', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.2)',   label: 'In Transit' },
  NEAR_DESTINATION: { color: '#22d3ee', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.2)',    label: 'Near Dest' },
  DELIVERED:        { color: '#4ade80', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.2)',    label: 'Delivered' },
  COMPLETED:        { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.2)', label: 'Completed' },
};

function StatCard({ label, value, icon: Icon, accent, sub, trend }) {
  return (
    <div className="stat-card">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#4a6080' }}>
            {label}
          </p>
          <div className="flex items-end gap-2">
            <p className="font-display text-4xl font-bold text-text-primary leading-none">
              {value ?? '–'}
            </p>
            {trend !== undefined && (
              <span className="text-xs font-medium mb-1 flex items-center gap-0.5"
                style={{ color: trend >= 0 ? '#4ade80' : '#f87171' }}>
                <TrendingUp size={11} />
                {Math.abs(trend)}%
              </span>
            )}
          </div>
          {sub && <p className="text-xs mt-1.5" style={{ color: '#4a6080' }}>{sub}</p>}
        </div>

        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `radial-gradient(circle, ${accent}22, ${accent}08)`,
            border: `1px solid ${accent}30`,
          }}>
          <Icon size={20} style={{ color: accent }} />
        </div>
      </div>
    </div>
  );
}

function DeliveryRow({ delivery }) {
  const cfg = STATUS_CONFIG[delivery.status] ?? STATUS_CONFIG.CREATED;
  return (
    <Link
      to={`/deliveries/${delivery.id}`}
      className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group"
      style={{ border: '1px solid transparent' }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(30, 45, 66, 0.5)';
        e.currentTarget.style.borderColor = 'rgba(42, 63, 90, 0.6)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = '';
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
        <Package size={17} style={{ color: '#f97316' }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-mono font-semibold text-text-primary">{delivery.delivery_code}</p>
        <p className="text-xs truncate mt-0.5" style={{ color: '#4a6080' }}>
          {delivery.customer_name} · {delivery.fuel_type?.replace('_', ' ')}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="badge text-xs" style={{
          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`
        }}>
          {cfg.label}
        </span>
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5"
          style={{ color: '#2a3f5a' }} />
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user, hasRole } = useAuthStore();
  const { stats, deliveries, fetchStats, fetchDeliveries } = useDeliveryStore();

  useEffect(() => {
    fetchStats();
    fetchDeliveries({ per_page: 6 });
  }, []);

  const firstName = user?.name?.split(' ')[0];
  const recentDeliveries = deliveries ?? [];
  const statusEntries = Object.entries(stats?.by_status ?? {});
  const fuelEntries = Object.entries(stats?.by_fuel ?? {});
  const canCreate = hasRole(['super-admin', 'admin-operasional']);
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat pagi';
    if (h < 17) return 'Selamat siang';
    return 'Selamat malam';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="live-dot" />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4a6080' }}>
              Live Dashboard
            </span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-text-primary">
            {greeting()}, {firstName}! 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: '#4a6080' }}>
            Berikut ringkasan distribusi bahan bakar hari ini
          </p>
        </div>

        {canCreate && (
          <Link to="/deliveries/new" className="btn-primary flex-shrink-0">
            <Plus size={17} />
            <span className="hidden sm:inline">Delivery Baru</span>
          </Link>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Delivery" value={stats?.total}       icon={Package}     accent="#f97316" sub="all time" />
        <StatCard label="Hari Ini"       value={stats?.today}       icon={Clock}       accent="#06b6d4" sub="delivery baru" />
        <StatCard label="Dalam Perjalanan" value={stats?.in_transit} icon={Truck}      accent="#fb923c" sub="sedang bergerak" />
        <StatCard label="Selesai Hari Ini" value={stats?.completed_today} icon={CheckCircle} accent="#4ade80" sub="terkirim" />
      </div>

      {/* Two column */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent deliveries — 2/3 width */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={16} style={{ color: '#f97316' }} />
              <h2 className="font-semibold text-text-primary">Delivery Terbaru</h2>
            </div>
            <Link to="/deliveries"
              className="text-xs font-semibold flex items-center gap-1 transition-colors"
              style={{ color: '#4a6080' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f97316'}
              onMouseLeave={e => e.currentTarget.style.color = '#4a6080'}
            >
              Lihat semua <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-1">
            {recentDeliveries.length === 0 ? (
              <div className="py-12 text-center">
                <Package size={40} className="mx-auto mb-3" style={{ color: '#1e2d42' }} />
                <p className="text-sm" style={{ color: '#4a6080' }}>Belum ada data delivery</p>
              </div>
            ) : (
              recentDeliveries.map(delivery => (
                <DeliveryRow key={delivery.id} delivery={delivery} />
              ))
            )}
          </div>
        </div>

        {/* Status & Fuel Distribution — 1/3 */}
        <div className="space-y-4">
          {/* Status distribution */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={15} style={{ color: '#06b6d4' }} />
              <h2 className="font-semibold text-text-primary text-sm">Status Distribusi</h2>
            </div>
            <div className="space-y-3">
              {statusEntries.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: '#4a6080' }}>Tidak ada data</p>
              ) : statusEntries.map(([status, count]) => {
                const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.CREATED;
                const pct = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium" style={{ color: '#8fa3bd' }}>{cfg.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold" style={{ color: cfg.color }}>{count}</span>
                        <span className="text-[10px]" style={{ color: '#4a6080' }}>{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(30,45,66,0.8)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: cfg.color, boxShadow: `0 0 6px ${cfg.color}60` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fuel type distribution */}
          {fuelEntries.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Fuel size={15} style={{ color: '#f97316' }} />
                <h2 className="font-semibold text-text-primary text-sm">Jenis BBM</h2>
              </div>
              <div className="space-y-2.5">
                {fuelEntries.map(([fuel, count]) => (
                  <div key={fuel} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f97316' }} />
                      <span className="text-xs font-medium" style={{ color: '#8fa3bd' }}>
                        {fuel.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-text-primary">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
