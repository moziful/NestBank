'use client';

export default function AccountStatusBadge({ status }) {
    const styles = {
        Active: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
        Frozen: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30',
        'Pending Verification': 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
        Dormant: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30',
        Closed: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
    };

    const dots = {
        Active: 'bg-emerald-500',
        Frozen: 'bg-sky-500',
        'Pending Verification': 'bg-amber-500',
        Dormant: 'bg-zinc-400',
        Closed: 'bg-rose-500',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                styles[status] || styles.Active
            }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${dots[status] || dots.Active}`} />
            {status}
        </span>
    );
}
