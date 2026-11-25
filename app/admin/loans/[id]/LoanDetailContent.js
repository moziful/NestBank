'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import { formatBDT } from '../../overview/DashboardCharts';

export default function LoanDetailContent({ params }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const [loan, setLoan] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [repayments, setRepayments] = useState([]);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('SCHEDULE'); // SCHEDULE, REPAYMENTS, ACTIVITY

    const fetchLoanDetail = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/loans/${id}`);
            const data = await res.json();
            if (data.success) {
                setLoan(data.loan);
                setSchedules(data.schedules || []);
                setRepayments(data.repayments || []);
                setActivity(data.activity || []);
            }
        } catch (err) {
            console.error('Failed to load loan detail:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoanDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="h-10 w-48 bg-primary/10 rounded animate-pulse" />
                <div className="h-64 bg-primary/5 rounded-xl border border-primary/20 animate-pulse" />
            </div>
        );
    }

    if (!loan) {
        return (
            <div className="p-6 max-w-7xl mx-auto text-center space-y-4">
                <h3 className="text-base font-bold">Loan Record Not Found</h3>
                <Link href="/admin/loans" className="text-xs text-accent font-semibold">
                    ← Back to Loans Directory
                </Link>
            </div>
        );
    }

    const principal = loan.approvedAmount || loan.amount || loan.requestedAmount || 0;
    const repaid = loan.totalPrincipalRepaid || 0;
    const outstanding = loan.outstandingPrincipal !== undefined ? loan.outstandingPrincipal : (principal - repaid);
    const progressPct = principal > 0 ? Math.min(100, ((repaid / principal) * 100).toFixed(1)) : 0;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 text-xs">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-primary/10">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/loans"
                        className="p-2 rounded-lg border border-primary/20 hover:bg-primary/5 text-primary transition-colors cursor-pointer"
                    >
                        <FiArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black">{loan.loanId || loan.applicationId}</h1>
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-accent/15 text-accent">
                                {loan.loanType || 'Personal Loan'}
                            </span>
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                                {loan.status || 'Active'}
                            </span>
                        </div>
                        <p className="opacity-60 text-[11px] mt-0.5">
                            Customer: <span className="font-semibold">{loan.customerName}</span> · Account: <span className="font-mono">{loan.accountNumber || 'Primary'}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-primary/20 bg-surface shadow-sm">
                    <span className="text-[11px] opacity-70 uppercase font-semibold">Sanctioned Principal</span>
                    <h3 className="text-xl font-bold text-accent mt-1">৳{principal.toLocaleString()}</h3>
                    <p className="text-[10px] opacity-60 mt-1">Contractual loan value</p>
                </div>
                <div className="p-4 rounded-xl border border-primary/20 bg-surface shadow-sm">
                    <span className="text-[11px] opacity-70 uppercase font-semibold">Principal Repaid</span>
                    <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">৳{repaid.toLocaleString()}</h3>
                    <p className="text-[10px] opacity-60 mt-1">{progressPct}% of principal settled</p>
                </div>
                <div className="p-4 rounded-xl border border-primary/20 bg-surface shadow-sm">
                    <span className="text-[11px] opacity-70 uppercase font-semibold">Outstanding Principal</span>
                    <h3 className="text-xl font-bold text-primary mt-1">৳{outstanding.toLocaleString()}</h3>
                    <p className="text-[10px] opacity-60 mt-1">Remaining principal balance</p>
                </div>
                <div className="p-4 rounded-xl border border-primary/20 bg-surface shadow-sm">
                    <span className="text-[11px] opacity-70 uppercase font-semibold">Interest Rate & Term</span>
                    <h3 className="text-xl font-bold text-sky-600 mt-1">{loan.annualInterestRate || loan.interestRate || 10}% / {loan.durationMonths || 12}M</h3>
                    <p className="text-[10px] opacity-60 mt-1">{loan.interestMethod || 'Reducing Balance'}</p>
                </div>
            </div>

            {/* Repayment Progress Bar */}
            <div className="p-4 rounded-xl border border-primary/20 bg-surface shadow-sm space-y-2">
                <div className="flex justify-between font-semibold">
                    <span>Principal Settlement Progress</span>
                    <span className="text-accent">{progressPct}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-primary/10 overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progressPct}%` }}></div>
                </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex border-b border-primary/10 text-xs font-semibold gap-2">
                <button
                    type="button"
                    onClick={() => setActiveTab('SCHEDULE')}
                    className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
                        activeTab === 'SCHEDULE' ? 'border-accent text-accent' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                >
                    Repayment Schedule ({schedules.length})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('REPAYMENTS')}
                    className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
                        activeTab === 'REPAYMENTS' ? 'border-accent text-accent' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                >
                    Repayment History ({repayments.length})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('ACTIVITY')}
                    className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
                        activeTab === 'ACTIVITY' ? 'border-accent text-accent' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                >
                    Lifecycle Audit Trail ({activity.length})
                </button>
            </div>

            {/* Tab Contents */}
            <div>
                {activeTab === 'SCHEDULE' && (
                    <div className="rounded-xl border border-primary/20 bg-surface shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-primary/5 border-b border-primary/10 opacity-70 uppercase tracking-wider font-semibold">
                                        <th className="py-3 px-3">Inst. #</th>
                                        <th className="py-3 px-3">Due Date</th>
                                        <th className="py-3 px-3">Principal Due</th>
                                        <th className="py-3 px-3">Interest Due</th>
                                        <th className="py-3 px-3">Total Installment</th>
                                        <th className="py-3 px-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/10">
                                    {schedules.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-8 text-center opacity-50">
                                                No generated schedule found. Installments are created upon loan disbursement.
                                            </td>
                                        </tr>
                                    ) : (
                                        schedules.map((sch) => (
                                            <tr key={sch._id || sch.installmentNumber} className="hover:bg-primary/5 transition-colors">
                                                <td className="py-3 px-3 font-semibold">#{sch.installmentNumber}</td>
                                                <td className="py-3 px-3 opacity-80 whitespace-nowrap">
                                                    {sch.dueDate ? new Date(sch.dueDate).toLocaleDateString() : '—'}
                                                </td>
                                                <td className="py-3 px-3 font-semibold">৳{(sch.principalDue || 0).toLocaleString()}</td>
                                                <td className="py-3 px-3 opacity-80">৳{(sch.interestDue || 0).toLocaleString()}</td>
                                                <td className="py-3 px-3 font-bold text-accent">৳{(sch.totalDue || 0).toLocaleString()}</td>
                                                <td className="py-3 px-3 text-right">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        sch.status === 'PAID'
                                                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                                            : 'bg-primary/10 opacity-70'
                                                    }`}>
                                                        {sch.status || 'UPCOMING'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'REPAYMENTS' && (
                    <div className="rounded-xl border border-primary/20 bg-surface shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-primary/5 border-b border-primary/10 opacity-70 uppercase tracking-wider font-semibold">
                                        <th className="py-3 px-3">Repayment ID</th>
                                        <th className="py-3 px-3">Payment Date</th>
                                        <th className="py-3 px-3">Principal Portion</th>
                                        <th className="py-3 px-3">Interest Portion</th>
                                        <th className="py-3 px-3">Total Amount</th>
                                        <th className="py-3 px-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/10">
                                    {repayments.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-8 text-center opacity-50">
                                                No repayment installments recorded yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        repayments.map((r) => (
                                            <tr key={r._id || r.repaymentId} className="hover:bg-primary/5 transition-colors">
                                                <td className="py-3 px-3 font-mono font-medium">{r.repaymentId}</td>
                                                <td className="py-3 px-3 opacity-80">
                                                    {r.paymentDate ? new Date(r.paymentDate).toLocaleString() : '—'}
                                                </td>
                                                <td className="py-3 px-3 font-semibold">৳{(r.principalAmount || 0).toLocaleString()}</td>
                                                <td className="py-3 px-3 opacity-80">৳{(r.interestAmount || 0).toLocaleString()}</td>
                                                <td className="py-3 px-3 font-bold text-accent">৳{(r.totalAmount || 0).toLocaleString()}</td>
                                                <td className="py-3 px-3 text-right">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                                                        {r.status || 'COMPLETED'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'ACTIVITY' && (
                    <div className="p-4 rounded-xl border border-primary/20 bg-surface shadow-sm space-y-3">
                        <h4 className="font-bold opacity-70 uppercase tracking-wider text-[11px]">Audit History for Loan</h4>
                        <div className="space-y-2">
                            {activity.length === 0 ? (
                                <p className="opacity-50 italic">No specific audit logs mapped to this loan record.</p>
                            ) : (
                                activity.map((act, i) => (
                                    <div key={i} className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold text-accent">{act.action}</div>
                                            <p className="opacity-80 mt-0.5">{act.description}</p>
                                        </div>
                                        <div className="text-right text-[10px] opacity-60">
                                            <div>{act.actorName} ({act.actorRole})</div>
                                            <div>{act.createdAt ? new Date(act.createdAt).toLocaleString() : ''}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
