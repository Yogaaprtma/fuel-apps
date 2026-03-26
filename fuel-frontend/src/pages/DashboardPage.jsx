import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    CheckCircle,
    Clock,
    Package,
    Plus,
    Truck,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useDeliveryStore from '../store/deliveryStore';

const STATUS_COLORS = {
    CREATED: 'bg-slate-600',
    PACKED: 'bg-blue-600',
    IN_TRANSIT: 'bg-amber-600',
    NEAR_DESTINATION: 'bg-orange-500',
    DELIVERED: 'bg-emerald-600',
    COMPLETED: 'bg-green-600',
};

const getStatusLabel = (status) => status?.replace('_', ' ');

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
    <div className="card transition-all duration-300 hover:border-slate-600/50">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-1 font-display text-3xl font-bold text-white">
                    {value ?? '—'}
                </p>
                {sub ? <p className="mt-1 text-xs text-slate-600">{sub}</p> : null}
            </div>

            <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
            >
                <Icon size={22} className="text-white" />
            </div>
        </div>
    </div>
);

export default function DashboardPage() {
    const { user, hasRole } = useAuthStore();
    const { stats, deliveries, fetchStats, fetchDeliveries } = useDeliveryStore();

    useEffect(() => {
        fetchStats();
        fetchDeliveries({ per_page: 5 });
    }, []);

    const firstName = user?.name?.split(' ')[0];
    const recentDeliveries = deliveries ?? [];
    const statusEntries = Object.entries(stats?.by_status ?? {});
    const canCreateDelivery = hasRole(['super-admin', 'admin-operasional']);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-white">
                        Selamat datang, {firstName}! 👋
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Berikut ringkasan hari ini
                    </p>
                </div>

                {canCreateDelivery ? (
                    <Link to="/deliveries/new" className="btn-primary">
                        <Plus size={18} />
                        Delivery Baru
                    </Link>
                ) : null}
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard
                    label="Total Delivery"
                    value={stats?.total}
                    icon={Package}
                    color="bg-flame"
                />
                <StatCard
                    label="Hari Ini"
                    value={stats?.today}
                    icon={Clock}
                    color="bg-blue-600"
                    sub="delivery baru"
                />
                <StatCard
                    label="Dalam Perjalanan"
                    value={stats?.in_transit}
                    icon={Truck}
                    color="bg-amber-600"
                />
                <StatCard
                    label="Selesai Hari Ini"
                    value={stats?.completed_today}
                    icon={CheckCircle}
                    color="bg-emerald-600"
                />
            </div>

            <div className="card">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-white">Delivery Terbaru</h2>
                    <Link
                        to="/deliveries"
                        className="flex items-center gap-1 text-sm text-flame hover:text-flame-400"
                    >
                        Lihat semua
                        <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="space-y-3">
                    {recentDeliveries.length === 0 ? (
                        <p className="py-8 text-center text-slate-600">
                            Belum ada data delivery
                        </p>
                    ) : (
                        recentDeliveries.map((delivery) => (
                            <Link
                                key={delivery.id}
                                to={`/deliveries/${delivery.id}`}
                                className="group flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-slate-800/50"
                            >
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900">
                                    <Package size={18} className="text-flame" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="font-mono text-sm font-medium text-white">
                                        {delivery.delivery_code}
                                    </p>
                                    <p className="truncate text-xs text-slate-500">
                                        {delivery.customer_name}
                                    </p>
                                </div>

                                <span
                                    className={`status-badge text-white ${
                                        STATUS_COLORS[delivery.status] ?? 'bg-slate-700'
                                    }`}
                                >
                                    {getStatusLabel(delivery.status)}
                                </span>

                                <ArrowRight
                                    size={16}
                                    className="text-slate-700 transition-colors group-hover:text-slate-400"
                                />
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {statusEntries.length > 0 ? (
                <div className="card">
                    <h2 className="mb-4 font-semibold text-white">
                        Distribusi Status
                    </h2>

                    <div className="space-y-3">
                        {statusEntries.map(([status, count]) => (
                            <div key={status}>
                                <div className="mb-1 flex justify-between text-sm">
                                    <span className="text-slate-400">
                                        {getStatusLabel(status)}
                                    </span>
                                    <span className="font-mono text-white">{count}</span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-900">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${
                                            STATUS_COLORS[status] ?? 'bg-slate-600'
                                        }`}
                                        style={{
                                            width: `${(count / stats.total) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
