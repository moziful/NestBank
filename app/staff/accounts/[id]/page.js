'use client';

import { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    FiArrowLeft,
    FiLock,
    FiUnlock,
    FiSliders,
    FiUser,
    FiDollarSign,
    FiCreditCard,
    FiActivity,
    FiClock,
    FiCheckCircle,
} from 'react-icons/fi';
import AccountStatusBadge from '@/app/admin/bank-accounts/components/AccountStatusBadge';
import AccountTypeBadge from '@/app/admin/bank-accounts/components/AccountTypeBadge';
import FreezeAccountDialog from '@/app/admin/bank-accounts/components/FreezeAccountDialog';
import ManageLimitsDialog from '@/app/admin/bank-accounts/components/ManageLimitsDialog';
import { formatBDT } from '@/lib/currency';

function AccountDetailsContent({ params }) {
    const resolvedParams = use(params);
    const accountId = resolvedParams.id;
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('overview'); // overview, transactions, limits, customer, activity
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
    const [isLimitsModalOpen, setIsLimitsModalOpen] = useState(false);
    const [actionPending, setActionPending] = useState(false);
    const [message, setMessage] = useState('');

    const fetchAccount = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/accounts/${accountId}`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error('Fetch account detail error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAccount();
    }, [accountId]);

    const account = data?.account;
    const customer = data?.customer;
    const transactions = data?.transactions || [];
    const activities = data?.activities || [];
    const limits = account?.limits || {};

    const handleConfirmFreeze = async ({ id, reason }) => {
        setActionPending(true);
        try {
            const res = await fetch(`/api/admin/accounts/${id}/freeze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });
            const json = await res.json();
            if (res.ok) {
                setMessage(json.message);
                setIsFreezeModalOpen(false);
                fetchAccount();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionPending(false);
        }
    };

    const handleUnfreeze = async () => {
        setActionPending(true);
        try {
            const res = await fetch(`/api/admin/accounts/${account._id || account.accountNumber}/unfreeze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ unfreezeReason: 'Admin verified and cleared' }),
            });
            const json = await res.json();
            if (res.ok) {
                setMessage(json.message);
                fetchAccount();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionPending(false);
        }
    };

    const handleSaveLimits = async ({ id, limits: newLimits }) => {
        setActionPending(true);
        try {
            const res = await fetch(`/api/admin/accounts/${id}/limits`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLimits),
            });
            const json = await res.json();
            if (res.ok) {
                setMessage(json.message);
                setIsLimitsModalOpen(false);
                fetchAccount();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionPending(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-xs opacity-60">Loading account details...</div>;
    }

    if (!account) {
        return (
            <div className="p-8 text-center text-xs opacity-60">
                Bank account not found.{' '}
                <Link href="/staff/accounts" className="text-accent underline font-semibold">
                    Return to Directory
                </Link>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-primary">
            {/* Top Navigation */}
            <div>
                <Link
                    href="/staff/accounts"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-70 hover:opacity-100 hover:text-accent transition-colors"
                >
                    <FiArrowLeft className="h-4 w-4" />
                    <span>Back to Account Directory</span>
                </Link>
            </div>

            {/* Notification message */}
            {message && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-700 flex items-center justify-between">
                    <span>{message}</span>
                    <button type="button" onClick={() => setMessage('')} className="font-bold">
                        ✕
                    </button>
                </div>
            )}

            {/* Header Profile Card */}
            <div className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-2xl font-bold tracking-wider text-accent">
                            •••• •••• {account.accountNumber?.slice(-4)}
                        </span>
                        <AccountStatusBadge status={account.status || 'Active'} />
                        <AccountTypeBadge type={account.accountType || 'Savings'} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs opacity-75">
                        <span>Account Holder: <strong className="text-primary">{account.customerName}</strong></span>
                        <span>•</span>
                        <span className="font-mono">{account.customerId}</span>
                        <span>•</span>
                        <span>Full Account: <code className="bg-white/40 px-1 py-0.5 rounded font-mono">{account.accountNumber}</code></span>
                        <span>•</span>
                        <span>Opened {new Date(account.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Status and Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsLimitsModalOpen(true)}
                        className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-white/20 px-3.5 py-2 text-xs font-semibold hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                        <FiSliders className="h-3.5 w-3.5 text-blue-600" />
                        <span>Manage Limits</span>
                    </button>

                    {account.status === 'Active' ? (
                        <button
                            type="button"
                            onClick={() => setIsFreezeModalOpen(true)}
                            disabled={actionPending}
                            className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-700 transition-colors shadow-sm cursor-pointer"
                        >
                            <FiLock className="h-3.5 w-3.5" />
                            <span>Freeze Account</span>
                        </button>
                    ) : account.status === 'Frozen' ? (
                        <button
                            type="button"
                            onClick={handleUnfreeze}
                            disabled={actionPending}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                        >
                            <FiUnlock className="h-3.5 w-3.5" />
                            <span>Unfreeze Account</span>
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Five Tab Navigation */}
            <div className="border-b border-primary/10 flex overflow-x-auto text-xs font-semibold">
                {[
                    { id: 'overview', label: 'Overview', icon: FiActivity },
                    { id: 'transactions', label: `Transactions (${transactions.length})`, icon: FiDollarSign },
                    { id: 'limits', label: 'Transaction Limits', icon: FiSliders },
                    { id: 'customer', label: 'Owner Profile', icon: FiUser },
                    { id: 'activity', label: 'Audit Trail', icon: FiClock },
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                                activeTab === tab.id
                                    ? 'border-accent text-accent font-bold'
                                    : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* TAB CONTENT */}

            {/* Tab A — Overview */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Financial Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
                            <span className="text-xs font-semibold uppercase opacity-70">Ledger Balance</span>
                            <div className="mt-2 text-2xl font-bold">
                                {formatBDT(account.ledgerBalance || account.balance || 0)}
                            </div>
                            <p className="mt-1 text-[11px] opacity-70">Total booked funds</p>
                        </div>
                        <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
                            <span className="text-xs font-semibold uppercase opacity-70">Available Balance</span>
                            <div className="mt-2 text-2xl font-bold text-accent">
                                {formatBDT(account.availableBalance || account.balance || 0)}
                            </div>
                            <p className="mt-1 text-[11px] opacity-70">Ledger minus reserved funds</p>
                        </div>
                        <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
                            <span className="text-xs font-semibold uppercase opacity-70">Held / Reserved</span>
                            <div className="mt-2 text-2xl font-bold text-amber-600">
                                {formatBDT(account.heldAmount || 0)}
                            </div>
                            <p className="mt-1 text-[11px] opacity-70">Pre-authorized & buffer holds</p>
                        </div>
                        <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
                            <span className="text-xs font-semibold uppercase opacity-70">Currency</span>
                            <div className="mt-2 text-2xl font-bold text-primary">
                                {account.currency || 'BDT'}
                            </div>
                            <p className="mt-1 text-[11px] opacity-70">Bangladeshi Taka (৳)</p>
                        </div>
                    </div>

                    {/* Metadata & Branch info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-3 text-xs">
                            <h3 className="font-bold text-sm border-b border-primary/10 pb-2">Account Configuration</h3>
                            <div className="flex justify-between py-1 border-b border-primary/5">
                                <span className="opacity-70">Account Type:</span>
                                <span className="font-semibold">{account.accountType}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-primary/5">
                                <span className="opacity-70">Operating Status:</span>
                                <span className="font-semibold">{account.status}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-primary/5">
                                <span className="opacity-70">Assigned Branch:</span>
                                <span className="font-medium">{account.branch || 'Principal Corporate Branch, Dhaka'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-primary/5">
                                <span className="opacity-70">Opening Date:</span>
                                <span className="font-medium">{new Date(account.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-3 text-xs">
                            <h3 className="font-bold text-sm border-b border-primary/10 pb-2">Operational Safeguards</h3>
                            <div className="flex justify-between py-1 border-b border-primary/5">
                                <span className="opacity-70">Direct Balance Editing:</span>
                                <span className="text-emerald-700 font-semibold">Strictly Prohibited (Ledger Protected)</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-primary/5">
                                <span className="opacity-70">Transaction Restrictions:</span>
                                <span className="font-medium">{account.status === 'Frozen' ? 'Outgoing Blocked' : 'Normal Operations'}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="opacity-70">Audit Tracking:</span>
                                <span className="font-medium text-emerald-600">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab B — Transactions */}
            {activeTab === 'transactions' && (
                <div className="rounded-xl border border-primary/20 bg-surface shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-primary/10">
                        <h3 className="font-bold text-sm">Account Settlements</h3>
                        <p className="text-xs opacity-70">Debits and credits specifically posted to this account number</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-primary/10 bg-primary/5 font-semibold opacity-70">
                                    <th className="py-2.5 px-4">Transaction ID</th>
                                    <th className="py-2.5 px-4">Type</th>
                                    <th className="py-2.5 px-4">Amount</th>
                                    <th className="py-2.5 px-4">Reference</th>
                                    <th className="py-2.5 px-4">Date</th>
                                    <th className="py-2.5 px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/10">
                                {transactions.length ? (
                                    transactions.map((tx) => (
                                        <tr key={tx._id || tx.transactionId} className="hover:bg-primary/5">
                                            <td className="py-3 px-4 font-mono font-medium">{tx.transactionId}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded font-medium text-[10px] ${
                                                    tx.type === 'Deposit' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-rose-500/10 text-rose-700'
                                                }`}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-bold">{formatBDT(tx.amount)}</td>
                                            <td className="py-3 px-4 opacity-75">{tx.reference || 'Regular transaction'}</td>
                                            <td className="py-3 px-4 opacity-70">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                            <td className="py-3 px-4 font-medium text-emerald-600">{tx.status}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-6 text-center opacity-60">
                                            No transactions posted to this account yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab C — Limits */}
            {activeTab === 'limits' && (
                <div className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                        <div>
                            <h3 className="font-bold text-sm">Account Transaction Limits</h3>
                            <p className="text-xs opacity-70">Custom account-level limits configured by bank administrators</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsLimitsModalOpen(true)}
                            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-secondary cursor-pointer"
                        >
                            <FiSliders className="h-3.5 w-3.5" />
                            <span>Modify Limits</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                        <div className="p-4 rounded-lg border border-primary/10 bg-primary/5 text-xs">
                            <span className="opacity-70">Max Single Transfer</span>
                            <p className="mt-1 text-lg font-bold text-accent">{formatBDT(limits.maxSingleTransfer || 50000)}</p>
                            <span className="text-[10px] opacity-60">Per individual transaction</span>
                        </div>
                        <div className="p-4 rounded-lg border border-primary/10 bg-primary/5 text-xs">
                            <span className="opacity-70">Daily Transfer Limit</span>
                            <p className="mt-1 text-lg font-bold text-primary">{formatBDT(limits.dailyTransferLimit || 100000)}</p>
                            <span className="text-[10px] opacity-60">24-hour total cap</span>
                        </div>
                        <div className="p-4 rounded-lg border border-primary/10 bg-primary/5 text-xs">
                            <span className="opacity-70">Daily Withdrawal Limit</span>
                            <p className="mt-1 text-lg font-bold text-primary">{formatBDT(limits.dailyWithdrawalLimit || 40000)}</p>
                            <span className="text-[10px] opacity-60">Cash withdrawal ceiling</span>
                        </div>
                        <div className="p-4 rounded-lg border border-primary/10 bg-primary/5 text-xs">
                            <span className="opacity-70">Minimum Balance</span>
                            <p className="mt-1 text-lg font-bold text-primary">{formatBDT(limits.minimumBalance || 500)}</p>
                            <span className="text-[10px] opacity-60">Non-withdrawable buffer</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab D — Customer Owner Profile */}
            {activeTab === 'customer' && (
                <div className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                        <div>
                            <h3 className="font-bold text-sm">Account Owner Identity</h3>
                            <p className="text-xs opacity-70">Registered customer holding ownership of this bank account</p>
                        </div>
                        {customer && (
                            <Link
                                href={`/admin/customers/${customer._id || customer.customerId}`}
                                className="text-xs font-semibold text-accent hover:underline"
                            >
                                Open Full Customer Profile →
                            </Link>
                        )}
                    </div>

                    {customer ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-2">
                                <div className="flex justify-between py-1 border-b border-primary/5">
                                    <span className="opacity-70">Customer Name:</span>
                                    <span className="font-semibold">{customer.name}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-primary/5">
                                    <span className="opacity-70">Customer ID:</span>
                                    <span className="font-mono font-medium text-accent">{customer.customerId}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-primary/5">
                                    <span className="opacity-70">Email:</span>
                                    <span className="font-medium">{customer.email}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between py-1 border-b border-primary/5">
                                    <span className="opacity-70">Phone:</span>
                                    <span className="font-medium">{customer.phone || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-primary/5">
                                    <span className="opacity-70">Address:</span>
                                    <span className="font-medium">{customer.address || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="opacity-70">Account Access:</span>
                                    <span className="font-semibold text-emerald-600">{customer.status}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs opacity-60">Customer profile details could not be retrieved.</p>
                    )}
                </div>
            )}

            {/* Tab E — Activity Audit Log */}
            {activeTab === 'activity' && (
                <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-3">
                    <h3 className="font-bold text-sm border-b border-primary/10 pb-2">Account Audit History</h3>
                    <div className="divide-y divide-primary/10">
                        {activities.length ? (
                            activities.map((act, i) => (
                                <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                                    <div className="flex items-center gap-2.5">
                                        <span className={`h-2 w-2 rounded-full shrink-0 ${act.severity === 'Security' ? 'bg-sky-500' : 'bg-accent'}`} />
                                        <div>
                                            <span className="font-semibold text-primary">{act.actor}</span>
                                            <span className="opacity-80"> — {act.event}</span>
                                        </div>
                                    </div>
                                    <span className="opacity-60 text-[11px] shrink-0">
                                        {new Date(act.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs opacity-60 py-4 text-center">No specific audit history for this account number yet.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Dialogs */}
            <FreezeAccountDialog
                isOpen={isFreezeModalOpen}
                account={account}
                onClose={() => setIsFreezeModalOpen(false)}
                onConfirm={handleConfirmFreeze}
                isPending={actionPending}
            />

            <ManageLimitsDialog
                isOpen={isLimitsModalOpen}
                account={account}
                onClose={() => setIsLimitsModalOpen(false)}
                onConfirm={handleSaveLimits}
                isPending={actionPending}
            />
        </div>
    );
}

export default function AccountDetailsPage({ params }) {
    return (
        <Suspense fallback={<div className="p-8 text-center text-xs opacity-60">Loading account...</div>}>
            <AccountDetailsContent params={params} />
        </Suspense>
    );
}
