import React from 'react';
import { CheckCircle, Circle, Package, Truck, MapPin, Star, Clock } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'CREATED',          label: 'Dibuat',              icon: Package, color: '#94a3b8' },
  { key: 'PACKED',           label: 'Dipacking',           icon: Package, color: '#60a5fa' },
  { key: 'IN_TRANSIT',       label: 'Dalam Perjalanan',    icon: Truck,   color: '#fb923c' },
  { key: 'NEAR_DESTINATION', label: 'Dekat Tujuan',        icon: MapPin,  color: '#22d3ee' },
  { key: 'DELIVERED',        label: 'Terkirim',            icon: CheckCircle, color: '#4ade80' },
  { key: 'COMPLETED',        label: 'Selesai',             icon: Star,    color: '#a78bfa' },
];

const STATUS_ORDER = STATUS_STEPS.map(s => s.key);

export default function StatusTimeline({ currentStatus, logs = [] }) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);

  const getLogForStatus = (key) =>
    logs.filter(l => l.to_status === key).at(-1);

  return (
    <div className="relative">
      {STATUS_STEPS.map((step, idx) => {
        const isDone    = idx <= currentIdx;
        const isActive  = idx === currentIdx;
        const isPending = idx > currentIdx;
        const log       = getLogForStatus(step.key);
        const Icon      = step.icon;

        return (
          <div key={step.key} className="flex gap-4 relative">
            {/* Vertical line */}
            {idx < STATUS_STEPS.length - 1 && (
              <div className="absolute left-4 top-9 bottom-0 w-px"
                style={{
                  background: isDone && idx < currentIdx
                    ? `linear-gradient(to bottom, ${step.color}, ${STATUS_STEPS[idx+1].color}40)`
                    : 'rgba(30, 45, 66, 0.8)',
                  width: '1px',
                }} />
            )}

            {/* Icon circle */}
            <div className="relative flex-shrink-0 z-10">
              <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: isDone
                    ? `radial-gradient(circle, ${step.color}30, ${step.color}10)`
                    : 'rgba(30, 45, 66, 0.5)',
                  border: `1.5px solid ${isDone ? step.color : 'rgba(30,45,66,0.8)'}`,
                  boxShadow: isActive ? `0 0 16px ${step.color}50` : undefined,
                }}>
                <Icon size={14}
                  style={{ color: isDone ? step.color : '#2a3f5a' }}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              {isActive && (
                <div className="absolute inset-0 rounded-full animate-ping-slow"
                  style={{ border: `1px solid ${step.color}50` }} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold"
                  style={{ color: isDone ? step.color : '#2a3f5a' }}>
                  {step.label}
                </span>
                {isActive && (
                  <span className="badge-orange text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{
                      background: `${step.color}15`,
                      color: step.color,
                      border: `1px solid ${step.color}30`,
                      fontSize: '9px',
                    }}>
                    SEKARANG
                  </span>
                )}
              </div>

              {log ? (
                <div className="mt-1 space-y-0.5">
                  <p className="text-xs" style={{ color: '#4a6080' }}>
                    {log.user?.name ?? 'System'}
                    {log.notes ? ` · ${log.notes}` : ''}
                  </p>
                  <div className="flex items-center gap-1">
                    <Clock size={10} style={{ color: '#2a3f5a' }} />
                    <p className="text-[10px]" style={{ color: '#2a3f5a' }}>
                      {new Date(log.created_at).toLocaleString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ) : isPending ? (
                <p className="text-xs mt-0.5" style={{ color: '#2a3f5a' }}>Menunggu...</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}