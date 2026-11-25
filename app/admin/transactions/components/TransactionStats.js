'use client';

import { FiActivity, FiCheckCircle, FiClock, FiXCircle, FiAlertTriangle } from 'react-icons/fi';

export default function TransactionStats({ stats, loading }) {
    const data = stats || {
        total: 0,
        growth: '+12.8%',
        successful: 0,
        pending: 0,
        failedOrRejected: 0,
        flagged: 0,
    };

    const cards = [
        {
            title: 'Total Transactions',
            count: data.total,
            desc: `${data.growth} vs previous period`,
            icon: FiActivity,
            color: 'text-accent',
            bg: 'bg-accent/10',
        },
        {
            title: 'Successful',
            count: data.successful,
            desc: 'Completed transactions',
            icon: FiCheckCircle,
            color: 'text-emerald-600',
            bg: 'bg-emerald-500/10',
        },
        {
            title: 'Pending',
            count: data.pending,
            desc: 'Awaiting review or processing',
            icon: FiClock,
            color: 'text-amber-600',
            bg: 'bg-amber-500/10',
        },
        {
            title: 'Failed / Rejected',
            count: data.failedOrRejected,
            desc: 'Unsuccessful transactions',
            icon: FiXCircle,
            color: 'text-rose-600',
            bg: 'bg-rose-500/10',
        },
        {
            title: 'Flagged Transactions',
            count: data.flagged,
            desc: 'Require investigation',
            icon: FiAlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-500/10',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {cards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div
                        key={idx}
                        className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
                                {card.title}
                            </span>
                            <div className={`h-8 w-8 rounded-lg ${card.bg} grid place-items-center ${card.color}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl font-bold">
                            {loading ? '...' : card.count.toLocaleString()}
                        </div>
                        <p className="mt-1 text-[11px] opacity-70">{card.desc}</p>
                    </div>
                );
            })}
        </div>
    );
}
