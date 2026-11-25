'use client';

export default function AuditFilters({
    activeTab,
    onTabChange,
    search,
    onSearchChange,
    category,
    onCategoryChange,
    severity,
    onSeverityChange,
    outcome,
    onOutcomeChange,
    dateRange,
    onDateRangeChange,
    onReset,
    counts
}) {
    const tabs = [
        { id: 'ALL', label: 'All Events', count: counts?.totalEvents },
        { id: 'ADMIN', label: 'Admin Activity' },
        { id: 'STAFF', label: 'Staff Activity' },
        { id: 'CUSTOMER', label: 'Customer Activity' },
        { id: 'SECURITY', label: 'Security Events' },
        { id: 'CRITICAL', label: 'Critical Events', count: counts?.criticalEvents },
    ];

    return (
        <div className="bg-surface border border-primary/20 rounded-xl p-4 shadow-sm space-y-4">
            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-primary/10">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onTabChange(tab.id)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                                isActive
                                    ? 'bg-accent text-surface shadow'
                                    : 'opacity-70 hover:opacity-100 hover:bg-primary/5'
                            }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                    isActive ? 'bg-surface text-primary' : 'bg-primary/15'
                                }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Main Search Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-2 relative">
                    <input
                        type="text"
                        placeholder="Search Event ID, Actor, Action, Target, or Reason..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-background border border-primary/20 focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <svg className="w-4 h-4 absolute left-3 top-2.5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Category */}
                <div>
                    <select
                        value={category}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-primary/20 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                    >
                        <option value="All">All Categories</option>
                        <option value="AUTHENTICATION">Authentication</option>
                        <option value="CUSTOMER">Customer Management</option>
                        <option value="STAFF">Staff Management</option>
                        <option value="ACCOUNT">Account Management</option>
                        <option value="TRANSACTION">Transactions</option>
                        <option value="APPROVAL">Approvals</option>
                        <option value="LOAN">Loans</option>
                        <option value="SECURITY">Security</option>
                        <option value="SYSTEM">System</option>
                    </select>
                </div>

                {/* Severity */}
                <div>
                    <select
                        value={severity}
                        onChange={(e) => onSeverityChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-primary/20 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                    >
                        <option value="All">All Severities</option>
                        <option value="INFO">Info</option>
                        <option value="WARNING">Warning</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </div>

                {/* Outcome */}
                <div>
                    <select
                        value={outcome}
                        onChange={(e) => onOutcomeChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-primary/20 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                    >
                        <option value="All">All Outcomes</option>
                        <option value="SUCCESS">Success</option>
                        <option value="FAILED">Failed</option>
                        <option value="DENIED">Denied</option>
                    </select>
                </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-[11px] opacity-60">Time Range:</span>
                    <select
                        value={dateRange}
                        onChange={(e) => onDateRangeChange(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg text-xs bg-background border border-primary/20 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                    >
                        <option value="All">All Time</option>
                        <option value="today">Today</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                    </select>
                </div>

                <button
                    type="button"
                    onClick={onReset}
                    className="px-4 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/5 text-xs font-semibold cursor-pointer transition-colors"
                >
                    Reset Filters
                </button>
            </div>
        </div>
    );
}
