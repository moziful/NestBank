'use client';

import TransactionStatusBadge from './TransactionStatusBadge';
import RiskStatusBadge from './RiskStatusBadge';
import Pagination from '@/app/components/Pagination';

export default function TransactionTable({
    transactions,
    loading,
    onSelectTransaction,
    pagination,
    onPageChange,
    onLimitChange,
    onSort,
    sortBy,
    sortOrder
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

    if (!transactions || transactions.length === 0) {
        return (
            <div className="bg-surface border border-primary/20 rounded-xl p-12 text-center shadow-sm">
                <svg className="w-12 h-12 mx-auto opacity-30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h4 className="text-sm font-semibold">No Transactions Found</h4>
                <p className="text-xs opacity-60 mt-1">Try adjusting your filters or search terms.</p>
            </div>
        );
    }

    const renderSortArrow = (field) => {
        if (sortBy !== field) return null;
        return <span>{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>;
    };

    return (
        <div className="bg-surface border border-primary/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-primary/5 border-b border-primary/10 opacity-70 uppercase tracking-wider font-semibold">
                            <th
                                className="py-3.5 px-4 cursor-pointer hover:opacity-100"
                                onClick={() => onSort('transactionId')}
                            >
                                Transaction ID {renderSortArrow('transactionId')}
                            </th>
                            <th className="py-3.5 px-4">Customer</th>
                            <th className="py-3.5 px-4">Type</th>
                            <th className="py-3.5 px-4">From Account</th>
                            <th className="py-3.5 px-4">To Account</th>
                            <th
                                className="py-3.5 px-4 cursor-pointer hover:opacity-100"
                                onClick={() => onSort('amount')}
                            >
                                Amount (BDT) {renderSortArrow('amount')}
                            </th>
                            <th
                                className="py-3.5 px-4 cursor-pointer hover:opacity-100"
                                onClick={() => onSort('createdAt')}
                            >
                                Date & Time {renderSortArrow('createdAt')}
                            </th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4">Risk</th>
                            <th className="py-3.5 px-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10">
                        {transactions.map((tx) => (
                            <tr
                                key={tx._id || tx.transactionId}
                                className="hover:bg-primary/5 transition-colors"
                            >
                                <td className="py-3.5 px-4 font-mono font-medium">
                                    {tx.transactionId}
                                </td>
                                <td className="py-3.5 px-4">
                                    <div className="font-semibold">{tx.customerName || 'N/A'}</div>
                                    <div className="text-[10px] opacity-60">{tx.customerId || 'CUS-xxxx'}</div>
                                </td>
                                <td className="py-3.5 px-4 font-medium">
                                    <span className="px-2 py-0.5 rounded bg-primary/10 text-[11px]">
                                        {tx.type}
                                    </span>
                                </td>
                                <td className="py-3.5 px-4 font-mono opacity-80">
                                    {tx.sourceAccountNumber || tx.accountNumber || '—'}
                                </td>
                                <td className="py-3.5 px-4 font-mono opacity-80">
                                    {tx.destinationAccountNumber || '—'}
                                </td>
                                <td className="py-3.5 px-4 font-bold">
                                    ৳{(tx.amount || 0).toLocaleString()}
                                </td>
                                <td className="py-3.5 px-4 opacity-70">
                                    {tx.createdAt ? new Date(tx.createdAt).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    }) : '—'}
                                </td>
                                <td className="py-3.5 px-4">
                                    <TransactionStatusBadge status={tx.status} />
                                </td>
                                <td className="py-3.5 px-4">
                                    <RiskStatusBadge riskStatus={tx.riskStatus} />
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                    <button
                                        type="button"
                                        onClick={() => onSelectTransaction(tx)}
                                        className="px-2.5 py-1 rounded bg-accent/15 hover:bg-accent/25 text-accent font-semibold transition-colors text-[11px] cursor-pointer"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Common Pagination Controls */}
            {pagination && (
                <Pagination
                    pagination={pagination}
                    onPageChange={onPageChange}
                    onLimitChange={onLimitChange}
                    entityName="transactions"
                />
            )}
        </div>
    );
}
