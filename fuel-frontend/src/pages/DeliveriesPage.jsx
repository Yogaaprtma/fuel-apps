import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Package, Plus, Search, SlidersHorizontal, Download } from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import useAuthStore from '../store/authStore';
import StatusBadge from '../components/StatusBadge';
import { exportApi } from '../services/api';

const STATUS_OPTIONS = ['CREATED','PACKED','IN_TRANSIT','NEAR_DESTINATION','DELIVERED','COMPLETED'];

const FUEL_COLORS = {
  PERTALITE:     { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  PERTAMAX:      { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  PERTAMAX_TURBO:{ color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  SOLAR:         { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  DEXLITE:       { color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
};

function SkeletonCard() {
  return (
    <div className="card flex items-center gap-4">
      <div className="skeleton w-11 h-11 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-3 w-48 rounded" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
      <div className="skeleton h-6 w-20 rounded-full" />
    </div>
  );
}

export default function DeliveriesPage() {
  const { deliveries, loading, fetchDeliveries } = useDeliveryStore();
  const { hasRole }                               = useAuthStore();
  const [search,     setSearch]     = useState('');
  const [status,     setStatus]     = useState('');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchDeliveries({ search, status });
  }, [search, status]);

  const canCreate    = hasRole(['super-admin', 'admin-operasional']);
  const deliveryList = deliveries ?? [];

  const handleExport = async () => {
    try {
      const res = await exportApi.csv({ status, search });
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `deliveries_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch { /* silent */ }
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Daftar Pengiriman</h1>
          <p className="page-subtitle">{deliveryList.length} pengiriman ditemukan</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="toggle-filter"
            onClick={() => setShowFilter(!showFilter)}
            className={`btn-secondary px-3 py-2.5 ${showFilter ? '!border-blue-300 !text-blue-600 !bg-blue-50' : ''}`}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline text-sm">Filter</span>
          </button>
          {canCreate && (
            <button onClick={handleExport} className="btn-secondary px-3 py-2.5" id="export-csv" title="Export CSV">
              <Download size={16} />
              <span className="hidden sm:inline text-sm">Export</span>
            </button>
          )}
          {canCreate && (
            <Link to="/deliveries/new" className="btn-primary" id="create-delivery">
              <Plus size={16} />
              <span className="hidden sm:inline">Buat Baru</span>
            </Link>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="input pl-11"
            placeholder="Cari kode pengiriman atau nama pelanggan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="search-delivery"
          />
        </div>

        {/* Filter panel */}
        {showFilter && (
          <div className="card !p-4 animate-slide-down">
            <p className="label mb-3">Filter Status</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatus('')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                style={status === ''
                  ? { background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }
                  : { background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0' }
                }
              >
                Semua
              </button>
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setStatus(s => s === opt ? '' : opt)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                  style={status === opt
                    ? { background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }
                    : { background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0' }
                  }
                >
                  {opt.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : deliveryList.length === 0 ? (
        <div className="card py-16 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Package size={28} className="text-slate-300" />
          </div>
          <p className="font-semibold text-slate-400">Tidak ada pengiriman ditemukan</p>
          <p className="text-xs mt-1 text-slate-300">
            {search || status ? 'Coba ubah filter pencarian' : 'Belum ada data pengiriman'}
          </p>
          {canCreate && !search && !status && (
            <Link to="/deliveries/new" className="btn-primary mx-auto mt-4">
              <Plus size={15} /> Buat Pengiriman Baru
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {deliveryList.map(delivery => {
            const fuelCfg = FUEL_COLORS[delivery.fuel_type] ?? FUEL_COLORS.PERTALITE;
            return (
              <Link
                key={delivery.id}
                to={`/deliveries/${delivery.id}`}
                className="card card-interactive flex items-center gap-4"
                id={`delivery-${delivery.id}`}
              >
                {/* Fuel icon */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: fuelCfg.bg, border: `1px solid ${fuelCfg.border}` }}>
                  <Package size={19} style={{ color: fuelCfg.color }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-mono text-sm font-bold" style={{ color: '#0F172A' }}>
                      {delivery.delivery_code}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold"
                      style={{ background: fuelCfg.bg, color: fuelCfg.color, border: `1px solid ${fuelCfg.border}` }}>
                      {delivery.fuel_type?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{delivery.customer_name}</p>
                  <p className="text-xs mt-0.5 text-slate-400">
                    {delivery.volume_liters}L ·{' '}
                    Driver: {delivery.driver?.name ?? <em>Belum assign</em>}
                  </p>
                </div>

                {/* Status + arrow */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={delivery.status} />
                  <ArrowRight size={15} className="text-slate-300 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}