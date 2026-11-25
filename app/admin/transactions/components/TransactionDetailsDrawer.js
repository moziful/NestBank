'use client';

import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import TransactionStatusBadge from './TransactionStatusBadge';
import RiskStatusBadge from './RiskStatusBadge';

export default function TransactionDetailsDrawer({
    transaction,
    onClose,
    onFlagUpdated,
    onNoteAdded
}) {
    const [actionTab, setActionTab] = useState('INFO'); // INFO, LEDGER, INVESTIGATION
    const [flagReason, setFlagReason] = useState('');
    const [clearanceNote, setClearanceNote] = useState('');
    const [newNote, setNewNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    if (!transaction) return null;

    const handleFlagTransaction = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setSubmitting(true);
        try {
            const res = await fetch(`/api/admin/transactions/${transaction.transactionId}/flag`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: flagReason })
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMsg(data.message);
                setFlagReason('');
                if (onFlagUpdated) onFlagUpdated();
            } else {
                setErrorMsg(data.message || 'Failed to flag transaction.');
            }
        } catch (err) {
            setErrorMsg('Network error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClearFlag = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setSubmitting(true);
        try {
            const res = await fetch(`/api/admin/transactions/${transaction.transactionId}/clear-flag`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resolutionNote: clearanceNote })
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMsg(data.message);
                setClearanceNote('');
                if (onFlagUpdated) onFlagUpdated();
            } else {
                setErrorMsg(data.message || 'Failed to clear flag.');
            }
        } catch (err) {
            setErrorMsg('Network error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setSubmitting(true);
        try {
            const res = await fetch(`/api/admin/transactions/${transaction.transactionId}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note: newNote })
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMsg('Investigation note added.');
                setNewNote('');
                if (onNoteAdded) onNoteAdded();
            } else {
                setErrorMsg(data.message || 'Failed to append note.');
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
                {/* Drawer Header */}
                <div className="p-5 border-b border-primary/10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-primary">Transaction Details</h3>
                            <TransactionStatusBadge status={transaction.status} />
                            <RiskStatusBadge riskStatus={transaction.riskStatus} />
                        </div>
                        <p className="text-xs font-mono opacity-70 mt-0.5">{transaction.transactionId}</p>
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
                        <p className="text-xs uppercase font-medium opacity-70">Transaction Amount</p>
                        <p className="text-2xl font-black text-accent mt-1">
                            ৳{(transaction.amount || 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs uppercase font-medium opacity-70">Service Fee</p>
                        <p className="text-sm font-semibold opacity-80 mt-1">
                            ৳{(transaction.fee || 0).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Drawer Nav Tabs */}
                <div className="flex border-b border-primary/10 px-5 text-xs font-semibold bg-primary/5">
                    <button
                        type="button"
                        onClick={() => setActionTab('INFO')}
                        className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
                            actionTab === 'INFO'
                                ? 'border-accent text-accent'
                                : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        type="button"
                        onClick={() => setActionTab('LEDGER')}
                        className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
                            actionTab === 'LEDGER'
                                ? 'border-accent text-accent'
                                : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                    >
                        Ledger & Routing
                    </button>
                    <button
                        type="button"
                        onClick={() => setActionTab('INVESTIGATION')}
                        className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
                            actionTab === 'INVESTIGATION'
                                ? 'border-accent text-accent'
                                : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                    >
                        Risk & Investigation ({transaction.riskFlags?.length || 0})
                    </button>
                </div>

                {/* Notifications in Drawer */}
                {successMsg && (
                    <div className="mx-5 mt-4 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs">
                        {successMsg}
                    </div>
                )}
                {errorMsg && (
                    <div className="mx-5 mt-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs">
                        {errorMsg}
                    </div>
                )}

                {/* Drawer Content Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
                    {actionTab === 'INFO' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 bg-primary/5 p-4 rounded-xl border border-primary/20">
                                <div>
                                    <span className="opacity-60 block">Type</span>
                                    <span className="font-semibold text-primary">{transaction.type}</span>
                                </div>
                                <div>
                                    <span className="opacity-60 block">Initiated By</span>
                                    <span className="font-semibold text-primary">{transaction.initiatedByType || 'Customer'}</span>
                                </div>
                                <div>
                                    <span className="opacity-60 block">Date & Time</span>
                                    <span className="font-semibold text-primary">
                                        {transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : '—'}
                                    </span>
                                </div>
                                <div>
                                    <span className="opacity-60 block">Reference Code</span>
                                    <span className="font-mono text-primary font-semibold">{transaction.reference || 'N/A'}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="opacity-60 block">Description</span>
                                    <span className="text-primary">{transaction.description || 'No memo provided.'}</span>
                                </div>
                            </div>

                            {/* Customer Profile Linkage */}
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                                <h5 className="font-bold mb-3 uppercase tracking-wider text-[11px] opacity-70">Customer & Account Information</h5>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <span className="opacity-60 block">Customer</span>
                                        <span className="font-semibold text-primary">{transaction.customerName || 'N/A'}</span>
                                        <span className="opacity-60 text-[10px] block">{transaction.customerId}</span>
                                    </div>
                                    <div>
                                        <span className="opacity-60 block">Account Number</span>
                                        <span className="font-mono font-semibold text-primary">{transaction.accountNumber || transaction.sourceAccountNumber || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Lifecycle Timeline */}
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                                <h5 className="font-bold mb-3 uppercase tracking-wider text-[11px] opacity-70">Processing Timeline</h5>
                                <ol className="relative border-l border-primary/20 ml-2 space-y-4">
                                    <li className="ml-4">
                                        <div className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-emerald-500"></div>
                                        <p className="font-semibold text-primary">Transaction Initiated</p>
                                        <p className="opacity-60 text-[11px]">
                                            {transaction.createdAt ? new Date(transaction.createdAt).toLocaleTimeString() : '—'}
                                        </p>
                                    </li>
                                    {transaction.status === 'Successful' && (
                                        <li className="ml-4">
                                            <div className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-emerald-500"></div>
                                            <p className="font-semibold text-primary">Ledger Settled & Completed</p>
                                            <p className="opacity-60 text-[11px]">
                                                {transaction.completedAt ? new Date(transaction.completedAt).toLocaleTimeString() : 'Immediate'}
                                            </p>
                                        </li>
                                    )}
                                    {transaction.status === 'Failed' && (
                                        <li className="ml-4">
                                            <div className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-rose-500"></div>
                                            <p className="font-semibold text-rose-600 dark:text-rose-400">Transaction Failed</p>
                                            <p className="opacity-60 text-[11px]">{transaction.failureReason || 'Declined'}</p>
                                        </li>
                                    )}
                                </ol>
                            </div>
                        </div>
                    )}

                    {actionTab === 'LEDGER' && (
                        <div className="space-y-4">
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                                <h5 className="font-bold mb-2 uppercase tracking-wider text-[11px] opacity-70">Double-Entry Ledger Records</h5>
                                <p className="opacity-70 text-xs mb-3">
                                    Balanced financial ledger postings. Completed transactions are immutable.
                                </p>
                                <div className="space-y-2">
                                    <div className="p-3 rounded-lg bg-surface border border-primary/20 flex justify-between items-center">
                                        <div>
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 mr-2">DEBIT</span>
                                            <span className="font-mono text-primary font-semibold">{transaction.sourceAccountNumber || transaction.accountNumber || 'Primary'}</span>
                                        </div>
                                        <span className="font-bold text-primary">৳{(transaction.amount || 0).toLocaleString()}</span>
                                    </div>

                                    {transaction.type === 'Transfer' && transaction.destinationAccountNumber && (
                                        <div className="p-3 rounded-lg bg-surface border border-primary/20 flex justify-between items-center">
                                            <div>
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 mr-2">CREDIT</span>
                                                <span className="font-mono text-primary font-semibold">{transaction.destinationAccountNumber}</span>
                                            </div>
                                            <span className="font-bold text-primary">৳{(transaction.amount || 0).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {actionTab === 'INVESTIGATION' && (
                        <div className="space-y-5">
                            {/* Flags summary */}
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                                <h5 className="font-bold mb-2 uppercase tracking-wider text-[11px] opacity-70">Risk Signals & Flags</h5>
                                {(!transaction.riskFlags || transaction.riskFlags.length === 0) ? (
                                    <p className="opacity-60 italic py-2">No active risk flags detected for this transaction.</p>
                                ) : (
                                    <div className="space-y-2.5">
                                        {transaction.riskFlags.map((flag, idx) => (
                                            <div key={idx} className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-xs">
                                                <div className="flex justify-between font-semibold text-red-700 dark:text-red-400">
                                                    <span>Rule: {flag.rule}</span>
                                                    <span>{flag.flaggedBy}</span>
                                                </div>
                                                <p className="opacity-90 mt-1">{flag.reason}</p>
                                                <p className="text-[10px] opacity-60 mt-1">
                                                    Flagged: {flag.flaggedAt ? new Date(flag.flaggedAt).toLocaleString() : '—'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Flag or Clear Action Form */}
                            {transaction.riskStatus === 'FLAGGED' || transaction.riskStatus === 'UNDER_REVIEW' ? (
                                <form onSubmit={handleClearFlag} className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3">
                                    <h5 className="font-bold uppercase tracking-wider text-[11px] opacity-70">Clear Suspicious Flag</h5>
                                    <p className="opacity-70 text-xs">
                                        Enter mandatory clearance verification findings to restore this transaction to cleared status.
                                    </p>
                                    <textarea
                                        rows={3}
                                        required
                                        placeholder="Explain clearance rationale (e.g. Verified photo ID and verified via customer callback)..."
                                        value={clearanceNote}
                                        onChange={(e) => setClearanceNote(e.target.value)}
                                        className="w-full p-2.5 rounded-lg bg-surface border border-primary/20 text-primary text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                                    />
                                    <button
                                        type="submit"
                                        disabled={submitting || clearanceNote.trim().length < 5}
                                        className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        {submitting ? 'Processing...' : 'Clear Risk Flag'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleFlagTransaction} className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3">
                                    <h5 className="font-bold uppercase tracking-wider text-[11px] opacity-70">Flag for Investigation</h5>
                                    <p className="opacity-70 text-xs">
                                        Mark this transaction as suspicious to trigger internal compliance review.
                                    </p>
                                    <textarea
                                        rows={3}
                                        required
                                        placeholder="Reason for flagging (e.g. Unexpected high-frequency transfer)..."
                                        value={flagReason}
                                        onChange={(e) => setFlagReason(e.target.value)}
                                        className="w-full p-2.5 rounded-lg bg-surface border border-primary/20 text-primary text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                                    />
                                    <button
                                        type="submit"
                                        disabled={submitting || flagReason.trim().length < 5}
                                        className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        {submitting ? 'Processing...' : 'Flag as Suspicious'}
                                    </button>
                                </form>
                            )}

                            {/* Investigation Notes Feed & Add */}
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3">
                                <h5 className="font-bold uppercase tracking-wider text-[11px] opacity-70">Investigation Audit Notes</h5>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {(!transaction.investigationNotes || transaction.investigationNotes.length === 0) ? (
                                        <p className="opacity-50 italic">No notes logged yet.</p>
                                    ) : (
                                        transaction.investigationNotes.map((n, idx) => (
                                            <div key={idx} className="p-2.5 rounded-lg bg-surface border border-primary/20">
                                                <div className="flex justify-between text-[10px] opacity-60">
                                                    <span>{n.author} ({n.role})</span>
                                                    <span>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</span>
                                                </div>
                                                <p className="text-primary mt-1">{n.note}</p>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <form onSubmit={handleAddNote} className="pt-2 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add internal note..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        className="flex-1 px-3 py-1.5 rounded-lg bg-surface border border-primary/20 text-primary text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                                    />
                                    <button
                                        type="submit"
                                        disabled={submitting || newNote.trim().length < 3}
                                        className="px-3.5 py-1.5 rounded-lg bg-accent text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                                    >
                                        Add
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
