import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';

const STEPS = [
  { status: 'CREATED',          label: 'Order Dibuat',       sub: 'Admin membuat pesanan pengiriman' },
  { status: 'PACKED',           label: 'Dikemas',            sub: 'BBM disiapkan oleh gudang' },
  { status: 'IN_TRANSIT',       label: 'Dalam Perjalanan',   sub: 'Driver menuju tujuan' },
  { status: 'NEAR_DESTINATION', label: 'Mendekati Tujuan',   sub: 'Driver dalam radius 500m' },
  { status: 'DELIVERED',        label: 'Terkirim',           sub: 'Sampai di lokasi tujuan' },
  { status: 'COMPLETED',        label: 'Selesai',            sub: 'Bukti pengiriman telah diterima' },
];

const STATUS_ORDER = STEPS.map(s => s.status);

export default function StatusTimeline({ currentStatus, logs = [] }) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  const getLogForStatus = (status) =>
    logs.find(l => l.to_status === status);

  return (
    <div className="space-y-0">
      {STEPS.map(({ status, label, sub }, index) => {
        const isDone    = index <= currentIndex;
        const isCurrent = status === currentStatus;
        const log       = getLogForStatus(status);

        return (
          <div key={status} className="flex gap-4">
            {/* Line + icon */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                isCurrent
                  ? 'ring-4 ring-blue-100'
                  : ''
              }`}
                style={{
                  background: isDone
                    ? isCurrent ? '#2563EB' : '#ECFDF5'
                    : '#F1F5F9',
                  border: isDone
                    ? isCurrent ? '2px solid #2563EB' : '2px solid #A7F3D0'
                    : '2px solid #E2E8F0',
                }}>
                {isDone ? (
                  isCurrent ? (
                    <Clock size={14} className="text-white" />
                  ) : (
                    <CheckCircle size={14} style={{ color: '#059669' }} />
                  )
                ) : (
                  <Circle size={14} className="text-slate-300" />
                )}
              </div>
              {index < STEPS.length - 1 && (
                <div className="w-0.5 flex-1 my-1 rounded-full"
                  style={{ background: isDone && index < currentIndex ? '#A7F3D0' : '#E2E8F0', minHeight: '20px' }} />
              )}
            </div>

            {/* Content */}
            <div className={`pb-5 flex-1 ${index === STEPS.length - 1 ? 'pb-0' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`text-sm font-semibold transition-colors ${
                    isCurrent ? 'text-blue-600' : isDone ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    {label}
                    {isCurrent && (
                      <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                        style={{ background: '#EFF6FF', color: '#2563EB' }}>
                        <span className="w-1 h-1 rounded-full bg-blue-500" />
                        Sekarang
                      </span>
                    )}
                  </p>
                  <p className={`text-xs mt-0.5 ${isDone ? 'text-slate-400' : 'text-slate-300'}`}>{sub}</p>
                </div>
                {log && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-slate-400">
                      {new Date(log.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
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
              {log?.notes && (
                <p className="text-xs mt-1.5 italic px-3 py-1.5 rounded-lg"
                  style={{ background: '#F8FAFC', color: '#64748B', border: '1px solid #F1F5F9' }}>
                  "{log.notes}"
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}