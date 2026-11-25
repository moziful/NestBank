'use client';

import { FiInbox, FiDownload, FiUpload, FiFileText } from 'react-icons/fi';

export default function ApprovalStats({ stats, loading }) {
    const data = stats || {
        totalPending: 0,
        pendingDeposits: 0,
        pendingWithdrawals: 0,
        pendingLoans: 0,
    };

    const cards = [
        {
            title: 'Total Pending',
            count: data.totalPending,
            desc: 'All request types',
            icon: FiInbox,
            color: 'text-accent',
            bg: 'bg-accent/10',
        },
        {
            title: 'Deposit Requests',
            count: data.pendingDeposits,
            desc: 'Awaiting approval',
            icon: FiDownload,
            color: 'text-emerald-600',
            bg: 'bg-emerald-500/10',
        },
        {
            title: 'Withdrawal Requests',
            count: data.pendingWithdrawals,
            desc: 'Awaiting approval',
            icon: FiUpload,
            color: 'text-rose-600',
            bg: 'bg-rose-500/10',
        },
        {
            title: 'Loan Applications',
            count: data.pendingLoans,
            desc: 'Awaiting credit review',
            icon: FiFileText,
            color: 'text-sky-600',
            bg: 'bg-sky-500/10',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
