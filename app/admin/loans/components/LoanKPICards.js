'use client';

import { FiFileText, FiClock, FiActivity, FiDollarSign, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { formatBDT } from '../../overview/DashboardCharts';

export default function LoanKPICards({ stats, loading }) {
    const data = stats || {
        totalLoans: 0,
        pendingDisbursement: 0,
        activeLoans: 0,
        completedLoans: 0,
        overdueLoans: 0,
        totalDisbursed: 0,
        totalRepaid: 0,
        outstandingPrincipal: 0
    };

    const cards = [
        {
            title: 'Active Loans',
            value: data.activeLoans.toLocaleString(),
            desc: 'Currently being repaid',
            icon: FiActivity,
            color: 'text-accent',
            bg: 'bg-accent/10'
        },
        {
            title: 'Pending Disbursement',
            value: data.pendingDisbursement.toLocaleString(),
            desc: 'Approved awaiting release',
            icon: FiClock,
            color: 'text-amber-600',
            bg: 'bg-amber-500/10'
        },
        {
            title: 'Total Disbursed',
            value: formatBDT(data.totalDisbursed),
            desc: 'Lifetime principal released',
            icon: FiDollarSign,
            color: 'text-emerald-600',
            bg: 'bg-emerald-500/10'
        },
        {
            title: 'Outstanding Principal',
            value: formatBDT(data.outstandingPrincipal),
            desc: 'Remaining portfolio principal',
            icon: FiFileText,
            color: 'text-sky-600',
            bg: 'bg-sky-500/10'
        },
        {
            title: 'Overdue Loans',
            value: data.overdueLoans.toLocaleString(),
            desc: 'Require immediate attention',
            icon: FiAlertCircle,
            color: 'text-rose-600',
            bg: 'bg-rose-500/10'
        },
        {
            title: 'Total Repaid',
            value: formatBDT(data.totalRepaid),
            desc: 'Total principal collected',
            icon: FiCheckCircle,
            color: 'text-emerald-600',
            bg: 'bg-emerald-500/10'
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
            {cards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div
                        key={idx}
                        className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm transition-all flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
                                {card.title}
                            </span>
                            <div className={`h-8 w-8 rounded-lg ${card.bg} grid place-items-center ${card.color}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-xl font-bold">
                            {loading ? '...' : card.value}
                        </div>
                        <p className="mt-1 text-[10px] opacity-70 truncate">{card.desc}</p>
                    </div>
                );
            })}
        </div>
    );
}
