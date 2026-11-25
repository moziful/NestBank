'use client';

export default function TransactionFilters({
    filters,
    onChange,
    onApply,
    onReset,
    activeTab,
    setActiveTab,
    counts
}) {
    const tabs = [
        { id: 'ALL', label: 'All Transactions' },
        { id: 'TRANSFER', label: 'Transfers' },
        { id: 'DEPOSIT', label: 'Deposits' },
        { id: 'WITHDRAWAL', label: 'Withdrawals' },
        { id: 'LOAN', label: 'Loan Transactions' },
        { id: 'FLAGGED', label: 'Flagged / Suspicious', count: counts?.flagged }
    ];

    return (
        <div className="bg-surface/20 border border-surface/30 rounded-xl p-4 mb-6 shadow-sm space-y-4">
            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-surface/20">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                                isActive
                                    ? 'bg-primary text-surface shadow'
                                    : 'text-foreground/70 hover:bg-surface/40 hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                    isActive ? 'bg-red-500 text-white' : 'bg-red-500/20 text-red-600 dark:text-red-400'
                                }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Search and Main Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search query */}
                <div className="lg:col-span-2 relative">
                    <input
                        type="text"
                        placeholder="Search by Txn ID, Account, Customer Name, or Ref..."
                        value={filters.search}
                        onChange={(e) => onChange('search', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onApply()}
                        className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-background border border-surface/30 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <svg className="w-4 h-4 absolute left-3 top-2.5 text-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Status */}
                <div>
                    <select
                        value={filters.status}
                        onChange={(e) => onChange('status', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-surface/30 text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Successful">Successful / Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Reversed">Reversed</option>
                    </select>
                </div>

                {/* Risk Status */}
                <div>
                    <select
                        value={filters.riskStatus}
                        onChange={(e) => onChange('riskStatus', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-surface/30 text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                        <option value="All">All Risk Levels</option>
                        <option value="NORMAL">Normal</option>
                        <option value="FLAGGED">Flagged</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="CLEARED">Cleared</option>
                    </select>
                </div>
            </div>

            {/* Secondary Filters row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {/* Date range */}
                <div>
                    <select
                        value={filters.dateRange}
                        onChange={(e) => onChange('dateRange', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-surface/30 text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                        <option value="All">All Time</option>
                        <option value="today">Today</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                    </select>
                </div>

                {/* Account Number */}
                <div>
                    <input
                        type="text"
                        placeholder="Filter by Account #..."
                        value={filters.account}
                        onChange={(e) => onChange('account', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-surface/30 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                </div>

                {/* Initiated By */}
                <div>
                    <select
                        value={filters.initiatedBy}
                        onChange={(e) => onChange('initiatedBy', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-surface/30 text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                        <option value="All">Initiated By (All)</option>
                        <option value="Customer">Customer</option>
                        <option value="Bank Staff">Bank Staff</option>
                        <option value="Admin">Admin</option>
                        <option value="System">System</option>
                    </select>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onApply}
                        className="flex-1 py-2 rounded-lg bg-primary hover:bg-secondary text-surface text-xs font-semibold shadow transition-colors"
                    >
                        Apply Filters
                    </button>
                    <button
                        type="button"
                        onClick={onReset}
                        className="px-3 py-2 rounded-lg bg-surface/30 hover:bg-surface/50 text-foreground text-xs font-medium border border-surface/20 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}
