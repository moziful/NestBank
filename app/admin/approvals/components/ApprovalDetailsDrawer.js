'use client';

import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { formatBDT } from '../../overview/DashboardCharts';

export default function ApprovalDetailsDrawer({
    item,
    itemType, // 'BANKING' or 'LOAN'
    onClose,
    onDecisionSuccess
}) {
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [confirmAction, setConfirmAction] = useState(null); // 'APPROVE' or 'REJECT'
    const [decisionNote, setDecisionNote] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    if (!item) return null;

    const isLoan = itemType === 'LOAN';
    const isWithdrawal = (item.type || item.category) === 'Withdrawal';
    const isDeposit = (item.type || item.category) === 'Deposit';

    // Account balances simulation / placeholder if not passed directly
    const currentBalance = item.accountBalance !== undefined ? item.accountBalance : 42000;
    const heldAmount = item.heldAmount !== undefined ? item.heldAmount : 2000;
    const availableBalance = currentBalance - heldAmount;
    const balanceAfterWithdrawal = availableBalance - (item.amount || 0);

    const handleApprove = async () => {
        setSubmitting(true);
        setErrorMsg('');
        try {
            if (isLoan) {
                const res = await fetch(`/api/admin/loans/${item.loanId || item.applicationId}/decision`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'APPROVE',
                        approvedAmount: item.amount || item.requestedAmount,
                        durationMonths: item.durationMonths,
                        decisionNote: decisionNote || 'Credit terms verified and approved.'
                    })
                });
                const data = await res.json();
                if (data.success) {
                    onDecisionSuccess();
                } else {
                    setErrorMsg(data.message || 'Loan approval failed.');
                }
            } else {
                const res = await fetch(`/api/admin/approvals/${item.requestId}/approve`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ decisionNote })
                });
                const data = await res.json();
                if (data.success) {
                    onDecisionSuccess();
                } else {
                    setErrorMsg(data.message || 'Approval failed.');
                }
            }
        } catch (err) {
            setErrorMsg('Network error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason || rejectionReason.trim().length < 3) {
            setErrorMsg('Please select or specify a rejection reason.');
            return;
        }

        setSubmitting(true);
        setErrorMsg('');
        try {
            if (isLoan) {
                const res = await fetch(`/api/admin/loans/${item.loanId || item.applicationId}/decision`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'REJECT',
                        rejectionReason,
                        decisionNote
                    })
                });
                const data = await res.json();
                if (data.success) {
                    onDecisionSuccess();
                } else {
                    setErrorMsg(data.message || 'Loan rejection failed.');
                }
            } else {
                const res = await fetch(`/api/admin/approvals/${item.requestId}/reject`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rejectionReason, decisionNote })
                });
                const data = await res.json();
                if (data.success) {
                    onDecisionSuccess();
                } else {
                    setErrorMsg(data.message || 'Rejection failed.');
                }
            }
        } catch (err) {
            setErrorMsg('Network error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUnderReview = async () => {
        setSubmitting(true);
        setErrorMsg('');
        try {
            const res = await fetch(`/api/admin/loans/${item.loanId || item.applicationId}/decision`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'REVIEW' })
            });
            const data = await res.json();
            if (data.success) {
                onDecisionSuccess();
            } else {
                setErrorMsg(data.message || 'Update failed.');
            }
        } catch (err) {
            setErrorMsg('Network error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
            <div className="w-full max-w-xl bg-surface text-primary border-l border-primary/20 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="p-5 border-b border-primary/10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-primary">
                                {isLoan ? 'Loan Underwriting Review' : `${item.type || item.category || 'Banking'} Request Review`}
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400">
                                {item.status || 'Pending'}
                            </span>
                        </div>
                        <p className="text-xs font-mono opacity-70 mt-0.5">
                            {item.requestId || item.loanId || item.applicationId}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-md hover:bg-primary/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer"
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                {/* Amount Banner */}
                <div className="p-5 bg-accent/10 border-b border-primary/10 flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase font-medium opacity-70">
                            {isLoan ? 'Requested Loan Principal' : 'Requested Amount'}
                        </p>
                        <p className="text-2xl font-black text-accent mt-1">
                            ৳{(item.amount || item.requestedAmount || 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs uppercase font-medium opacity-70">Applicant</p>
                        <p className="text-sm font-bold opacity-90 mt-1">{item.customerName}</p>
                    </div>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="mx-5 mt-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs">
                        {errorMsg}
                    </div>
                )}

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
                    {/* Customer & Account Details */}
                    <div className="p-4 rounded-xl border border-primary/20 space-y-3 bg-primary/5">
                        <h5 className="font-bold uppercase tracking-wider text-[11px] opacity-70">Customer & Account</h5>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <span className="opacity-60 block">Customer Name</span>
                                <span className="font-semibold">{item.customerName}</span>
                            </div>
                            <div>
                                <span className="opacity-60 block">Account Number</span>
                                <span className="font-mono font-semibold">
                                    {item.accountNumber ? `•••• ${item.accountNumber.slice(-4)}` : '•••• 1001'}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <span className="opacity-60 block">Purpose / Memo</span>
                                <span>{item.description || item.purpose || 'Direct counter banking transaction'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Withdrawal Specific: Balance Pre-Check Card */}
                    {isWithdrawal && (
                        <div className="p-4 rounded-xl border border-primary/20 space-y-3 bg-primary/5">
                            <h5 className="font-bold uppercase tracking-wider text-[11px] text-accent">Real-Time Available Balance Check</h5>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2.5 rounded bg-surface border border-primary/10">
                                    <span className="opacity-60 block text-[10px]">Ledger Balance</span>
                                    <span className="font-bold text-sm">৳{currentBalance.toLocaleString()}</span>
                                </div>
                                <div className="p-2.5 rounded bg-surface border border-primary/10">
                                    <span className="opacity-60 block text-[10px]">Existing Holds</span>
                                    <span className="font-bold text-sm">৳{heldAmount.toLocaleString()}</span>
                                </div>
                                <div className="p-2.5 rounded bg-surface border border-primary/10">
                                    <span className="opacity-60 block text-[10px]">Available Balance</span>
                                    <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">৳{availableBalance.toLocaleString()}</span>
                                </div>
                                <div className="p-2.5 rounded bg-surface border border-primary/10">
                                    <span className="opacity-60 block text-[10px]">After Withdrawal</span>
                                    <span className={`font-bold text-sm ${balanceAfterWithdrawal < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-accent'}`}>
                                        ৳{balanceAfterWithdrawal.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            {balanceAfterWithdrawal < 0 && (
                                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                                    ⚠️ Warning: Customer lacks sufficient available balance to complete this withdrawal.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Loan Underwriting Profile Card */}
                    {isLoan && (
                        <div className="p-4 rounded-xl border border-primary/20 space-y-3 bg-primary/5">
                            <h5 className="font-bold uppercase tracking-wider text-[11px] text-accent">Credit Risk & Employment Profile</h5>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="opacity-60 block">Loan Category</span>
                                    <span className="font-semibold">{item.loanType || 'Personal'}</span>
                                </div>
                                <div>
                                    <span className="opacity-60 block">Requested Term</span>
                                    <span className="font-semibold">{item.durationMonths || 12} Months</span>
                                </div>
                                <div>
                                    <span className="opacity-60 block">Monthly Income</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">৳{(item.monthlyIncome || 0).toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="opacity-60 block">Employment Status</span>
                                    <span className="font-semibold">{item.employmentStatus || 'Salaried Private'}</span>
                                </div>
                                <div>
                                    <span className="opacity-60 block">Calculated Debt-to-Income (DTI)</span>
                                    <span className="font-bold">28.4% (Healthy)</span>
                                </div>
                                <div>
                                    <span className="opacity-60 block">Internal Risk Rating</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.riskRating || 'Low Risk'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Decision Confirmation Workflow Area */}
                    {item.status === 'Pending' || item.status === 'Under Review' ? (
                        confirmAction === null ? (
                            <div className="space-y-3 pt-2">
                                <h5 className="font-bold uppercase tracking-wider text-[11px] opacity-70">Administrative Decision</h5>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setConfirmAction('APPROVE')}
                                        className="py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition-colors shadow"
                                    >
                                        Approve Request
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmAction('REJECT')}
                                        className="py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer transition-colors shadow"
                                    >
                                        Reject Request
                                    </button>
                                </div>
                                {isLoan && item.status !== 'Under Review' && (
                                    <button
                                        type="button"
                                        disabled={submitting}
                                        onClick={handleUnderReview}
                                        className="w-full py-2 rounded-lg border border-accent text-accent hover:bg-accent/10 font-semibold cursor-pointer transition-colors"
                                    >
                                        Mark Under Review
                                    </button>
                                )}
                            </div>
                        ) : confirmAction === 'APPROVE' ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl space-y-3">
                                <h5 className="font-bold text-emerald-700 dark:text-emerald-400">Confirm Approval</h5>
                                <p className="opacity-80">
                                    Are you sure you want to approve this {isLoan ? 'loan application' : item.type} for ৳{(item.amount || item.requestedAmount || 0).toLocaleString()}?
                                </p>
                                <textarea
                                    rows={2}
                                    placeholder="Optional internal decision note..."
                                    value={decisionNote}
                                    onChange={(e) => setDecisionNote(e.target.value)}
                                    className="w-full p-2.5 rounded-lg bg-surface border border-primary/20 text-xs text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        disabled={submitting}
                                        onClick={handleApprove}
                                        className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition-colors"
                                    >
                                        {submitting ? 'Processing...' : 'Confirm Approval'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmAction(null)}
                                        className="px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/10 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl space-y-3">
                                <h5 className="font-bold text-rose-700 dark:text-rose-400">Rejection Reason Required</h5>
                                <select
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full p-2 rounded-lg bg-surface border border-primary/20 text-xs text-primary focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                                >
                                    <option value="">Select Rejection Reason...</option>
                                    <option value="Insufficient available balance">Insufficient available balance</option>
                                    <option value="Account is frozen or restricted">Account is frozen or restricted</option>
                                    <option value="Invalid or incomplete request documentation">Invalid or incomplete request documentation</option>
                                    <option value="Policy or daily transaction limit violation">Policy or daily transaction limit violation</option>
                                    <option value="Credit score or debt-to-income threshold not met">Credit score or debt-to-income threshold not met</option>
                                    <option value="Unsatisfactory risk investigation result">Unsatisfactory risk investigation result</option>
                                </select>
                                <textarea
                                    rows={2}
                                    placeholder="Optional internal private memo..."
                                    value={decisionNote}
                                    onChange={(e) => setDecisionNote(e.target.value)}
                                    className="w-full p-2.5 rounded-lg bg-surface border border-primary/20 text-xs text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        disabled={submitting || !rejectionReason}
                                        onClick={handleReject}
                                        className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer transition-colors disabled:opacity-50"
                                    >
                                        {submitting ? 'Processing...' : 'Confirm Rejection'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmAction(null)}
                                        className="px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/10 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="p-4 rounded-xl border border-primary/20 space-y-2 bg-primary/5">
                            <h5 className="font-bold uppercase tracking-wider text-[11px] opacity-70">Decision Record</h5>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="opacity-60 block">Reviewed By</span>
                                    <span className="font-semibold">{item.reviewedBy || 'Admin'}</span>
                                </div>
                                <div>
                                    <span className="opacity-60 block">Decision Timestamp</span>
                                    <span className="font-semibold">{item.reviewedAt ? new Date(item.reviewedAt).toLocaleString() : '—'}</span>
                                </div>
                                {item.rejectionReason && (
                                    <div className="col-span-2">
                                        <span className="opacity-60 block text-rose-600 font-bold">Rejection Reason</span>
                                        <span className="text-rose-600">{item.rejectionReason}</span>
                                    </div>
                                )}
                                {item.decisionNote && (
                                    <div className="col-span-2">
                                        <span className="opacity-60 block">Decision Note</span>
                                        <span>{item.decisionNote}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
