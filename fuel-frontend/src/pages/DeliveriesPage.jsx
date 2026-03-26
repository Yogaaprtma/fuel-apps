import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Package, ArrowRight, Loader2 } from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import useAuthStore from '../store/authStore';

const STATUS_COLORS = {
  CREATED: 'bg-slate-700 text-slate-300',
  PACKED: 'bg-blue-900 text-blue-300',
  IN_TRANSIT: 'bg-amber-900 text-amber-300',
  NEAR_DESTINATION: 'bg-orange-900 text-orange-300',
  DELIVERED: 'bg-emerald-900 text-emerald-300',
  COMPLETED: 'bg-green-900 text-green-300',
};

export default function DeliveriesPage() {
  const { deliveries, loading, fetchDeliveries } = useDeliveryStore();
  const { hasRole } = useAuthStore();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchDeliveries({ search, status });
  }, [search, status]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Daftar Delivery</h1>
        {hasRole(['super-admin', 'admin-operasional']) && (
          <Link to="/deliveries/new" className="btn-primary">
            <Plus size={18} /> Baru
          </Link>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" className="input pl-9" placeholder="Cari kode atau nama..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Semua Status</option>
          {['CREATED','PACKED','IN_TRANSIT','NEAR_DESTINATION','DELIVERED','COMPLETED'].map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-flame" />
        </div>
      ) : deliveries.length === 0 ? (
        <div className="card text-center py-12">
          <Package size={48} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500">Tidak ada delivery ditemukan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deliveries.map(d => (
            <Link key={d.id} to={`/deliveries/${d.id}`}
              className="card flex items-center gap-4 hover:border-slate-600/50 hover:bg-slate-800/80 transition-all group cursor-pointer">
              <div className="w-12 h-12 bg-flame/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package size={22} className="text-flame" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-semibold text-white">{d.delivery_code}</span>
                  <span className={`status-badge ${STATUS_COLORS[d.status]}`}>
                    {d.status?.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-slate-400 truncate">{d.customer_name} · {d.fuel_type}</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {d.volume_liters}L · Driver: {d.driver?.name ?? 'Belum assign'}
                </p>
              </div>

              <ArrowRight size={18} className="text-slate-700 group-hover:text-slate-400 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}