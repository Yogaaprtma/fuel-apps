import React from 'react';

const COLORS = {
    CREATED: 'bg-slate-700 text-slate-300',
    PACKED: 'bg-blue-900 text-blue-300',
    IN_TRANSIT: 'bg-amber-900 text-amber-300',
    NEAR_DESTINATION: 'bg-orange-900 text-orange-300',
    DELIVERED: 'bg-emerald-900 text-emerald-300',
    COMPLETED: 'bg-green-900 text-green-300',
};

export default function StatusBadge({ status }) {
    return (
        <span className={`status-badge ${COLORS[status] || 'bg-slate-700 text-slate-300'}`}>
            {status?.replace('_', ' ')}
        </span>
    );
}