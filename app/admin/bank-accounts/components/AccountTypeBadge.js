'use client';

export default function AccountTypeBadge({ type }) {
    const styles = {
        Savings: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
        Current: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
        Business: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    };

    return (
        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${styles[type] || styles.Savings}`}>
            {type}
        </span>
    );
}
