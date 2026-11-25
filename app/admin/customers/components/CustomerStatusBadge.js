'use client';

export default function CustomerStatusBadge({ status }) {
    const styles = {
        Active: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
        Inactive: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30',
        Blocked: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
    };

    const dots = {
        Active: 'bg-emerald-500',
        Inactive: 'bg-zinc-400',
        Blocked: 'bg-rose-500',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                styles[status] || styles.Inactive
            }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${dots[status] || dots.Inactive}`} />
            {status}
        </span>
    );
}
