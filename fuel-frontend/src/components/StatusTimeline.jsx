import React from 'react';
import { Clock } from 'lucide-react';

const STATUS_COLORS = {
    CREATED: 'bg-slate-600', 
    PACKED: 'bg-blue-600', 
    IN_TRANSIT: 'bg-amber-600',
    NEAR_DESTINATION: 'bg-orange-500', 
    DELIVERED: 'bg-emerald-600', 
    COMPLETED: 'bg-green-600',
};

export default function StatusTimeline({ logs }) {
    if (!logs.length) return <p className="text-slate-600 text-center py-6">Belum ada log status</p>;

    return (
        <div className="space-y-4">
            {logs.map((log, i) => (
                <div key={log.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full ${STATUS_COLORS[log.to_status] || 'bg-slate-600'} flex items-center justify-center flex-shrink-0`}>
                            <Clock size={14} className="text-white" />
                        </div>
                        {i < logs.length - 1 && <div className="w-0.5 h-full bg-slate-800 mt-2" />}
                    </div>
                    <div className="flex-1 pb-4">
                        <p className="text-white font-medium text-sm">{log.to_status?.replace('_', ' ')}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            oleh {log.user?.name} · {new Date(log.created_at).toLocaleString('id-ID')}
                        </p>
                        {log.notes && <p className="text-xs text-slate-600 mt-1 italic">{log.notes}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
}