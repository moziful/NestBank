'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FiDollarSign,
    FiCreditCard,
    FiSend,
    FiArrowDownLeft,
    FiArrowUpRight,
    FiFileText,
    FiClock,
    FiBell,
    FiTrendingUp,
    FiTrendingDown,
    FiArrowRight,
    FiSmartphone,
} from 'react-icons/fi';
import { formatBDT } from '@/lib/currency';
import { useAuth } from '@/app/providers';
import AccountStatusBadge from '@/app/admin/bank-accounts/components/AccountStatusBadge';

export default function CustomerOverviewPage() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const res = await fetch('/api/customer/overview');
                const json = await res.json();
                if (json.success) {
                    setData(json);
                }
            } catch (err) {
                console.error('Failed to load customer overview:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOverview();
    }, []);

    const summary = data?.summary || {
        totalBalance: 0,
        availableBalance: 0,
        totalHeld: 0,
        activeAccountsCount: 0,
        pendingRequestsCount: 0,
        activeLoansCount: 0,
        totalDepositsThisMonth: 0,
        totalWithdrawalsThisMonth: 0,
    };

    const quickActions = [
        { label: 'Transfer Money', href: '/customer/transfer', icon: FiSend, color: 'bg-accent text-white' },
        { label: 'Deposit Funds', href: '/customer/deposit', icon: FiArrowDownLeft, color: 'bg-emerald-600 text-white' },
        { label: 'Withdraw Funds', href: '/customer/withdraw', icon: FiArrowUpRight, color: 'bg-amber-600 text-white' },
        { label: 'NestPay (Soon)', href: '/customer/nestpay', icon: FiSmartphone, color: 'border border-accent/40 bg-accent/15 text-accent' },
        { label: 'Apply for Loan', href: '/customer/loans/apply', icon: FiFileText, color: 'bg-indigo-600 text-white' },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-primary">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Welcome back, {user?.name?.split(' ')[0] || 'Customer'}
                    </h1>
                    <p className="mt-1 text-sm text-primary/70">
                        Manage your balances, transfers, deposits, withdrawals, and loan accounts.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {quickActions.map((act) => {
                        const Icon = act.icon;
                        return (
                            <Link
                                key={act.href}
                                href={act.href}
                                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold shadow-sm transition hover:opacity-90 ${act.color}`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {act.label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Balance & KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-primary/60">Total Balance</p>
                            <h3 className="mt-1 text-2xl font-bold text-primary">
                                {loading ? '...' : formatBDT(summary.totalBalance)}
                            </h3>
                            <p className="mt-1 text-[11px] text-primary/60">
                                Available: {formatBDT(summary.availableBalance)}
                            </p>
                        </div>
                        <div className="rounded-xl bg-accent/15 p-3 text-accent">
                            <FiDollarSign className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-primary/60">Active Accounts</p>
                            <h3 className="mt-1 text-2xl font-bold text-primary">
                                {loading ? '...' : summary.activeAccountsCount}
                            </h3>
                            <p className="mt-1 text-[11px] text-primary/60">
                                Held funds: {formatBDT(summary.totalHeld)}
                            </p>
                        </div>
                        <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
                            <FiCreditCard className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-primary/60">Monthly Inflow</p>
                            <h3 className="mt-1 text-2xl font-bold text-emerald-600">
                                {loading ? '...' : formatBDT(summary.totalDepositsThisMonth)}
                            </h3>
                            <p className="mt-1 text-[11px] text-primary/60">Deposits & incoming transfers</p>
                        </div>
                        <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
                            <FiTrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-primary/60">Pending & Loans</p>
                            <h3 className="mt-1 text-2xl font-bold text-primary">
                                {loading ? '...' : `${summary.pendingRequestsCount} / ${summary.activeLoansCount}`}
                            </h3>
                            <p className="mt-1 text-[11px] text-primary/60">Pending requests / Active loans</p>
                        </div>
                        <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600">
                            <FiClock className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Accounts Strip + Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* My Accounts Overview */}
                <div className="lg:col-span-8 rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                        <h2 className="text-base font-bold text-primary">My Accounts</h2>
                        <Link href="/customer/accounts" className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1">
                            View all <FiArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    {(!data?.accounts || data.accounts.length === 0) ? (
                        <p className="py-6 text-center text-sm text-primary/60">No bank accounts linked yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {data.accounts.map((acc) => (
                                <Link
                                    key={acc._id}
                                    href={`/customer/accounts/${acc._id}`}
                                    className="rounded-xl border border-primary/15 bg-primary/[0.02] p-4 hover:border-accent/40 transition block space-y-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-accent">{acc.accountType} Account</span>
                                        <AccountStatusBadge status={acc.status} />
                                    </div>
                                    <p className="text-xs font-mono text-primary/70">
                                        •••• {String(acc.accountNumber).slice(-4)}
                                    </p>
                                    <div className="pt-1">
                                        <p className="text-lg font-bold text-primary">{formatBDT(acc.balance)}</p>
                                        <p className="text-[11px] text-primary/60">
                                            Available: {formatBDT(acc.availableBalance)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Alerts / Notifications */}
                <div className="lg:col-span-4 rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                        <h2 className="text-base font-bold text-primary flex items-center gap-2">
                            <FiBell className="text-accent" /> Alerts
                        </h2>
                        <Link href="/customer/notifications" className="text-xs font-semibold text-accent hover:underline">
                            See all
                        </Link>
                    </div>
                    <div className="space-y-2.5">
                        {(!data?.notifications || data.notifications.length === 0) ? (
                            <p className="py-6 text-center text-xs text-primary/60">No new notifications.</p>
                        ) : (
                            data.notifications.map((n, i) => (
                                <div key={n._id || i} className="rounded-lg border border-primary/10 bg-primary/[0.02] p-3 text-xs space-y-1">
                                    <p className="font-bold text-primary">{n.title}</p>
                                    <p className="text-primary/70 leading-snug">{n.message}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Personal Transactions */}
            <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                    <div>
                        <h2 className="text-base font-bold text-primary">Recent Transactions</h2>
                        <p className="text-xs text-primary/60">Latest activity across your accounts</p>
                    </div>
                    <Link href="/customer/transactions" className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1">
                        Full history <FiArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                {(!data?.recentTransactions || data.recentTransactions.length === 0) ? (
                    <p className="py-8 text-center text-sm text-primary/60">No transactions yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-primary/10 text-primary/60 uppercase">
                                    <th className="py-2.5 px-3">Ref ID</th>
                                    <th className="py-2.5 px-3">Type</th>
                                    <th className="py-2.5 px-3">Description</th>
                                    <th className="py-2.5 px-3">Amount</th>
                                    <th className="py-2.5 px-3">Status</th>
                                    <th className="py-2.5 px-3 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/10">
                                {data.recentTransactions.map((tx) => (
                                    <tr key={tx._id || tx.transactionId} className="hover:bg-primary/[0.02]">
                                        <td className="py-3 px-3 font-mono font-semibold">{tx.transactionId || String(tx._id).slice(-8)}</td>
                                        <td className="py-3 px-3 font-medium">{tx.type}</td>
                                        <td className="py-3 px-3 text-primary/75">{tx.description || '—'}</td>
                                        <td className="py-3 px-3 font-bold">{formatBDT(tx.amount)}</td>
                                        <td className="py-3 px-3">
                                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                                                {tx.status || 'Completed'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-right text-primary/60">
                                            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '—'}
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
