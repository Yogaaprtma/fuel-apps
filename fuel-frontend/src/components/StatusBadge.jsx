import React from 'react';

const STATUS_CONFIG = {
  CREATED:          { color: '#94a3b8', bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.25)', label: 'Created',       dot: '#94a3b8' },
  PACKED:           { color: '#60a5fa', bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.25)',  label: 'Packed',        dot: '#60a5fa' },
  IN_TRANSIT:       { color: '#fb923c', bg: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.25)',  label: 'In Transit',    dot: '#fb923c' },
  NEAR_DESTINATION: { color: '#22d3ee', bg: 'rgba(6,182,212,0.15)',   border: 'rgba(6,182,212,0.25)',   label: 'Near Dest.',    dot: '#22d3ee' },
  DELIVERED:        { color: '#4ade80', bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.25)',   label: 'Delivered',     dot: '#4ade80' },
  COMPLETED:        { color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.25)', label: 'Completed',     dot: '#a78bfa' },
};

export default function StatusBadge({ status, size = 'sm', pulse = false }) {
  const cfg = STATUS_CONFIG[status] ?? {
    color: '#8fa3bd', bg: 'rgba(143,163,189,0.1)', border: 'rgba(143,163,189,0.2)', label: status ?? 'Unknown', dot: '#8fa3bd'
  };

  const isActive = ['IN_TRANSIT', 'NEAR_DESTINATION'].includes(status);

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-semibold select-none"
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        fontSize: size === 'sm' ? '11px' : size === 'md' ? '12px' : '13px',
        padding: size === 'sm' ? '3px 10px' : '4px 12px',
        boxShadow: isActive ? `0 0 10px ${cfg.color}30` : undefined,
      }}
    >
      <span
        className={`rounded-full flex-shrink-0 ${(isActive || pulse) ? 'animate-ping-slow' : ''}`}
        style={{
          width: size === 'sm' ? '5px' : '6px',
          height: size === 'sm' ? '5px' : '6px',
          background: cfg.dot,
          display: 'inline-block',
        }}
      />
      {cfg.label}
    </span>
  );
}