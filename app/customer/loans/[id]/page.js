'use client';

import { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { formatBDT } from '@/lib/currency';

function CustomerLoanDetailContent({ params }) {
    const { id } = use(params);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/customer/loans/${id}`)
            .then((r) => r.json())
            .then((json) => {
                if (json.success) setData(json);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-8 text-center text-sm text-primary/60">Loading loan details...</div>;
    if (!data?.loan) {
        return (
            <div className="p-8 text-center space-y-2">
                <p className="text-sm text-rose-500">Loan not found or access denied.</p>
                <Link href="/customer/loans" className="text-xs text-accent underline">Back to My Loans</Link>
            </div>
        );
    }

    const { loan, schedules = [], repayments = [] } = data;
    const principal = Number(loan.principalAmount || loan.amount) || 0;
    const outstanding = Number(loan.outstandingPrincipal ?? principal);
    const repaidPct = principal > 0 ? Math.min(100, Math.round(((principal - outstanding) / principal) * 100)) : 0;

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 text-primary">
            <div className="flex items-center gap-3">
                <Link href="/customer/loans" className="p-2 rounded-lg border border-primary/20 bg-surface hover:bg-primary/5">
                    <FiArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold font-mono">{loan.loanId} • {loan.loanType}</h1>
                    <p className="text-xs text-primary/65">Status: {loan.status} • Account: {loan.accountNumber}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
                    <p className="text-xs text-primary/60">Principal Amount</p>
                    <p className="mt-1 text-lg font-bold">{formatBDT(principal)}</p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
                    <p className="text-xs text-primary/60">Outstanding Principal</p>
                    <p className="mt-1 text-lg font-bold text-amber-600">{formatBDT(outstanding)}</p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
                    <p className="text-xs text-primary/60">Monthly EMI</p>
                    <p className="mt-1 text-lg font-bold text-accent">{formatBDT(loan.monthlyInstallment || 0)}</p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
                    <p className="text-xs text-primary/60">Interest & Tenor</p>
                    <p className="mt-1 text-lg font-bold">{loan.interestRate}% / {loan.durationMonths}m</p>
                </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                    <span>Principal Repayment Progress</span>
                    <span className="text-accent">{repaidPct}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-primary/10 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${repaidPct}%` }} />
                </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-4">
                <h2 className="text-base font-bold">Repayment Schedule</h2>
                {schedules.length === 0 ? (
                    <p className="py-6 text-center text-xs text-primary/60">
                        Repayment schedule will be generated upon loan disbursement.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-primary/10 text-primary/60 uppercase">
                                    <th className="py-2.5 px-3">#</th>
                                    <th className="py-2.5 px-3">Due Date</th>
                                    <th className="py-2.5 px-3">Principal</th>
                                    <th className="py-2.5 px-3">Interest</th>
                                    <th className="py-2.5 px-3">Total Due</th>
                                    <th className="py-2.5 px-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/10">
                                {schedules.map((s) => (
                                    <tr key={s._id || s.installmentNumber}>
                                        <td className="py-2.5 px-3 font-bold">{s.installmentNumber}</td>
                                        <td className="py-2.5 px-3">{s.dueDate ? new Date(s.dueDate).toLocaleDateString() : '—'}</td>
                                        <td className="py-2.5 px-3">{formatBDT(s.principalDue)}</td>
                                        <td className="py-2.5 px-3">{formatBDT(s.interestDue)}</td>
                                        <td className="py-2.5 px-3 font-bold">{formatBDT(s.totalDue)}</td>
                                        <td className="py-2.5 px-3">
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                s.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' :
                                                s.status === 'Overdue' ? 'bg-rose-500/10 text-rose-600' :
                                                'bg-amber-500/10 text-amber-600'
                                            }`}>
                                                {s.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CustomerLoanDetailPage({ params }) {
    return (
        <Suspense fallback={<div className="p-8 text-center text-sm text-primary/60">Loading loan details...</div>}>
            <CustomerLoanDetailContent params={params} />
        </Suspense>
    );
}
