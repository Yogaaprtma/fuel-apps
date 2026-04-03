import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, Truck, MapPin, Camera, FileText, Clock } from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import useAuthStore from '../store/authStore';
import StatusBadge from '../components/StatusBadge';
import StatusTimeline from '../components/StatusTimeline';
import DeliveryMap from '../components/DeliveryMap';
import PhotoUpload from '../components/PhotoUpload';
import StatusUpdatePanel from '../components/StatusUpdatePanel';

export default function DeliveryDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { current, fetchDelivery } = useDeliveryStore();
    const { hasRole } = useAuthStore();
    const [tab, setTab] = useState('detail');

    useEffect(() => {
        fetchDelivery(id);
    }, [id]);

    if (!current) {
        return (
        <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-flame border-t-transparent" />
        </div>
        );
    }

    const tabs = [
        { id: 'detail', label: 'Detail', icon: Package },
        { id: 'map', label: 'Map', icon: MapPin },
        { id: 'photos', label: 'Foto', icon: Camera },
        { id: 'timeline', label: 'Timeline', icon: Clock },
    ];

    return (
        <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-3">
                <button className="btn-ghost p-2" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="font-mono text-xl font-bold text-white">{current.delivery_code}</h1>
                        <StatusBadge status={current.status} />
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">
                        {current.customer_name} · {current.fuel_type}
                    </p>
                </div>
            </div>

            {hasRole('driver') && !['DELIVERED', 'COMPLETED'].includes(current.status) && (
                <StatusUpdatePanel delivery={current} onUpdated={() => fetchDelivery(id)} />
            )}

            <div className="glass flex gap-1 rounded-xl p-1">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-all ${
                        tab === t.id ? 'bg-flame text-white' : 'text-slate-500 hover:text-white'
                        }`}>
                        <t.icon size={16} />
                        <span className="hidden sm:block">{t.label}</span>
                    </button>
                ))}
            </div>

            {tab === 'detail' && (
                <div className="space-y-4">
                    <div className="card space-y-3">
                        <h3 className="flex items-center gap-2 font-semibold text-white">
                            <User size={16} className="text-flame" />
                            Info Pelanggan
                        </h3>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-slate-500">Nama</p>
                                <p className="font-medium text-white">{current.customer_name}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Telepon</p>
                                <p className="text-white">{current.customer_phone}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-slate-500">Alamat</p>
                                <p className="text-white">{current.destination_address}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card space-y-3">
                        <h3 className="flex items-center gap-2 font-semibold text-white">
                            <Truck size={16} className="text-flame" />
                            Detail Pengiriman
                        </h3>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-slate-500">Driver</p>
                                <p className="text-white">{current.driver?.name ?? '-'}</p>
                            </div>

                            <div>
                                <p className="text-slate-500">Jenis BBM</p>
                                <p className="text-white">{current.fuel_type?.replace('_', ' ')}</p>
                            </div>

                            <div>
                                <p className="text-slate-500">Volume</p>
                                <p className="font-mono text-white">{current.volume_liters} L</p>
                            </div>

                            <div>
                                <p className="text-slate-500">Total Harga</p>
                                <p className="font-mono text-white">
                                    Rp {Number(current.total_price).toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {current.proof && (
                        <div className="card space-y-3">
                            <h3 className="flex items-center gap-2 font-semibold text-white">
                                <FileText size={16} className="text-flame" />
                                Bukti Pengiriman
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-slate-500">Penerima</p>
                                    <p className="text-white">{current.proof.recipient_name}</p>
                                </div>

                                <div>
                                    <p className="text-slate-500">Geofence</p>
                                    <p
                                        className={
                                        current.proof.geofence_valid ? 'text-emerald-400' : 'text-red-400'
                                        }>
                                        {current.proof.geofence_valid ? '✅ Valid' : '❌ Di luar zona'}
                                    </p>
                                </div>
                            </div>

                            {current.proof.signature_url && (
                                <div>
                                    <p className="mb-2 text-sm text-slate-500">Tanda Tangan</p>
                                    <img
                                        src={current.proof.signature_url}
                                        alt="Tanda tangan"
                                        className="h-20 rounded-lg bg-white p-2"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {tab === 'map' && (
                <div className="card !p-0 overflow-hidden rounded-2xl" style={{ height: 400 }}>
                    <DeliveryMap delivery={current} locations={current.locations || []} />
                </div>
            )}

            {tab === 'photos' && (
                <div className="space-y-4">
                    {hasRole(['driver']) && !['COMPLETED'].includes(current.status) && (
                        <PhotoUpload deliveryId={current.id} onUploaded={() => fetchDelivery(id)} />
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        {(current.photos || []).map((photo) => (
                            <div key={photo.id} className="card !p-0 overflow-hidden rounded-xl">
                                <img
                                    src={photo.photo_url}
                                    alt={photo.caption}
                                    className="h-40 w-full object-cover"
                                />

                                <div className="p-3">
                                    <p className="text-flame text-xs font-medium">{photo.photo_type}</p>
                                    
                                    {photo.caption && (
                                        <p className="mt-0.5 text-xs text-slate-500">{photo.caption}</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {(current.photos || []).length === 0 && !hasRole(['driver']) && (
                            <p className="col-span-2 py-8 text-center text-slate-600">Belum ada foto</p>
                        )}
                    </div>
                </div>
            )}

            {tab === 'timeline' && (
                <div className="card">
                    <StatusTimeline logs={current.statusLogs || []} />
                </div>
            )}
        </div>
    );
}