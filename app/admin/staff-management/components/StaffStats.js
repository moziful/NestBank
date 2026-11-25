'use client';

import { FiUsers, FiUserCheck, FiUserX, FiUserPlus } from 'react-icons/fi';

export default function StaffStats({ statistics, isLoading }) {
    const stats = statistics || {
        totalStaff: 0,
        activeStaff: 0,
        inactiveStaff: 0,
        newThisMonth: 0,
    };

    const cards = [
        {
            title: 'Total Staff',
            count: stats.totalStaff,
            desc: 'All registered staff accounts',
            icon: FiUsers,
            color: 'text-accent',
            bg: 'bg-accent/10',
        },
        {
            title: 'Active Staff',
            count: stats.activeStaff,
            desc: 'Permitted to access the system',
            icon: FiUserCheck,
            color: 'text-emerald-600',
            bg: 'bg-emerald-500/10',
        },
        {
            title: 'Inactive Staff',
            count: stats.inactiveStaff,
            desc: 'Deactivated or suspended',
            icon: FiUserX,
            color: 'text-rose-600',
            bg: 'bg-rose-500/10',
        },
        {
            title: 'New This Month',
            count: stats.newThisMonth,
            desc: 'Staff accounts created this month',
            icon: FiUserPlus,
            color: 'text-blue-600',
            bg: 'bg-blue-500/10',
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
                            {isLoading ? '...' : card.count}
                        </div>
                        <p className="mt-1 text-[11px] opacity-70">{card.desc}</p>
                    </div>
                );
            })}
        </div>
    );
}
