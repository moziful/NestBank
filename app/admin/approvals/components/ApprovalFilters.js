'use client';

export default function ApprovalFilters({
    activeTab,
    onTabChange,
    search,
    onSearchChange,
    status,
    onStatusChange,
    priority,
    onPriorityChange,
    onReset,
    counts
}) {
    const tabs = [
        { id: 'ALL', label: 'All Pending', count: counts?.totalPending },
        { id: 'DEPOSIT', label: 'Deposits', count: counts?.pendingDeposits },
        { id: 'WITHDRAWAL', label: 'Withdrawals', count: counts?.pendingWithdrawals },
        { id: 'LOAN', label: 'Loan Applications', count: counts?.pendingLoans },
        { id: 'HISTORY', label: 'Decision History' },
    ];

    return (
        <div className="bg-surface border border-primary/20 rounded-xl p-4 shadow-sm space-y-4 mb-4">
            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-primary/10">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onTabChange(tab.id)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${isActive
                                ? 'bg-accent text-surface shadow'
                                : 'opacity-70 hover:opacity-100 hover:bg-primary/5'
                                }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive ? 'bg-surface text-primary' : 'bg-primary/15'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Filter toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="lg:col-span-2 relative">
                    <input
                        type="text"
                        placeholder="Search by Request ID, Customer, or Account #..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-background border border-primary/20 focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <svg className="w-4 h-4 absolute left-3 top-2.5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {activeTab !== 'HISTORY' ? (
                    <div>
                        <select
                            value={priority}
                            onChange={(e) => onPriorityChange(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-primary/20 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                        >
                            <option value="All">All Priorities</option>
                            <option value="Normal">Normal</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                        </select>
                    </div>
                ) : (
                    <div>
                        <select
                            value={status}
                            onChange={(e) => onStatusChange(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-primary/20 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                        >
                            <option value="All">All Decisions</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onReset}
                        className="w-full py-2 rounded-lg border border-primary/20 hover:bg-primary/5 text-xs font-semibold cursor-pointer transition-colors"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>
        </div>
    );
}
