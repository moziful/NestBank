'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    FiUserPlus,
    FiExternalLink,
    FiCheckCircle,
    FiAlertCircle,
    FiShield,
} from 'react-icons/fi';

import CustomerStats from './components/CustomerStats';
import CustomerFilters from './components/CustomerFilters';
import CustomerTable from './components/CustomerTable';
import CustomerFormModal from './components/CustomerFormModal';
import BlockCustomerDialog from './components/BlockCustomerDialog';

export default function CustomerManagementPage() {
    // Filter & Pagination States
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('All');
    const [accountType, setAccountType] = useState('All');
    const [sortBy, setSortBy] = useState('createdAt');
    const [page, setPage] = useState(1);
    const limit = 10;

    // Modals
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
    const [blockCustomerTarget, setBlockCustomerTarget] = useState(null);

    // Notifications & Messages
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    // Data States
    const [statsData, setStatsData] = useState(null);
    const [isStatsLoading, setIsStatsLoading] = useState(true);
    const [customerData, setCustomerData] = useState(null);
    const [isCustomersLoading, setIsCustomersLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Statistics
    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/customers/statistics');
            if (res.ok) {
                const json = await res.json();
                setStatsData(json);
            }
        } catch (err) {
            console.error('Fetch customer stats error:', err);
        } finally {
            setIsStatsLoading(false);
        }
    }, []);

    // Fetch Customers Directory
    const fetchCustomers = useCallback(async () => {
        setIsCustomersLoading(true);
        try {
            const query = new URLSearchParams({
                search,
                status,
                accountType,
                sortBy,
                page: String(page),
                limit: String(limit),
            });
            const res = await fetch(`/api/admin/customers?${query.toString()}`);
            if (res.ok) {
                const json = await res.json();
                setCustomerData(json);
            }
        } catch (err) {
            console.error('Fetch customers error:', err);
        } finally {
            setIsCustomersLoading(false);
        }
    }, [search, status, accountType, sortBy, page, limit]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const customers = customerData?.customers || [];
    const pagination = customerData?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };
    const recentActivities = statsData?.recentActivities || [];

    // Handlers
    const handleResetFilters = () => {
        setSearch('');
        setStatus('All');
        setAccountType('All');
        setSortBy('createdAt');
        setPage(1);
    };

    const handleExportCsv = () => {
        if (!customers.length) return;
        const headers = ['Customer ID', 'Name', 'Email', 'Phone', 'Accounts', 'Total Balance (BDT)', 'Status', 'Joined Date'];
        const rows = customers.map((c) => [
            c.customerId,
            `"${c.name}"`,
            c.email,
            c.phone || '',
            c.accountCount || 1,
            c.totalBalance || 0,
            c.status,
            new Date(c.createdAt).toLocaleDateString(),
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `nestbank-customers-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleCreateCustomer = async (formData) => {
        setIsSubmitting(true);
        setFeedback({ type: '', message: '' });
        try {
            const res = await fetch('/api/admin/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Creation failed');
            setFeedback({ type: 'success', message: `Customer ${json.customer.name} (${json.customer.customerId}) provisioned successfully.` });
            setIsAddCustomerOpen(false);
            fetchCustomers();
            fetchStats();
        } catch (err) {
            setFeedback({ type: 'error', message: err.message || 'Failed to provision customer.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (customer, newStatus) => {
        try {
            const res = await fetch(`/api/admin/customers/${customer._id || customer.customerId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message);
            setFeedback({ type: 'success', message: json.message });
            fetchCustomers();
            fetchStats();
        } catch (err) {
            setFeedback({ type: 'error', message: err.message || 'Status update failed.' });
        }
    };

    const handleConfirmBlock = async ({ id, reason, freezeAccounts }) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/customers/${id}/block`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason, freezeAccounts }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message);
            setFeedback({ type: 'success', message: json.message });
            setBlockCustomerTarget(null);
            fetchCustomers();
            fetchStats();
        } catch (err) {
            setFeedback({ type: 'error', message: err.message || 'Blocking customer failed.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnblock = async (customer) => {
        if (!confirm(`Are you sure you want to restore banking access for ${customer.name}?`)) return;
        try {
            const res = await fetch(`/api/admin/customers/${customer._id || customer.customerId}/unblock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ unblockReason: 'Admin manual unblock & clearance' }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message);
            setFeedback({ type: 'success', message: json.message });
            fetchCustomers();
            fetchStats();
        } catch (err) {
            setFeedback({ type: 'error', message: err.message || 'Unblock failed.' });
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 text-primary">
            {/* 1. Header with [+ Add Customer] */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Customer Management</h1>
                    <p className="mt-1 text-sm opacity-75">
                        Manage customer profiles, account access, investigations, and financial relationships.
                    </p>
                </div>
                <div>
                    <button
                        type="button"
                        onClick={() => setIsAddCustomerOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-xs font-semibold text-white hover:bg-secondary transition-colors shadow-sm cursor-pointer"
                    >
                        <FiUserPlus className="h-4 w-4" />
                        <span>+ Add Customer</span>
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

            {/* 2. Customer Statistics Cards */}
            <CustomerStats statistics={statsData?.statistics} isLoading={isStatsLoading} />

            {/* 3. Search and Filters */}
            <CustomerFilters
                search={search}
                onSearchChange={(val) => {
                    setSearch(val);
                    setPage(1);
                }}
                status={status}
                onStatusChange={(val) => {
                    setStatus(val);
                    setPage(1);
                }}
                accountType={accountType}
                onAccountTypeChange={(val) => {
                    setAccountType(val);
                    setPage(1);
                }}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                onReset={handleResetFilters}
                onExportCsv={handleExportCsv}
            />

            {/* 4. Customer Directory Table */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-bold">Customer Directory</h2>
                    <span className="text-xs opacity-70">
                        {pagination.total} registered customer accounts
                    </span>
                </div>
                <CustomerTable
                    customers={customers}
                    pagination={pagination}
                    onPageChange={setPage}
                    onStatusChange={handleStatusChange}
                    onBlockCustomer={(cust) => setBlockCustomerTarget(cust)}
                    onUnblockCustomer={handleUnblock}
                />
            </div>

            {/* 5. Recent Customer Activity Feed */}
            <div className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-bold">Recent Customer Activity</h3>
                        <p className="text-xs opacity-70">Audit records of customer registrations, status changes, and AML alerts</p>
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
                                <span className={`h-2 w-2 rounded-full shrink-0 ${act.severity === 'Security' ? 'bg-rose-500' : 'bg-accent'}`} />
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

            {/* Modals */}
            <CustomerFormModal
                isOpen={isAddCustomerOpen}
                onClose={() => setIsAddCustomerOpen(false)}
                onSubmit={handleCreateCustomer}
                isSubmitting={isSubmitting}
            />

            <BlockCustomerDialog
                isOpen={!!blockCustomerTarget}
                customer={blockCustomerTarget}
                onClose={() => setBlockCustomerTarget(null)}
                onConfirm={handleConfirmBlock}
                isPending={isSubmitting}
            />
        </div>
    );
}
