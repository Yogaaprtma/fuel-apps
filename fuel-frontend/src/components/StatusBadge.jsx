import React from 'react';

const STATUS_CONFIG = {
  CREATED:          { label: 'Created',       bg: '#F8FAFC', color: '#475569', border: '#E2E8F0',  dot: '#CBD5E1' },
  PACKED:           { label: 'Packed',        bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE',  dot: '#60A5FA' },
  IN_TRANSIT:       { label: 'In Transit',    bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA',  dot: '#FB923C' },
  NEAR_DESTINATION: { label: 'Near Dest.',    bg: '#ECFEFF', color: '#0E7490', border: '#A5F3FC',  dot: '#22D3EE' },
  DELIVERED:        { label: 'Delivered',     bg: '#ECFDF5', color: '#059669', border: '#A7F3D0',  dot: '#34D399' },
  COMPLETED:        { label: 'Completed',     bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE',  dot: '#A78BFA' },
};

export default function StatusBadge({ status, pulse = false, size = 'sm' }) {
  const cfg   = STATUS_CONFIG[status] ?? STATUS_CONFIG.CREATED;
  const sizes = size === 'lg'
    ? 'px-3 py-1 text-xs gap-1.5'
    : 'px-2.5 py-0.5 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizes}`}
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pulse ? 'animate-pulse-dot' : ''}`}
        style={{ background: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
}