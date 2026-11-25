'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FiUsers,
    FiCreditCard,
    FiClock,
    FiActivity,
    FiFileText,
    FiAlertTriangle,
    FiPlusCircle,
    FiArrowRight,
    FiCheckCircle,
} from 'react-icons/fi';
import { formatBDT } from '@/lib/currency';

export default function StaffOverviewPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const res = await fetch('/api/staff/overview');
                const json = await res.json();
                if (json.success) {
                    setData(json);
                }
            } catch (err) {
                console.error('Failed to fetch staff overview:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOverview();
    }, []);

    const stats = data?.stats || {
        registeredByMe: 0,
        accountsOpenedByMe: 0,
        pendingRequests: 0,
        transactionsToday: 0,
        pendingLoans: 0,
        flaggedTransactions: 0,
    };

    const kpiCards = [
        {
            title: 'Customers Enrolled by Me',
            value: stats.registeredByMe,
            desc: 'Direct customer registrations',
            icon: FiUsers,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            href: '/staff/customers',
        },
        {
            title: 'Accounts Opened by Me',
            value: stats.accountsOpenedByMe,
            desc: 'Savings & Current accounts',
            icon: FiCreditCard,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            href: '/staff/accounts',
        },
        {
            title: 'Pending Requests in Queue',
            value: stats.pendingRequests,
            desc: 'Deposits & Withdrawals awaiting review',
            icon: FiClock,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            href: '/staff/requests',
        },
        {
            title: 'Transactions Handled Today',
            value: stats.transactionsToday,
            desc: 'Processed in real-time system',
            icon: FiActivity,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10',
            href: '/staff/transactions',
        },
        {
            title: 'Loan Applications in Desk',
            value: stats.pendingLoans,
            desc: 'Awaiting underwriting review',
            icon: FiFileText,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            href: '/staff/loan-applications',
        },
        {
            title: 'Flagged for Investigation',
            value: stats.flaggedTransactions,
            desc: 'Suspicious transactions queue',
            icon: FiAlertTriangle,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10',
            href: '/staff/transactions',
        },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 text-primary">
            {/* Header with Quick Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Staff Operations Center</h1>
                    <p className="text-sm text-primary/70">
                        Operational queue, customer services, account management, and transaction surveillance.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href="/staff/register-customer"
                        className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                    >
                        <FiPlusCircle className="h-4 w-4" />
                        Register Customer
                    </Link>
                    <Link
                        href="/staff/create-account"
                        className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-surface px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
                    >
                        <FiCreditCard className="h-4 w-4" />
                        Open Account
                    </Link>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {kpiCards.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <Link
                            key={idx}
                            href={kpi.href}
                            className="group block rounded-xl border border-primary/20 bg-surface p-5 shadow-sm transition hover:border-accent/40 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-primary/60">
                                        {kpi.title}
                                    </p>
                                    <h3 className="text-2xl font-bold text-primary">
                                        {loading ? '...' : kpi.value}
                                    </h3>
                                    <p className="text-xs text-primary/60">{kpi.desc}</p>
                                </div>
                                <div className={`rounded-xl p-3 ${kpi.bg}`}>
                                    <Icon className={`h-6 w-6 ${kpi.color}`} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition group-hover:opacity-100">
                                View module <FiArrowRight className="h-3 w-3" />
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Operational Activities & Quick Queues */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Handled Transactions */}
                <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between border-b border-primary/10 pb-3">
                        <div>
                            <h2 className="text-base font-bold text-primary">Recent Bank Transactions</h2>
                            <p className="text-xs text-primary/60">Real-time ledger entries flowing through NestBank</p>
                        </div>
                        <Link href="/staff/transactions" className="text-xs font-medium text-accent hover:underline">
                            View all
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {(!data?.recentTransactions || data.recentTransactions.length === 0) ? (
                            <p className="py-8 text-center text-sm text-primary/50">No transactions recorded yet.</p>
                        ) : (
                            data.recentTransactions.map((tx) => (
                                <div
                                    key={tx._id || tx.transactionId}
                                    className="flex items-center justify-between rounded-lg border border-primary/10 bg-primary/[0.02] p-3 text-sm"
                                >
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-primary">{tx.type}</span>
                                            <span className="text-xs text-primary/50">#{tx.transactionId || String(tx._id).slice(-8)}</span>
                                        </div>
                                        <p className="text-xs text-primary/60">
                                            Account: {tx.accountNumber || tx.fromAccount || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-primary">{formatBDT(tx.amount || 0)}</p>
                                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${tx.status === 'Completed' || tx.status === 'Success'
                                            ? 'bg-emerald-500/10 text-emerald-600'
                                            : 'bg-amber-500/10 text-amber-600'
                                            }`}>
                                            {tx.status || 'Success'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Staff Activity Timeline */}
                <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between border-b border-primary/10 pb-3">
                        <div>
                            <h2 className="text-base font-bold text-primary">Operational Activity Log</h2>
                            <p className="text-xs text-primary/60">Account operations and request reviews</p>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                            Live Stream
                        </span>
                    </div>

                    <div className="space-y-4">
                        {(!data?.recentActivities || data.recentActivities.length === 0) ? (
                            <p className="py-8 text-center text-sm text-primary/50">No recent operational logs.</p>
                        ) : (
                            data.recentActivities.map((log, idx) => (
                                <div key={log._id || idx} className="flex items-start gap-3 text-sm">
                                    <div className="mt-0.5 rounded-full bg-accent/15 p-1.5 text-accent">
                                        <FiCheckCircle className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 space-y-0.5">
                                        <p className="font-medium text-primary">
                                            {log.action?.replace(/_/g, ' ') || 'Operation Executed'}
                                        </p>
                                        <p className="text-xs text-primary/60">
                                            By <span className="font-semibold">{log.actor}</span> ({log.actorRole}) • {log.targetType || 'System'}
                                        </p>
                                    </div>
                                    <span className="text-[11px] text-primary/40">
                                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
