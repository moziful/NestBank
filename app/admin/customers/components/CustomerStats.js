'use client';

import { FiUsers, FiUserCheck, FiUserX, FiShield, FiUserPlus } from 'react-icons/fi';

export default function CustomerStats({ statistics, isLoading }) {
    const stats = statistics || {
        totalCustomers: 0,
        activeCustomers: 0,
        inactiveCustomers: 0,
        blockedCustomers: 0,
        newThisMonth: 0,
    };

    const total = stats.totalCustomers || 1;
    const activePct = ((stats.activeCustomers / total) * 100).toFixed(1);

    const cards = [
        {
            title: 'Total Customers',
            count: stats.totalCustomers,
            desc: 'All registered customers',
            icon: FiUsers,
            color: 'text-accent',
            bg: 'bg-accent/10',
        },
        {
            title: 'Active Customers',
            count: stats.activeCustomers,
            desc: `${activePct}% of total customers`,
            icon: FiUserCheck,
            color: 'text-emerald-600',
            bg: 'bg-emerald-500/10',
        },
        {
            title: 'Inactive Customers',
            count: stats.inactiveCustomers,
            desc: 'Access deactivated',
            icon: FiUserX,
            color: 'text-zinc-600',
            bg: 'bg-zinc-500/10',
        },
        {
            title: 'Blocked Customers',
            count: stats.blockedCustomers,
            desc: 'Restricted for security/AML',
            icon: FiShield,
            color: 'text-rose-600',
            bg: 'bg-rose-500/10',
        },
        {
            title: 'New This Month',
            count: stats.newThisMonth,
            desc: 'Joined in current month',
            icon: FiUserPlus,
            color: 'text-blue-600',
            bg: 'bg-blue-500/10',
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
                            {isLoading ? '...' : card.count.toLocaleString()}
                        </div>
                        <p className="mt-1 text-[11px] opacity-70">{card.desc}</p>
                    </div>
                );
            })}
        </div>
    );
}
