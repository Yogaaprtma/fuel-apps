import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Package, Plus, Search, Filter, SlidersHorizontal } from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import useAuthStore from '../store/authStore';
import StatusBadge from '../components/StatusBadge';

const STATUS_OPTIONS = ['CREATED','PACKED','IN_TRANSIT','NEAR_DESTINATION','DELIVERED','COMPLETED'];

const FUEL_COLORS = {
  PERTALITE: '#4ade80',
  PERTAMAX: '#60a5fa',
  PERTAMAX_TURBO: '#a78bfa',
  SOLAR: '#fbbf24',
  DEXLITE: '#fb923c',
};

function SkeletonRow() {
  return (
    <div className="card flex items-center gap-4">
      <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-36 rounded" />
        <div className="skeleton h-3 w-52 rounded" />
      </div>
      <div className="skeleton h-6 w-20 rounded-full" />
    </div>
  );
}

export default function DeliveriesPage() {
  const { deliveries, loading, fetchDeliveries } = useDeliveryStore();
  const { hasRole } = useAuthStore();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchDeliveries({ search, status });
  }, [search, status]);

  const canCreate = hasRole(['super-admin', 'admin-operasional']);
  const deliveryList = deliveries ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Daftar Delivery</h1>
          <p className="page-subtitle">{deliveryList.length} delivery ditemukan</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="toggle-filter"
            onClick={() => setShowFilter(!showFilter)}
            className="btn-secondary p-2.5"
            style={showFilter ? {
              borderColor: 'rgba(249,115,22,0.4)',
              color: '#f97316',
              background: 'rgba(249,115,22,0.08)',
            } : {}}>
            <SlidersHorizontal size={17} />
          </button>
          {canCreate && (
            <Link to="/deliveries/new" className="btn-primary" id="create-delivery">
              <Plus size={17} />
              <span className="hidden sm:inline">Buat Baru</span>
            </Link>
          )}
        </div>
      </div>

      {/* Search + Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#4a6080' }} />
          <input
            type="text"
            className="input pl-11"
            placeholder="Cari kode pengiriman atau nama customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="search-delivery"
          />
        </div>

        {showFilter && (
          <div className="animate-slide-down">
            <div className="card !p-4">
              <p className="label mb-3">Filter Status</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatus('')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                  style={status === '' ? {
                    background: 'rgba(249,115,22,0.15)',
                    color: '#f97316',
                    border: '1px solid rgba(249,115,22,0.3)',
                  } : {
                    background: 'rgba(30,45,66,0.5)',
                    color: '#4a6080',
                    border: '1px solid rgba(30,45,66,0.8)',
                  }}>
                  Semua
                </button>
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setStatus(s => s === opt ? '' : opt)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={status === opt ? {
                      background: 'rgba(249,115,22,0.15)',
                      color: '#f97316',
                      border: '1px solid rgba(249,115,22,0.3)',
                    } : {
                      background: 'rgba(30,45,66,0.5)',
                      color: '#4a6080',
                      border: '1px solid rgba(30,45,66,0.8)',
                    }}>
                    {opt.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <SkeletonRow key={i} />)}
        </div>
      ) : deliveryList.length === 0 ? (
        <div className="card py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(30,45,66,0.5)', border: '1px solid rgba(30,45,66,0.8)' }}>
            <Package size={26} style={{ color: '#2a3f5a' }} />
          </div>
          <p className="font-semibold text-text-secondary text-sm">Tidak ada delivery ditemukan</p>
          <p className="text-xs mt-1" style={{ color: '#4a6080' }}>
            {search || status ? 'Coba ubah filter pencarian' : 'Belum ada data delivery'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {deliveryList.map(delivery => (
            <Link
              key={delivery.id}
              to={`/deliveries/${delivery.id}`}
              className="card group flex items-center gap-4 cursor-pointer transition-all duration-200 hover:border-glow-orange"
              id={`delivery-${delivery.id}`}
            >
              {/* Type indicator */}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${FUEL_COLORS[delivery.fuel_type] ?? '#f97316'}12`,
                  border: `1px solid ${FUEL_COLORS[delivery.fuel_type] ?? '#f97316'}25`,
                }}>
                <Package size={19} style={{ color: FUEL_COLORS[delivery.fuel_type] ?? '#f97316' }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-mono text-sm font-bold text-text-primary">
                    {delivery.delivery_code}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded"
                    style={{
                      background: `${FUEL_COLORS[delivery.fuel_type] ?? '#f97316'}15`,
                      color: FUEL_COLORS[delivery.fuel_type] ?? '#f97316',
                    }}>
                    {delivery.fuel_type?.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs truncate" style={{ color: '#8fa3bd' }}>
                  {delivery.customer_name}
                </p>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: '#4a6080' }}>
                  {delivery.volume_liters}L ·{' '}
                  <span style={{ color: '#2a3f5a' }}>Driver: </span>
                  {delivery.driver?.name ?? <em style={{ color: '#4a6080' }}>Belum assign</em>}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={delivery.status} />
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5"
                  style={{ color: '#2a3f5a' }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}