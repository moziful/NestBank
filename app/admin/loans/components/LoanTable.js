'use client';

import Link from 'next/link';
import Pagination from '@/app/components/Pagination';

export default function LoanTable({
    loans = [],
    loading,
    pagination,
    basePath = '/admin/loans',
    permissions = {},
    onPageChange,
    onOpenDisburseModal
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

    if (!loans || loans.length === 0) {
        return (
            <div className="bg-surface border border-primary/20 rounded-xl p-12 text-center shadow-sm">
                <svg className="w-12 h-12 mx-auto opacity-30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h4 className="text-sm font-semibold">No Loan Records Found</h4>
                <p className="text-xs opacity-60 mt-1">Try selecting a different tab or filter.</p>
            </div>
        );
    }

    const renderStatusBadge = (status, disbStatus) => {
        const s = (status || '').toUpperCase();
        if (s === 'ACTIVE') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                    Active
                </span>
            );
        }
        if (s === 'APPROVED' && disbStatus !== 'DISBURSED') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400">
                    Pending Disb.
                </span>
            );
        }
        if (s === 'OVERDUE') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400">
                    Overdue
                </span>
            );
        }
        if (s === 'COMPLETED') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-400">
                    Completed
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 opacity-70">
                {status}
            </span>
        );
    };

    return (
        <div className="bg-surface border border-primary/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-primary/5 border-b border-primary/10 opacity-70 uppercase tracking-wider font-semibold">
                            <th className="py-3.5 px-4">Loan ID</th>
                            <th className="py-3.5 px-4">Customer</th>
                            <th className="py-3.5 px-4">Loan Type</th>
                            <th className="py-3.5 px-4">Approved Principal</th>
                            <th className="py-3.5 px-4">Outstanding</th>
                            <th className="py-3.5 px-4">Interest Rate</th>
                            <th className="py-3.5 px-4">Term</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10">
                        {loans.map((loan) => {
                            const isPendingDisbursement = loan.status === 'Approved' && loan.disbursementStatus !== 'DISBURSED';
                            const principal = loan.approvedAmount || loan.amount || loan.requestedAmount || 0;
                            const outstanding = loan.outstandingPrincipal !== undefined ? loan.outstandingPrincipal : principal;

                            return (
                                <tr key={loan._id || loan.loanId} className="hover:bg-primary/5 transition-colors">
                                    <td className="py-3.5 px-4 font-mono font-medium">
                                        {loan.loanId || loan.applicationId}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <div className="font-semibold">{loan.customerName}</div>
                                        <div className="text-[10px] opacity-60 font-mono">{loan.accountNumber}</div>
                                    </td>
                                    <td className="py-3.5 px-4 font-medium">
                                        <span className="px-2 py-0.5 rounded bg-primary/10 text-[10px]">
                                            {loan.loanType || 'Personal Loan'}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 font-bold text-accent">
                                        ৳{principal.toLocaleString()}
                                    </td>
                                    <td className="py-3.5 px-4 font-bold">
                                        ৳{outstanding.toLocaleString()}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        {loan.annualInterestRate || loan.interestRate || 10}%
                                    </td>
                                    <td className="py-3.5 px-4 opacity-80">
                                        {loan.durationMonths || 12} Mos
                                    </td>
                                    <td className="py-3.5 px-4">
                                        {renderStatusBadge(loan.status, loan.disbursementStatus)}
                                    </td>
                                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                                        {permissions.canDisburse !== false && isPendingDisbursement && (
                                            <button
                                                type="button"
                                                onClick={() => onOpenDisburseModal(loan)}
                                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition-colors text-[11px]"
                                            >
                                                Disburse
                                            </button>
                                        )}
                                        <Link
                                            href={`${basePath}/${loan.loanId || loan._id}`}
                                            className="px-2.5 py-1 rounded bg-accent/15 hover:bg-accent/25 text-accent font-semibold transition-colors text-[11px] inline-block"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <Pagination
                    pagination={pagination}
                    onPageChange={onPageChange}
                    entityName="loans"
                />
            )}
        </div>
    );
}
