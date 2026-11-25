'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FiUsers,
    FiCreditCard,
    FiDollarSign,
    FiActivity,
    FiArrowDownLeft,
    FiArrowUpRight,
    FiClock,
    FiRefreshCw,
    FiDownload,
    FiAlertTriangle,
    FiExternalLink,
    FiSearch,
} from 'react-icons/fi';
import {
    formatBDT,
    TransactionVolumeChart,
    DepositVsWithdrawalChart,
    AccountDistributionChart,
    LoanApprovalChart,
    MonthlyBankingActivityChart,
} from './DashboardCharts';

export default function AdminOverviewPage() {
    const [range, setRange] = useState('30d');
    const [txSearch, setTxSearch] = useState('');
    const [txTypeFilter, setTxTypeFilter] = useState('All');
    const [txStatusFilter, setTxStatusFilter] = useState('All');

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    const fetchData = async (currentRange) => {
        setIsLoading(true);
        setIsError(false);
        try {
            const res = await fetch(`/api/admin/dashboard/overview?range=${currentRange}`);
            if (!res.ok) throw new Error('Failed to fetch metrics');
            const json = await res.json();
            if (json.success) {
                setData(json);
            } else {
                setIsError(true);
            }
        } catch (err) {
            console.error('Fetch admin overview error:', err);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(range);
    }, [range]);

    const kpis = data?.kpis || {};
    const analytics = data?.analytics || {};
    const recentTransactions = data?.recentTransactions || [];
    const pendingApprovals = data?.pendingApprovals || [];
    const systemActivities = data?.systemActivities || [];

    // Filter recent transactions
    const filteredTransactions = recentTransactions.filter((tx) => {
        const matchesQuery =
            (tx.transactionId || '').toLowerCase().includes(txSearch.toLowerCase()) ||
            (tx.customerName || '').toLowerCase().includes(txSearch.toLowerCase()) ||
            (tx.accountNumber || '').toLowerCase().includes(txSearch.toLowerCase());
        const matchesType = txTypeFilter === 'All' || tx.type === txTypeFilter;
        const matchesStatus = txStatusFilter === 'All' || tx.status === txStatusFilter;
        return matchesQuery && matchesType && matchesStatus;
    });

    const handleExport = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify({ exportDate: new Date(), range, kpis, analytics }, null, 2)
        )}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute('download', `nestbank-admin-report-${range}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 text-primary">
            {/* 1. Page Header & Date Range Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary/10 pb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Overview</h1>
                        <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent uppercase">
                            Live Central Monitor
                        </span>
                    </div>
                    <p className="mt-1 text-sm opacity-75">
                        Monitor banking operations, financial activity, and system performance.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Date Range Selector */}
                    <div className="flex items-center rounded-lg border border-primary/20 bg-surface px-2.5 py-1.5 shadow-sm">
                        <FiClock className="mr-2 h-4 w-4 text-accent" />
                        <select
                            value={range}
                            onChange={(e) => setRange(e.target.value)}
                            className="bg-transparent text-xs font-semibold text-primary outline-none cursor-pointer"
                        >
                            <option value="today">Today</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="this_month">This Month</option>
                            <option value="this_year">This Year</option>
                        </select>
                    </div>

                    {/* Refresh Dashboard Button */}
                    <button
                        type="button"
                        onClick={() => fetchData(range)}
                        disabled={isLoading}
                        title="Refresh dashboard metrics"
                        className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-surface px-3 py-1.5 text-xs font-semibold hover:bg-secondary hover:text-surface transition-colors shadow-sm disabled:opacity-50"
                    >
                        <FiRefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>

                    {/* Optional Export Report Button */}
                    <button
                        type="button"
                        onClick={handleExport}
                        title="Export dashboard report"
                        className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-secondary transition-colors shadow-sm"
                    >
                        <FiDownload className="h-3.5 w-3.5" />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            {/* Error banner if query failed */}
            {isError && (
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-4 text-sm text-rose-600 flex items-center gap-3">
                    <FiAlertTriangle className="h-5 w-5 shrink-0" />
                    <span>Failed to load admin metrics. Please ensure you are authenticated as an Administrator.</span>
                </div>
            )}

            {/* 2. Seven KPI Cards */}
            <section aria-labelledby="kpi-heading">
                <h2 id="kpi-heading" className="sr-only">Key Performance Indicators</h2>
                {/* 4 Cards Top Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Customers */}
                    <Link
                        href="/admin/customers"
                        className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm hover:border-accent transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Total Customers</span>
                            <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center text-accent group-hover:scale-110 transition-transform">
                                <FiUsers className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-bold">
                            {isLoading ? '...' : (kpis.totalCustomers || 0).toLocaleString()}
                        </div>
                        <p className="mt-1 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            ↑ 8.4% <span className="opacity-70 font-normal">Registered customer count</span>
                        </p>
                    </Link>

                    {/* Total Accounts */}
                    <Link
                        href="/admin/bank-accounts"
                        className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm hover:border-accent transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Total Accounts</span>
                            <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center text-accent group-hover:scale-110 transition-transform">
                                <FiCreditCard className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-bold">
                            {isLoading ? '...' : (kpis.totalBankAccounts || 0).toLocaleString()}
                        </div>
                        <p className="mt-1 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            ↑ 5.2% <span className="opacity-70 font-normal">All active bank accounts</span>
                        </p>
                    </Link>

                    {/* Total Bank Balance */}
                    <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Total Bank Balance</span>
                            <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center text-accent">
                                <FiDollarSign className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-bold text-accent">
                            {isLoading ? '...' : formatBDT(kpis.totalBankBalance || 0)}
                        </div>
                        <p className="mt-1 text-[11px] opacity-70">
                            Combined customer accounts balance
                        </p>
                    </div>

                    {/* Total Transactions */}
                    <Link
                        href="/admin/transactions"
                        className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm hover:border-accent transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Total Transactions</span>
                            <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center text-accent group-hover:scale-110 transition-transform">
                                <FiActivity className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-bold">
                            {isLoading ? '...' : (kpis.totalTransactions || 0).toLocaleString()}
                        </div>
                        <p className="mt-1 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            ↑ 12.6% <span className="opacity-70 font-normal">Selected period</span>
                        </p>
                    </Link>
                </div>

                {/* 3 Cards Bottom Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    {/* Total Deposits */}
                    <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Total Deposits</span>
                            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 grid place-items-center text-emerald-600">
                                <FiArrowDownLeft className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-bold text-emerald-600">
                            {isLoading ? '...' : formatBDT(kpis.totalDeposits || 0)}
                        </div>
                        <p className="mt-1 text-[11px] opacity-70">Deposit amount in selected period</p>
                    </div>

                    {/* Total Withdrawals */}
                    <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Total Withdrawals</span>
                            <div className="h-9 w-9 rounded-lg bg-rose-500/10 grid place-items-center text-rose-600">
                                <FiArrowUpRight className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-bold text-rose-600">
                            {isLoading ? '...' : formatBDT(kpis.totalWithdrawals || 0)}
                        </div>
                        <p className="mt-1 text-[11px] opacity-70">Withdrawal amount in selected period</p>
                    </div>

                    {/* Pending Loan Applications */}
                    <Link
                        href="/admin/approvals"
                        className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm hover:border-amber-500 transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Pending Loans</span>
                            <div className="h-9 w-9 rounded-lg bg-amber-500/10 grid place-items-center text-amber-600 group-hover:scale-110 transition-transform">
                                <FiAlertTriangle className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-bold text-amber-600">
                            {isLoading ? '...' : (kpis.pendingLoans || 0)}
                        </div>
                        <p className="mt-1 text-[11px] text-amber-600 font-medium">Require review & decision</p>
                    </Link>
                </div>
            </section>

            {/* 3. Analytics Visualizations Section */}
            <div className="space-y-6">
                {/* Visualizations Row 1: Monthly Transaction Volume & Deposit vs Withdrawal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h3 className="text-base font-bold">Monthly Transaction Volume</h3>
                                <p className="text-xs opacity-70">Total transaction count trends over time</p>
                            </div>
                            <span className="text-xs font-semibold text-accent">Line Trend</span>
                        </div>
                        <TransactionVolumeChart data={analytics.transactionVolume} />
                    </div>

                    <div className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h3 className="text-base font-bold">Deposit vs Withdrawal</h3>
                                <p className="text-xs opacity-70">Compare monthly deposits and withdrawals (BDT)</p>
                            </div>
                            <span className="text-xs font-semibold text-emerald-600">Grouped Bar</span>
                        </div>
                        <DepositVsWithdrawalChart data={analytics.depositVsWithdrawal} />
                    </div>
                </div>

                {/* Visualizations Row 2: Account Distribution & Loan Approval Statistics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h3 className="text-base font-bold">Account Distribution</h3>
                                <p className="text-xs opacity-70">Breakdown by Savings, Current, and Business</p>
                            </div>
                            <span className="text-xs font-semibold text-accent">Donut Chart</span>
                        </div>
                        <AccountDistributionChart data={analytics.accountDistribution} />
                    </div>

                    <div className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h3 className="text-base font-bold">Loan Approval Statistics</h3>
                                <p className="text-xs opacity-70">Application counts by approval status</p>
                            </div>
                            <span className="text-xs font-semibold text-blue-600">Status Metric</span>
                        </div>
                        <LoanApprovalChart data={analytics.loanStatistics} />
                    </div>
                </div>

                {/* Visualization 5: Monthly Banking Activity */}
                <div className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h3 className="text-base font-bold">Monthly Banking Activity</h3>
                            <p className="text-xs opacity-70">Combined overview of deposits, withdrawals, and transfers</p>
                        </div>
                        <span className="text-xs font-semibold text-indigo-600">Cash Flow Allocation</span>
                    </div>
                    <MonthlyBankingActivityChart data={analytics.monthlyBankingActivity} />
                </div>
            </div>

            {/* 4. Operational Section: Recent Transactions & Pending Approvals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions (2 cols on large screen) */}
                <div className="lg:col-span-2 rounded-xl border border-primary/20 bg-surface p-6 shadow-sm flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                            <h3 className="text-base font-bold">Recent Transactions</h3>
                            <p className="text-xs opacity-70">Latest settlements recorded in the core banking ledger</p>
                        </div>
                        <Link href="/admin/transactions" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
                            View All Transactions <FiExternalLink className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    {/* Filter controls */}
                    <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                        <div className="flex items-center rounded-md border border-primary/20 bg-white/20 px-2 py-1 flex-1 min-w-[140px]">
                            <FiSearch className="mr-1.5 opacity-60" />
                            <input
                                value={txSearch}
                                onChange={(e) => setTxSearch(e.target.value)}
                                placeholder="Search by ID, Customer..."
                                className="w-full bg-transparent outline-none"
                            />
                        </div>
                        <select
                            value={txTypeFilter}
                            onChange={(e) => setTxTypeFilter(e.target.value)}
                            className="rounded-md border border-primary/20 bg-white/20 px-2 py-1 outline-none"
                        >
                            <option value="All">All Types</option>
                            <option value="Deposit">Deposit</option>
                            <option value="Withdrawal">Withdrawal</option>
                            <option value="Transfer">Transfer</option>
                        </select>
                        <select
                            value={txStatusFilter}
                            onChange={(e) => setTxStatusFilter(e.target.value)}
                            className="rounded-md border border-primary/20 bg-white/20 px-2 py-1 outline-none"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-primary/10 font-semibold opacity-70">
                                    <th className="py-2.5">Transaction ID</th>
                                    <th className="py-2.5">Customer</th>
                                    <th className="py-2.5">Type</th>
                                    <th className="py-2.5">Amount</th>
                                    <th className="py-2.5">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/10">
                                {filteredTransactions.length ? (
                                    filteredTransactions.map((tx) => (
                                        <tr key={tx._id || tx.transactionId} className="hover:bg-primary/5 transition-colors">
                                            <td className="py-2.5 font-mono text-[11px] font-medium">{tx.transactionId}</td>
                                            <td className="py-2.5">{tx.customerName || 'N/A'}</td>
                                            <td className="py-2.5">
                                                <span className={`px-2 py-0.5 rounded font-medium text-[10px] ${
                                                    tx.type === 'Deposit' ? 'bg-emerald-500/10 text-emerald-700' :
                                                    tx.type === 'Withdrawal' ? 'bg-rose-500/10 text-rose-700' :
                                                    'bg-indigo-500/10 text-indigo-700'
                                                }`}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="py-2.5 font-semibold">{formatBDT(tx.amount)}</td>
                                            <td className="py-2.5">
                                                <span className={`inline-flex items-center gap-1 font-medium ${
                                                    tx.status === 'Completed' ? 'text-emerald-600' :
                                                    tx.status === 'Pending' ? 'text-amber-600' : 'text-rose-600'
                                                }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-6 text-center opacity-60">
                                            No matching transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pending Approvals Summary */}
                <div className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold">Pending Approvals</h3>
                                <p className="text-xs opacity-70">Operational requests requiring admin action</p>
                            </div>
                            <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-600">
                                Requires attention
                            </span>
                        </div>

                        <div className="space-y-3">
                            {pendingApprovals.map((req, idx) => (
                                <Link
                                    key={idx}
                                    href={req.href}
                                    className="block p-3.5 rounded-lg border border-primary/10 hover:border-accent hover:bg-primary/5 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-xs">{req.category}</span>
                                        <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-bold text-accent">
                                            {req.count}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-[11px] opacity-70">{req.detail}</p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-primary/10 text-center">
                        <Link
                            href="/admin/approvals"
                            className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1"
                        >
                            Open Approvals Clearance Queue →
                        </Link>
                    </div>
                </div>
            </div>

            {/* 5. System Activity & Audit Alerts Feed */}
            <div className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-bold">System Activity & Security Alerts</h3>
                        <p className="text-xs opacity-70">Live audit trail of administrative actions and high-priority banking events</p>
                    </div>
                    <Link href="/admin/audit-logs" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
                        View Audit Log <FiExternalLink className="h-3.5 w-3.5" />
                    </Link>
                </div>

                <div className="divide-y divide-primary/10">
                    {systemActivities.map((log, idx) => (
                        <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="flex items-start gap-3">
                                <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                                    log.severity === 'Warning' ? 'bg-amber-500 ring-2 ring-amber-500/20' :
                                    log.severity === 'Security' ? 'bg-rose-500 ring-2 ring-rose-500/20' :
                                    'bg-accent ring-2 ring-accent/20'
                                }`} />
                                <div>
                                    <span className="font-semibold">{log.event}</span>
                                    <div className="opacity-70 text-[11px] mt-0.5 flex items-center gap-2">
                                        <span>Actor: <strong className="font-medium text-primary">{log.actor}</strong></span>
                                        <span>•</span>
                                        <span>Ref: <code className="font-mono">{log.recordRef}</code></span>
                                    </div>
                                </div>
                            </div>
                            <span className="opacity-60 text-[11px] shrink-0 sm:text-right">
                                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
