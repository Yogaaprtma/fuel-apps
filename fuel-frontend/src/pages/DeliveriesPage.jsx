import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Package, Plus, Search,} from 'lucide-react';
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

const STATUS_OPTIONS = [
    'CREATED',
    'PACKED',
    'IN_TRANSIT',
    'NEAR_DESTINATION',
    'DELIVERED',
    'COMPLETED',
];

const getStatusLabel = (status) => status?.replace('_', ' ');

export default function DeliveriesPage() {
    const { deliveries, loading, fetchDeliveries } = useDeliveryStore();
    const { hasRole } = useAuthStore();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        fetchDeliveries({ search, status });
    }, [search, status]);

    const canCreateDelivery = hasRole(['super-admin', 'admin-operasional']);
    const deliveryList = deliveries ?? [];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="font-display text-2xl font-bold text-white">
                    Daftar Delivery
                </h1>

                {canCreateDelivery ? (
                    <Link to="/deliveries/new" className="btn-primary">
                        <Plus size={18} />
                        Baru
                    </Link>
                ) : null}
            </div>

            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                        type="text"
                        className="input pl-9"
                        placeholder="Cari kode atau nama..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <select
                    className="input w-auto"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}>
                    <option value="">Semua Status</option>
                    {STATUS_OPTIONS.map((statusOption) => (
                        <option key={statusOption} value={statusOption}>
                            {getStatusLabel(statusOption)}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-flame" />
                </div>
            ) : deliveryList.length === 0 ? (
                <div className="card py-12 text-center">
                    <Package size={48} className="mx-auto mb-3 text-slate-700" />
                    <p className="text-slate-500">Tidak ada delivery ditemukan</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {deliveryList.map((delivery) => (
                        <Link
                            key={delivery.id}
                            to={`/deliveries/${delivery.id}`}
                            className="card group flex cursor-pointer items-center gap-4 transition-all hover:border-slate-600/50 hover:bg-slate-800/80">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-flame/10">
                                <Package size={22} className="text-flame" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                    <span className="font-mono font-semibold text-white">
                                        {delivery.delivery_code}
                                    </span>
                                    <span
                                        className={`status-badge ${
                                            STATUS_COLORS[delivery.status]
                                        }`}>
                                        {getStatusLabel(delivery.status)}
                                    </span>
                                </div>

                                <p className="truncate text-sm text-slate-400">
                                    {delivery.customer_name} · {delivery.fuel_type}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-600">
                                    {delivery.volume_liters}L · Driver:{' '}
                                    {delivery.driver?.name ?? 'Belum assign'}
                                </p>
                            </div>

                            <ArrowRight
                                size={18}
                                className="flex-shrink-0 text-slate-700 transition-colors group-hover:text-slate-400"
                            />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}