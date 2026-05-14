import React, { useState } from 'react';
import { CheckCircle, Circle, Clock, Camera, X, MapPin } from 'lucide-react';

const STEPS = [
  { status: 'CREATED',          label: 'Order Dibuat',       sub: 'Admin membuat pesanan pengiriman' },
  { status: 'PACKED',           label: 'Dikemas',            sub: 'BBM disiapkan oleh gudang' },
  { status: 'IN_TRANSIT',       label: 'Dalam Perjalanan',   sub: 'Driver menuju tujuan' },
  { status: 'NEAR_DESTINATION', label: 'Mendekati Tujuan',   sub: 'Driver dalam radius geofence' },
  { status: 'DELIVERED',        label: 'Terkirim',           sub: 'Sampai di lokasi tujuan' },
  { status: 'COMPLETED',        label: 'Selesai',            sub: 'Bukti pengiriman telah diterima' },
];

const STATUS_ORDER = STEPS.map(s => s.status);

// Kelompokkan foto ke status berdasarkan timestamp
function groupPhotosByStatus(photos, logs) {
  if (!photos?.length || !logs?.length) return {};
  const result = {};
  const sortedLogs = [...logs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  photos.forEach(photo => {
    const photoTime = new Date(photo.created_at).getTime();
    let assignedStatus = sortedLogs[0]?.to_status || 'CREATED';
    for (let i = 0; i < sortedLogs.length; i++) {
      if (photoTime >= new Date(sortedLogs[i].created_at).getTime()) {
        assignedStatus = sortedLogs[i].to_status;
      } else break;
    }
    if (!result[assignedStatus]) result[assignedStatus] = [];
    result[assignedStatus].push(photo);
  });
  return result;
}

function PhotoModal({ photo, onClose }) {
  const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors">
          <X size={22} />
        </button>
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
          <img
            src={photo.photo_url}
            alt={photo.caption || 'Foto'}
            className="w-full object-contain max-h-[60vh]"
          />
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="badge badge-orange text-[10px]">{photo.photo_type}</span>
              {photo.uploader?.name && (
                <span className="text-xs" style={{ color: 'var(--text-dim)' }}>Oleh: {photo.uploader.name}</span>
              )}
            </div>
            {photo.caption && (
              <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>"{photo.caption}"</p>
            )}
            <div className="flex gap-4 text-xs" style={{ color: 'var(--text-dim)' }}>
              {photo.latitude && photo.longitude && (
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {parseFloat(photo.latitude).toFixed(5)}, {parseFloat(photo.longitude).toFixed(5)}
                </span>
              )}
              {photo.created_at && (
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {new Date(photo.created_at).toLocaleString('id-ID')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StatusTimeline({ currentStatus, logs = [], photos = [] }) {
  const [modalPhoto, setModalPhoto] = useState(null);
  const currentIndex   = STATUS_ORDER.indexOf(currentStatus);
  const photosByStatus = groupPhotosByStatus(photos, logs);

  const getLogForStatus = (status) => logs.find(l => l.to_status === status);

  return (
    <>
      <div className="space-y-0">
        {STEPS.map(({ status, label, sub }, index) => {
          const isDone    = index <= currentIndex;
          const isCurrent = status === currentStatus;
          const log       = getLogForStatus(status);
          const stepPhotos = photosByStatus[status] || [];

          return (
            <div key={status} className="flex gap-4">
              {/* Line + icon */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isCurrent ? 'ring-4' : ''}`}
                  style={{
                    background: isDone ? (isCurrent ? 'var(--primary)' : 'var(--success-light)') : 'var(--bg-muted)',
                    border: isDone ? (isCurrent ? '2px solid var(--primary)' : '2px solid var(--success-light)') : '2px solid var(--border-main)',
                    boxShadow: isCurrent ? '0 0 0 4px var(--primary-light)' : 'none',
                  }}
                >
                  {isDone ? (
                    isCurrent
                      ? <Clock size={14} className="text-white" />
                      : <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                  ) : (
                    <Circle size={14} style={{ color: 'var(--text-dim)' }} />
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div className="w-0.5 flex-1 my-1 rounded-full"
                    style={{ background: isDone && index < currentIndex ? 'var(--success-light)' : 'var(--border-main)', minHeight: '20px' }} />
                )}
              </div>

              {/* Content */}
              <div className={`pb-5 flex-1 ${index === STEPS.length - 1 ? 'pb-0' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-sm font-semibold transition-colors`}
                      style={{ color: isCurrent ? 'var(--primary)' : isDone ? 'var(--text-main)' : 'var(--text-dim)' }}>
                      {label}
                      {isCurrent && (
                        <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                          style={{ background: 'var(--bg-muted)', color: 'var(--primary)' }}>
                          <span className="w-1 h-1 rounded-full" style={{ background: 'var(--primary)' }} />
                          Sekarang
                        </span>
                      )}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: isDone ? 'var(--text-muted)' : 'var(--text-dim)' }}>{sub}</p>
                  </div>
                  {log && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] text-slate-400">
                        {new Date(log.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400">
                        {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {log.user?.name && (
                        <p className="text-[10px] text-blue-500 font-medium">{log.user.name}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes */}
                {log?.notes && (
                  <p className="text-xs mt-1.5 italic px-3 py-1.5 rounded-lg"
                    style={{ background: '#F8FAFC', color: '#64748B', border: '1px solid #F1F5F9' }}>
                    "{log.notes}"
                  </p>
                )}

                {/* Foto terkait status ini */}
                {stepPhotos.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <Camera size={11} className="text-slate-400" />
                    <span className="text-[10px] text-slate-400">{stepPhotos.length} foto:</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {stepPhotos.map(photo => (
                        <button
                          key={photo.id}
                          onClick={() => setModalPhoto(photo)}
                          className="relative group rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-md"
                          style={{ width: 44, height: 44, border: '1.5px solid #E2E8F0' }}
                          title={photo.caption || photo.photo_type}
                        >
                          <img src={photo.photo_url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Photo Modal */}
      {modalPhoto && <PhotoModal photo={modalPhoto} onClose={() => setModalPhoto(null)} />}
    </>
  );
}