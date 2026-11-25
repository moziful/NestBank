'use client';

import { FiCreditCard, FiCheckCircle, FiLock, FiDollarSign } from 'react-icons/fi';
import { formatBDT } from '../../overview/DashboardCharts';

export default function AccountStats({ statistics, isLoading }) {
    const stats = statistics || {
        totalAccounts: 0,
        activeAccounts: 0,
        frozenAccounts: 0,
        totalAccountBalance: 0,
    };

    const cards = [
        {
            title: 'Total Accounts',
            count: stats.totalAccounts,
            isCurrency: false,
            desc: 'All registered bank accounts',
            icon: FiCreditCard,
            color: 'text-accent',
            bg: 'bg-accent/10',
        },
        {
            title: 'Active Accounts',
            count: stats.activeAccounts,
            isCurrency: false,
            desc: 'Fully operational',
            icon: FiCheckCircle,
            color: 'text-emerald-600',
            bg: 'bg-emerald-500/10',
        },
        {
            title: 'Frozen Accounts',
            count: stats.frozenAccounts,
            isCurrency: false,
            desc: 'Temporarily restricted',
            icon: FiLock,
            color: 'text-sky-600',
            bg: 'bg-sky-500/10',
        },
        {
            title: 'Total Account Balance',
            count: stats.totalAccountBalance,
            isCurrency: true,
            desc: 'Combined accounts balance (BDT)',
            icon: FiDollarSign,
            color: 'text-accent',
            bg: 'bg-accent/10',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div
                        key={idx}
                        className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                                {card.title}
                            </span>
                            <div className={`h-9 w-9 rounded-lg ${card.bg} grid place-items-center ${card.color}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-bold">
                            {isLoading ? '...' : card.isCurrency ? formatBDT(card.count) : card.count.toLocaleString()}
                        </div>
                        <p className="mt-1 text-[11px] opacity-70">{card.desc}</p>
                    </div>
                );
            })}
        </div>
    );
}
