'use client';

import { FiSearch, FiRefreshCw, FiDownload } from 'react-icons/fi';

export const ACCOUNT_TYPES = ['All', 'Savings', 'Current', 'Business'];
export const ACCOUNT_STATUSES = ['All', 'Active', 'Frozen', 'Closed'];

export default function AccountFilters({
    search,
    onSearchChange,
    accountType,
    onAccountTypeChange,
    status,
    onStatusChange,
    sortBy,
    onSortByChange,
    onReset,
    onExportCsv,
}) {
    return (
        <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-1 flex-wrap items-center gap-2">
                {/* Search */}
                <div className="flex items-center rounded-lg border border-primary/20 bg-white/20 px-3 py-2 min-w-[200px] flex-1">
                    <FiSearch className="mr-2 h-4 w-4 opacity-60" />
                    <input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search account number, customer name, ID..."
                        className="w-full bg-transparent outline-none placeholder:text-primary/50 text-xs"
                    />
                </div>

                {/* Account Type */}
                <select
                    value={accountType}
                    onChange={(e) => onAccountTypeChange(e.target.value)}
                    className="rounded-lg border border-primary/20 bg-white/20 px-3 py-2 outline-none font-medium cursor-pointer"
                >
                    {ACCOUNT_TYPES.map((t) => (
                        <option key={t} value={t}>
                            {t === 'All' ? 'All Account Types' : `${t} Account`}
                        </option>
                    ))}
                </select>

                {/* Status */}
                <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="rounded-lg border border-primary/20 bg-white/20 px-3 py-2 outline-none font-medium cursor-pointer"
                >
                    {ACCOUNT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                            {s === 'All' ? 'All Statuses' : s}
                        </option>
                    ))}
                </select>

                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={(e) => onSortByChange(e.target.value)}
                    className="rounded-lg border border-primary/20 bg-white/20 px-3 py-2 outline-none font-medium cursor-pointer"
                >
                    <option value="createdAt">Sort: Opening Date</option>
                    <option value="balance">Sort: Balance</option>
                    <option value="accountNumber">Sort: Account Number</option>
                </select>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <button
                    type="button"
                    onClick={onReset}
                    className="flex items-center gap-1.5 rounded-lg border border-primary/20 px-3 py-2 font-medium hover:bg-secondary hover:text-surface transition-colors cursor-pointer"
                    title="Reset all filters"
                >
                    <FiRefreshCw className="h-3.5 w-3.5" />
                    <span>Reset</span>
                </button>
                <button
                    type="button"
                    onClick={onExportCsv}
                    className="flex items-center gap-1.5 rounded-lg bg-accent text-white px-3 py-2 font-semibold hover:bg-secondary transition-colors cursor-pointer"
                    title="Export accounts to CSV"
                >
                    <FiDownload className="h-3.5 w-3.5" />
                    <span>Export CSV</span>
                </button>
            </div>
        </div>
    );
}
