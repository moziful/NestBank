'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    FiCreditCard,
    FiPlus,
    FiExternalLink,
    FiCheckCircle,
    FiAlertCircle,
} from 'react-icons/fi';

import AccountStats from './components/AccountStats';
import AccountFilters from './components/AccountFilters';
import AccountTable from './components/AccountTable';
import CreateAccountForm from './components/CreateAccountForm';
import FreezeAccountDialog from './components/FreezeAccountDialog';
import ManageLimitsDialog from './components/ManageLimitsDialog';

export default function BankAccountsPage() {
    // Filter & Pagination States
    const [search, setSearch] = useState('');
    const [accountType, setAccountType] = useState('All');
    const [status, setStatus] = useState('All');
    const [sortBy, setSortBy] = useState('createdAt');
    const [page, setPage] = useState(1);
    const limit = 10;

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [freezeTarget, setFreezeTarget] = useState(null);
    const [limitsTarget, setLimitsTarget] = useState(null);

    // Notifications & Messages
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    // Data States
    const [statsData, setStatsData] = useState(null);
    const [isStatsLoading, setIsStatsLoading] = useState(true);
    const [accountsData, setAccountsData] = useState(null);
    const [isAccountsLoading, setIsAccountsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Stats
    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/accounts/statistics');
            if (res.ok) {
                const json = await res.json();
                setStatsData(json);
            }
        } catch (err) {
            console.error('Fetch account stats error:', err);
        } finally {
            setIsStatsLoading(false);
        }
    }, []);

    // Fetch Accounts Directory
    const fetchAccounts = useCallback(async () => {
        setIsAccountsLoading(true);
        try {
            const query = new URLSearchParams({
                search,
                accountType,
                status,
                sortBy,
                page: String(page),
                limit: String(limit),
            });
            const res = await fetch(`/api/admin/accounts?${query.toString()}`);
            if (res.ok) {
                const json = await res.json();
                setAccountsData(json);
            }
        } catch (err) {
            console.error('Fetch accounts error:', err);
        } finally {
            setIsAccountsLoading(false);
        }
    }, [search, accountType, status, sortBy, page, limit]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const accounts = accountsData?.accounts || [];
    const pagination = accountsData?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };
    const recentActivities = statsData?.recentActivities || [];

    // Handlers
    const handleResetFilters = () => {
        setSearch('');
        setAccountType('All');
        setStatus('All');
        setSortBy('createdAt');
        setPage(1);
    };

    const handleExportCsv = () => {
        if (!accounts.length) return;
        const headers = ['Account Number', 'Customer Name', 'Customer ID', 'Account Type', 'Ledger Balance', 'Available Balance', 'Status', 'Opened Date'];
        const rows = accounts.map((a) => [
            a.accountNumber,
            `"${a.customerName}"`,
            a.customerId,
            a.accountType,
            a.ledgerBalance || a.balance,
            a.availableBalance || a.balance,
            a.status,
            new Date(a.createdAt).toLocaleDateString(),
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `nestbank-accounts-directory-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleCreateAccount = async (formData) => {
        setIsSubmitting(true);
        setFeedback({ type: '', message: '' });
        try {
            const res = await fetch('/api/admin/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Account creation failed');
            setFeedback({ type: 'success', message: `${json.account.accountType} account ${json.account.accountNumber} opened for ${json.account.customerName}.` });
            setIsCreateOpen(false);
            fetchAccounts();
            fetchStats();
        } catch (err) {
            setFeedback({ type: 'error', message: err.message || 'Failed to open account.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmFreeze = async ({ id, reason }) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/accounts/${id}/freeze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message);
            setFeedback({ type: 'success', message: json.message });
            setFreezeTarget(null);
            fetchAccounts();
            fetchStats();
        } catch (err) {
            setFeedback({ type: 'error', message: err.message || 'Failed to freeze account.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnfreeze = async (account) => {
        if (!confirm(`Are you sure you want to unfreeze account ${account.accountNumber}?`)) return;
        try {
            const res = await fetch(`/api/admin/accounts/${account._id || account.accountNumber}/unfreeze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ unfreezeReason: 'Admin verified and cleared' }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message);
            setFeedback({ type: 'success', message: json.message });
            fetchAccounts();
            fetchStats();
        } catch (err) {
            setFeedback({ type: 'error', message: err.message || 'Failed to unfreeze account.' });
        }
    };

    const handleSaveLimits = async ({ id, limits }) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/accounts/${id}/limits`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(limits),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message);
            setFeedback({ type: 'success', message: json.message });
            setLimitsTarget(null);
            fetchAccounts();
            fetchStats();
        } catch (err) {
            setFeedback({ type: 'error', message: err.message || 'Failed to update limits.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 text-primary">
            {/* 1. Header with [+ Create Account] */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Bank Accounts</h1>
                    <p className="mt-1 text-sm opacity-75">
                        Manage customer accounts, balances, held funds, and account transaction restrictions.
                    </p>
                </div>
                <div>
                    <button
                        type="button"
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-xs font-semibold text-white hover:bg-secondary transition-colors shadow-sm cursor-pointer"
                    >
                        <FiPlus className="h-4 w-4" />
                        <span>+ Create Account</span>
                    </button>
                </div>
            </div>

            {/* Notification Banner */}
            {feedback.message && (
                <div
                    className={`rounded-lg p-3.5 text-xs flex items-center justify-between gap-2 border ${
                        feedback.type === 'success'
                            ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-700 border-rose-500/30'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {feedback.type === 'success' ? <FiCheckCircle className="h-4 w-4" /> : <FiAlertCircle className="h-4 w-4" />}
                        <span>{feedback.message}</span>
                    </div>
                    <button type="button" onClick={() => setFeedback({ type: '', message: '' })} className="font-bold text-xs cursor-pointer">
                        ✕
                    </button>
                </div>
            )}

            {/* 2. Account Statistics Cards */}
            <AccountStats statistics={statsData?.statistics} isLoading={isStatsLoading} />

            {/* 3. Search and Filters */}
            <AccountFilters
                search={search}
                onSearchChange={(val) => {
                    setSearch(val);
                    setPage(1);
                }}
                accountType={accountType}
                onAccountTypeChange={(val) => {
                    setAccountType(val);
                    setPage(1);
                }}
                status={status}
                onStatusChange={(val) => {
                    setStatus(val);
                    setPage(1);
                }}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                onReset={handleResetFilters}
                onExportCsv={handleExportCsv}
            />

            {/* 4. Account Directory Table */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-bold">Account Directory</h2>
                    <span className="text-xs opacity-70">
                        {pagination.total} registered accounts
                    </span>
                </div>
                <AccountTable
                    accounts={accounts}
                    pagination={pagination}
                    onPageChange={setPage}
                    onFreezeAccount={(acc) => setFreezeTarget(acc)}
                    onUnfreezeAccount={handleUnfreeze}
                    onManageLimits={(acc) => setLimitsTarget(acc)}
                />
            </div>

            {/* 5. Recent Account Activity Feed */}
            <div className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-bold">Account Activity / Recent Changes</h3>
                        <p className="text-xs opacity-70">Live audit log of account creation, freezing, and limit adjustments</p>
                    </div>
                    <Link
                        href="/admin/audit-logs"
                        className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                    >
                        View Audit Log <FiExternalLink className="h-3.5 w-3.5" />
                    </Link>
                </div>

                <div className="divide-y divide-primary/10">
                    {recentActivities.slice(0, 5).map((act, idx) => (
                        <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-3">
                                <span className={`h-2 w-2 rounded-full shrink-0 ${act.severity === 'Security' ? 'bg-sky-500' : 'bg-accent'}`} />
                                <div>
                                    <span className="font-semibold text-primary">{act.actor}</span>
                                    <span className="opacity-80"> — {act.event}</span>
                                    <span className="ml-2 font-mono text-[10px] opacity-60">[{act.recordRef}]</span>
                                </div>
                            </div>
                            <span className="opacity-60 text-[11px] shrink-0">
                                {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals & Dialogs */}
            <CreateAccountForm
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={handleCreateAccount}
                isSubmitting={isSubmitting}
            />

            <FreezeAccountDialog
                isOpen={!!freezeTarget}
                account={freezeTarget}
                onClose={() => setFreezeTarget(null)}
                onConfirm={handleConfirmFreeze}
                isPending={isSubmitting}
            />

            <ManageLimitsDialog
                isOpen={!!limitsTarget}
                account={limitsTarget}
                onClose={() => setLimitsTarget(null)}
                onConfirm={handleSaveLimits}
                isPending={isSubmitting}
            />
        </div>
    );
}
