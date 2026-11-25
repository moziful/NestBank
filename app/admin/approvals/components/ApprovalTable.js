'use client';

import Pagination from '@/app/components/Pagination';

export default function ApprovalTable({
    items = [],
    activeTab,
    loading,
    pagination,
    onPageChange,
    onSelectRequest
}) {
    if (loading) {
        return (
            <div className="bg-surface border border-primary/20 rounded-xl p-6 shadow-sm">
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 bg-primary/5 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="bg-surface border border-primary/20 rounded-xl p-12 text-center shadow-sm">
                <svg className="w-12 h-12 mx-auto opacity-30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h4 className="text-sm font-semibold">No Pending Requests</h4>
                <p className="text-xs opacity-60 mt-1">There are currently no requests awaiting administrative review under this category.</p>
            </div>
        );
    }

    const renderStatusBadge = (status) => {
        const s = (status || 'Pending').toLowerCase();
        if (s === 'approved') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Approved
                </span>
            );
        }
        if (s === 'rejected') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                    Rejected
                </span>
            );
        }
        if (s === 'under review') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                    Under Review
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                Pending
            </span>
        );
    };

    return (
        <div className="bg-surface border border-primary/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-primary/5 border-b border-primary/10 opacity-70 uppercase tracking-wider font-semibold">
                            <th className="py-3.5 px-4">
                                {activeTab === 'LOAN' ? 'Application ID' : 'Request ID'}
                            </th>
                            <th className="py-3.5 px-4">Customer</th>
                            {activeTab === 'LOAN' ? (
                                <>
                                    <th className="py-3.5 px-4">Loan Type</th>
                                    <th className="py-3.5 px-4">Requested Amount</th>
                                    <th className="py-3.5 px-4">Duration</th>
                                    <th className="py-3.5 px-4">Monthly Income</th>
                                </>
                            ) : (
                                <>
                                    <th className="py-3.5 px-4">Type</th>
                                    <th className="py-3.5 px-4">Account</th>
                                    <th className="py-3.5 px-4">Amount (BDT)</th>
                                    <th className="py-3.5 px-4">Priority</th>
                                </>
                            )}
                            <th className="py-3.5 px-4">Submitted Date</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10">
                        {items.map((item) => (
                            <tr key={item._id || item.requestId || item.loanId} className="hover:bg-primary/5 transition-colors">
                                <td className="py-3.5 px-4 font-mono font-medium">
                                    {item.requestId || item.loanId || item.applicationId}
                                </td>
                                <td className="py-3.5 px-4 font-semibold">
                                    {item.customerName || 'Customer'}
                                </td>
                                {activeTab === 'LOAN' ? (
                                    <>
                                        <td className="py-3.5 px-4">
                                            <span className="px-2 py-0.5 rounded bg-primary/10 font-medium">
                                                {item.loanType || 'Personal'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-bold">
                                            ৳{(item.amount || item.requestedAmount || 0).toLocaleString()}
                                        </td>
                                        <td className="py-3.5 px-4 opacity-80">
                                            {item.durationMonths ? `${item.durationMonths} Mos` : '12 Mos'}
                                        </td>
                                        <td className="py-3.5 px-4 font-semibold text-emerald-600">
                                            ৳{(item.monthlyIncome || 0).toLocaleString()}
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="py-3.5 px-4 font-medium">
                                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                                (item.type || item.category) === 'Withdrawal'
                                                    ? 'bg-rose-500/10 text-rose-600'
                                                    : 'bg-emerald-500/10 text-emerald-600'
                                            }`}>
                                                {item.type || item.category || 'Deposit'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-mono opacity-80">
                                            {item.accountNumber ? `•••• ${item.accountNumber.slice(-4)}` : '•••• 1001'}
                                        </td>
                                        <td className="py-3.5 px-4 font-bold">
                                            ৳{(item.amount || 0).toLocaleString()}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                item.priority === 'Urgent'
                                                    ? 'bg-rose-500/10 text-rose-600'
                                                    : item.priority === 'High'
                                                    ? 'bg-amber-500/10 text-amber-600'
                                                    : 'bg-primary/10 opacity-70'
                                            }`}>
                                                {item.priority || 'Normal'}
                                            </span>
                                        </td>
                                    </>
                                )}
                                <td className="py-3.5 px-4 opacity-70">
                                    {item.submittedAt || item.createdAt
                                        ? new Date(item.submittedAt || item.createdAt).toLocaleDateString()
                                        : '—'}
                                </td>
                                <td className="py-3.5 px-4">
                                    {renderStatusBadge(item.status)}
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                    <button
                                        type="button"
                                        onClick={() => onSelectRequest(item, activeTab === 'LOAN' ? 'LOAN' : 'BANKING')}
                                        className="px-3 py-1 rounded bg-accent/15 hover:bg-accent/25 text-accent font-semibold transition-colors cursor-pointer text-xs"
                                    >
                                        Review
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <Pagination
                    pagination={pagination}
                    onPageChange={onPageChange}
                    entityName={activeTab === 'LOAN' ? 'applications' : 'requests'}
                />
            )}
        </div>
    );
}
