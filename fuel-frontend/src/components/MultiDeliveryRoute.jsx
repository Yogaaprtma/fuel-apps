import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package, Fuel, ArrowRight, Navigation, CheckCircle2, Clock, Route } from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import StatusBadge from '../components/StatusBadge';

const ACTIVE_STATUSES = ['CREATED','PACKED','IN_TRANSIT','NEAR_DESTINATION','DELIVERED'];

const PRIORITY = {
  NEAR_DESTINATION: 1,
  IN_TRANSIT:       2,
  PACKED:           3,
  CREATED:          4,
  DELIVERED:        5,
};

/**
 * Multi-delivery routing view untuk driver
 * Menampilkan semua delivery aktif milik driver, diurutkan by priority & distance
 */
export default function MultiDeliveryRoute() {
  const navigate = useNavigate();
  const { deliveries, fetchDeliveries } = useDeliveryStore();
  const [myLocation, setMyLocation] = useState(null);

  useEffect(() => {
    fetchDeliveries({ per_page: 50 });
    // Ambil lokasi driver sekarang untuk estimasi jarak
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  // Filter hanya delivery aktif milik driver yang login
  const activeDeliveries = (deliveries || [])
    .filter(d => ACTIVE_STATUSES.includes(d.status))
    .sort((a, b) => {
      // Urutkan berdasarkan prioritas status
      const pa = PRIORITY[a.status] ?? 99;
      const pb = PRIORITY[b.status] ?? 99;
      if (pa !== pb) return pa - pb;
      // Jika sama, urutkan berdasarkan jarak dari lokasi driver
      if (myLocation && a.destination_lat && b.destination_lat) {
        const da = haversine(myLocation.lat, myLocation.lng, parseFloat(a.destination_lat), parseFloat(a.destination_lng));
        const db = haversine(myLocation.lat, myLocation.lng, parseFloat(b.destination_lat), parseFloat(b.destination_lng));
        return da - db;
      }
      return 0;
    });

  const completedToday = (deliveries || []).filter(d => d.status === 'COMPLETED').length;

  if (activeDeliveries.length === 0) {
    return (
      <div className="card text-center py-10">
        <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-3" />
        <p className="font-semibold text-slate-600">Semua pengiriman selesai! 🎉</p>
        <p className="text-sm text-slate-400 mt-1">{completedToday} pengiriman diselesaikan hari ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 pb-1">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}>
          <Route size={18} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-base">Rute Pengiriman</h2>
          <p className="text-xs text-slate-400">{activeDeliveries.length} aktif · {completedToday} selesai hari ini</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">Progress Hari Ini</span>
          <span className="text-xs font-bold text-blue-600">
            {completedToday}/{completedToday + activeDeliveries.length}
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${(completedToday / (completedToday + activeDeliveries.length)) * 100}%` }}
          />
        </div>
      </div>

      {/* Delivery List — urutan prioritas */}
      <div className="space-y-2">
        {activeDeliveries.map((delivery, index) => {
          const dist = myLocation && delivery.destination_lat
            ? haversine(myLocation.lat, myLocation.lng, parseFloat(delivery.destination_lat), parseFloat(delivery.destination_lng))
            : null;

          return (
            <button
              key={delivery.id}
              onClick={() => navigate(`/deliveries/${delivery.id}`)}
              className="card w-full text-left hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-start gap-3">
                {/* Step number */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
                  style={{
                    background: index === 0 ? '#2563EB' : '#F1F5F9',
                    color:      index === 0 ? '#FFFFFF' : '#64748B',
                  }}
                >
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-semibold text-slate-500">{delivery.delivery_code}</span>
                    <StatusBadge status={delivery.status} size="xs" />
                    {index === 0 && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: '#EFF6FF', color: '#2563EB' }}>
                        ← Sekarang
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-700 truncate">{delivery.customer_name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin size={10} />
                      {delivery.destination_address?.split(',')[0]}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Fuel size={10} />
                      {delivery.volume_liters}L {delivery.fuel_type?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {dist !== null && (
                    <p className="text-[10px] text-blue-500 mt-1 flex items-center gap-1">
                      <Navigation size={9} />
                      {dist < 1000 ? `${Math.round(dist)}m` : `${(dist/1000).toFixed(1)}km`} dari lokasi Anda
                    </p>
                  )}
                </div>

                <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-400 transition-colors mt-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Haversine formula untuk hitung jarak (meter)
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
