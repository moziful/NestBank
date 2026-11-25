'use client';

import { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    FiArrowLeft,
    FiShield,
    FiCheckCircle,
    FiUserX,
    FiDollarSign,
    FiCreditCard,
    FiActivity,
    FiFileText,
    FiClock,
    FiAlertTriangle,
} from 'react-icons/fi';
import CustomerStatusBadge from '../components/CustomerStatusBadge';
import BlockCustomerDialog from '../components/BlockCustomerDialog';
import { formatBDT } from '../../overview/DashboardCharts';

function CustomerProfileContent({ params }) {
    const resolvedParams = use(params);
    const customerId = resolvedParams.id;
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('overview'); // overview, accounts, transactions, loans, activity
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [actionPending, setActionPending] = useState(false);
    const [message, setMessage] = useState('');

    const fetchCustomer = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/customers/${customerId}`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error('Fetch customer detail error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomer();
    }, [customerId]);

    const customer = data?.customer;
    const summary = data?.summary || {};
    const accounts = data?.accounts || [];
    const transactions = data?.transactions || [];
    const loans = data?.loans || [];
    const activities = data?.activities || [];

    const handleStatusToggle = async (newStatus) => {
        setActionPending(true);
        try {
            const res = await fetch(`/api/admin/customers/${customer._id || customer.customerId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const json = await res.json();
            if (res.ok) {
                setMessage(json.message);
                fetchCustomer();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionPending(false);
        }
    };

    const handleConfirmBlock = async ({ id, reason, freezeAccounts }) => {
        setActionPending(true);
        try {
            const res = await fetch(`/api/admin/customers/${id}/block`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason, freezeAccounts }),
            });
            const json = await res.json();
            if (res.ok) {
                setMessage(json.message);
                setIsBlockModalOpen(false);
                fetchCustomer();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionPending(false);
        }
    };

    const handleUnblock = async () => {
        setActionPending(true);
        try {
            const res = await fetch(`/api/admin/customers/${customer._id || customer.customerId}/unblock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ unblockReason: 'Admin verified and cleared' }),
            });
            const json = await res.json();
            if (res.ok) {
                setMessage(json.message);
                fetchCustomer();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionPending(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-xs opacity-60">Loading customer profile...</div>;
    }

    if (!customer) {
        return (
            <div className="p-8 text-center text-xs opacity-60">
                Customer not found.{' '}
                <Link href="/admin/customers" className="text-accent underline font-semibold">
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
                    href="/admin/customers"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-70 hover:opacity-100 hover:text-accent transition-colors"
                >
                    <FiArrowLeft className="h-4 w-4" />
                    <span>Back to Customer Directory</span>
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
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-accent text-white font-bold text-xl grid place-items-center shrink-0">
                        {customer.name
                            ? customer.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join('')
                            : 'CU'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold">{customer.name}</h1>
                            <CustomerStatusBadge status={customer.status || 'Active'} />
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs opacity-75">
                            <span className="font-mono font-semibold text-accent">{customer.customerId}</span>
                            <span>•</span>
                            <span>{customer.email}</span>
                            <span>•</span>
                            <span>{customer.phone || 'No phone'}</span>
                            <span>•</span>
                            <span>Joined {new Date(customer.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Status and Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    {customer.status === 'Active' ? (
                        <>
                            <button
                                type="button"
                                onClick={() => handleStatusToggle('Inactive')}
                                disabled={actionPending}
                                className="rounded-lg border border-primary/20 px-3 py-2 text-xs font-semibold hover:bg-primary/5 transition-colors cursor-pointer"
                            >
                                Deactivate
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsBlockModalOpen(true)}
                                disabled={actionPending}
                                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
                            >
                                <FiShield className="h-3.5 w-3.5" />
                                <span>Block Customer (AML)</span>
                            </button>
                        </>
                    ) : customer.status === 'Blocked' ? (
                        <button
                            type="button"
                            onClick={handleUnblock}
                            disabled={actionPending}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                        >
                            <FiCheckCircle className="h-3.5 w-3.5" />
                            <span>Unblock Customer</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => handleStatusToggle('Active')}
                            disabled={actionPending}
                            className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                        >
                            Activate Customer
                        </button>
                    )}
                </div>
            </div>

            {/* Block Alert Notice if customer is blocked */}
            {customer.status === 'Blocked' && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-700 flex items-start gap-3">
                    <FiAlertTriangle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
                    <div>
                        <p className="font-bold text-sm">Customer Access Restricted (Security / AML Action)</p>
                        <p className="mt-0.5 opacity-90">
                            Reason: {customer.blockReason || 'Suspicious financial activity under investigation'}. All online banking logins and debit transactions are paused.
                        </p>
                    </div>
                </div>
            )}

            {/* Five Tab Navigation */}
            <div className="border-b border-primary/10 flex overflow-x-auto text-xs font-semibold">
                {[
                    { id: 'overview', label: 'Overview', icon: FiActivity },
                    { id: 'accounts', label: `Accounts (${accounts.length})`, icon: FiCreditCard },
                    { id: 'transactions', label: `Transactions (${transactions.length})`, icon: FiDollarSign },
                    { id: 'loans', label: `Loans (${loans.length})`, icon: FiFileText },
                    { id: 'activity', label: 'Activity & Audit', icon: FiClock },
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
                            <span className="text-xs font-semibold uppercase opacity-70">Total Balance</span>
                            <div className="mt-2 text-2xl font-bold text-accent">
                                {formatBDT(summary.totalBalance || 0)}
                            </div>
                            <p className="mt-1 text-[11px] opacity-70">Across {accounts.length} active account(s)</p>
                        </div>
                        <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
                            <span className="text-xs font-semibold uppercase opacity-70">Total Deposits</span>
                            <div className="mt-2 text-2xl font-bold text-emerald-600">
                                {formatBDT(summary.totalDeposits || 0)}
                            </div>
                            <p className="mt-1 text-[11px] opacity-70">Lifetime deposits credited</p>
                        </div>
                        <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
                            <span className="text-xs font-semibold uppercase opacity-70">Total Withdrawals</span>
                            <div className="mt-2 text-2xl font-bold text-rose-600">
                                {formatBDT(summary.totalWithdrawals || 0)}
                            </div>
                            <p className="mt-1 text-[11px] opacity-70">Lifetime withdrawals cleared</p>
                        </div>
                        <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
                            <span className="text-xs font-semibold uppercase opacity-70">Active Loans</span>
                            <div className="mt-2 text-2xl font-bold">
                                {summary.activeLoanCount || 0}
                            </div>
                            <p className="mt-1 text-[11px] opacity-70">Total loan facilities sanctioned</p>
                        </div>
                    </div>

                    {/* Personal & Account Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-3 text-xs">
                            <h3 className="font-bold text-sm border-b border-primary/10 pb-2">Personal Information</h3>
                            <div className="flex justify-between py-1 border-b border-primary/5">
                                <span className="opacity-70">Full Legal Name:</span>
                                <span className="font-medium">{customer.name}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-primary/5">
                                <span className="opacity-70">Phone Number:</span>
                                <span className="font-medium">{customer.phone || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-primary/5">
                                <span className="opacity-70">Email Address:</span>
                                <span className="font-medium">{customer.email}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-primary/5">
                                <span className="opacity-70">Residential Address:</span>
                                <span className="font-medium">{customer.address || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="opacity-70">Verification Status:</span>
                                <span className="font-semibold text-emerald-600">
                                    {customer.identityVerificationStatus || 'VERIFIED'}
                                </span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-3 text-xs">
                            <h3 className="font-bold text-sm border-b border-primary/10 pb-2">Security & Credentials</h3>
                            <div className="flex justify-between py-1 border-b border-primary/5">
                                <span className="opacity-70">Role Tier:</span>
                                <span className="font-semibold text-accent">{customer.role}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-primary/5">
                                <span className="opacity-70">Transaction PIN:</span>
                                <span className="text-emerald-600 font-semibold">Configured (Bcrypt Hashed)</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-primary/5">
                                <span className="opacity-70">Password Storage:</span>
                                <span className="text-emerald-600 font-semibold">Bcrypt (Salt rounds 10)</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="opacity-70">Account Clearance:</span>
                                <span className="font-medium">{customer.status === 'Active' ? 'Clear for Banking' : 'Restricted'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab B — Accounts */}
            {activeTab === 'accounts' && (
                <div className="rounded-xl border border-primary/20 bg-surface shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-primary/10">
                        <h3 className="font-bold text-sm">Customer Bank Accounts</h3>
                        <p className="text-xs opacity-70">Live balances and account state linked to this customer ID</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-primary/10 bg-primary/5 font-semibold opacity-70">
                                    <th className="py-2.5 px-4">Account Number</th>
                                    <th className="py-2.5 px-4">Account Type</th>
                                    <th className="py-2.5 px-4">Balance</th>
                                    <th className="py-2.5 px-4">Status</th>
                                    <th className="py-2.5 px-4">Opened Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/10">
                                {accounts.map((acc, idx) => (
                                    <tr key={idx} className="hover:bg-primary/5">
                                        <td className="py-3 px-4 font-mono font-medium">{acc.accountNumber}</td>
                                        <td className="py-3 px-4 font-medium">{acc.accountType}</td>
                                        <td className="py-3 px-4 font-bold text-accent">{formatBDT(acc.balance)}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                acc.status === 'Active' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-rose-500/10 text-rose-700'
                                            }`}>
                                                {acc.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 opacity-70">{new Date(acc.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab C — Transactions */}
            {activeTab === 'transactions' && (
                <div className="rounded-xl border border-primary/20 bg-surface shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-primary/10">
                        <h3 className="font-bold text-sm">Financial Transaction History</h3>
                        <p className="text-xs opacity-70">Complete ledger settlements for this customer</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-primary/10 bg-primary/5 font-semibold opacity-70">
                                    <th className="py-2.5 px-4">Transaction ID</th>
                                    <th className="py-2.5 px-4">Account</th>
                                    <th className="py-2.5 px-4">Type</th>
                                    <th className="py-2.5 px-4">Amount</th>
                                    <th className="py-2.5 px-4">Date</th>
                                    <th className="py-2.5 px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/10">
                                {transactions.length ? (
                                    transactions.map((tx) => (
                                        <tr key={tx._id || tx.transactionId} className="hover:bg-primary/5">
                                            <td className="py-3 px-4 font-mono text-[11px] font-medium">{tx.transactionId}</td>
                                            <td className="py-3 px-4 font-mono text-[11px]">{tx.accountNumber}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded font-medium text-[10px] ${
                                                    tx.type === 'Deposit' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-rose-500/10 text-rose-700'
                                                }`}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-bold">{formatBDT(tx.amount)}</td>
                                            <td className="py-3 px-4 opacity-70">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                            <td className="py-3 px-4 font-medium text-emerald-600">{tx.status}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-6 text-center opacity-60">
                                            No transaction settlements recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab D — Loans */}
            {activeTab === 'loans' && (
                <div className="rounded-xl border border-primary/20 bg-surface shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-primary/10">
                        <h3 className="font-bold text-sm">Loan Applications & Active Facilities</h3>
                        <p className="text-xs opacity-70">Credit history and status assessments</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-primary/10 bg-primary/5 font-semibold opacity-70">
                                    <th className="py-2.5 px-4">Loan ID</th>
                                    <th className="py-2.5 px-4">Purpose</th>
                                    <th className="py-2.5 px-4">Sanctioned Amount</th>
                                    <th className="py-2.5 px-4">Outstanding</th>
                                    <th className="py-2.5 px-4">Status</th>
                                    <th className="py-2.5 px-4">Risk Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/10">
                                {loans.length ? (
                                    loans.map((l, i) => (
                                        <tr key={i} className="hover:bg-primary/5">
                                            <td className="py-3 px-4 font-mono font-medium">{l.loanId}</td>
                                            <td className="py-3 px-4">{l.purpose || l.loanType}</td>
                                            <td className="py-3 px-4 font-semibold">{formatBDT(l.approvedAmount || l.amount)}</td>
                                            <td className="py-3 px-4 font-bold text-rose-600">{formatBDT(l.outstandingAmount || 0)}</td>
                                            <td className="py-3 px-4 font-medium">{l.status}</td>
                                            <td className="py-3 px-4 font-semibold text-accent">{l.riskRating || 'Standard'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-6 text-center opacity-60">
                                            No loan applications on record.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab E — Activity & Audit Trail */}
            {activeTab === 'activity' && (
                <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-3">
                    <h3 className="font-bold text-sm border-b border-primary/10 pb-2">Customer Audit Trail</h3>
                    <div className="divide-y divide-primary/10">
                        {activities.length ? (
                            activities.map((act, i) => (
                                <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                                    <div className="flex items-center gap-2.5">
                                        <span className={`h-2 w-2 rounded-full shrink-0 ${act.severity === 'Security' ? 'bg-rose-500' : 'bg-accent'}`} />
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
                            <p className="text-xs opacity-60 py-4 text-center">No audit logs for this customer yet.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Dialogs */}
            <BlockCustomerDialog
                isOpen={isBlockModalOpen}
                customer={customer}
                onClose={() => setIsBlockModalOpen(false)}
                onConfirm={handleConfirmBlock}
                isPending={actionPending}
            />
        </div>
    );
}

export default function CustomerProfilePage({ params }) {
    return (
        <Suspense fallback={<div className="p-8 text-center text-xs opacity-60">Loading profile...</div>}>
            <CustomerProfileContent params={params} />
        </Suspense>
    );
}
