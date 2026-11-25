'use client';

import { useState, useEffect, useCallback } from 'react';
import TransactionStats from './components/TransactionStats';
import TransactionAnalytics from './components/TransactionAnalytics';
import TransactionFilters from './components/TransactionFilters';
import TransactionTable from './components/TransactionTable';
import TransactionDetailsDrawer from './components/TransactionDetailsDrawer';

export default function AdminTransactionsPage() {
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);
    const [loadingTable, setLoadingTable] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // Active tab: ALL, TRANSFER, DEPOSIT, WITHDRAWAL, LOAN, FLAGGED
    const [activeTab, setActiveTab] = useState('ALL');

    // Filters & Pagination state
    const [filters, setFilters] = useState({
        search: '',
        status: 'All',
        riskStatus: 'All',
        dateRange: 'All',
        account: '',
        initiatedBy: 'All',
        minAmount: '',
        maxAmount: ''
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });

    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Fetch Stats
    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            const res = await fetch('/api/admin/transactions/stats');
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoadingStats(false);
        }
    };

    // Fetch Analytics
    const fetchAnalytics = async () => {
        try {
            setLoadingAnalytics(true);
            const res = await fetch('/api/admin/transactions/analytics?days=30');
            const data = await res.json();
            if (data.success) {
                setAnalytics(data.analytics);
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        } finally {
            setLoadingAnalytics(false);
        }
    };

    // Fetch Transactions list
    const fetchTransactions = useCallback(async () => {
        try {
            setLoadingTable(true);
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                sortBy,
                sortOrder
            });

            if (filters.search) params.append('search', filters.search);
            if (filters.status && filters.status !== 'All') params.append('status', filters.status);
            if (filters.account) params.append('account', filters.account);
            if (filters.initiatedBy && filters.initiatedBy !== 'All') params.append('initiatedBy', filters.initiatedBy);
            if (filters.dateRange && filters.dateRange !== 'All') params.append('dateRange', filters.dateRange);

            // Handle Tab-specific filters
            if (activeTab === 'TRANSFER') {
                params.append('type', 'Transfer');
            } else if (activeTab === 'DEPOSIT') {
                params.append('type', 'Deposit');
            } else if (activeTab === 'WITHDRAWAL') {
                params.append('type', 'Withdrawal');
            } else if (activeTab === 'LOAN') {
                params.append('type', 'Loan Disbursement');
            } else if (activeTab === 'FLAGGED') {
                params.append('riskStatus', 'FLAGGED');
            } else if (filters.riskStatus && filters.riskStatus !== 'All') {
                params.append('riskStatus', filters.riskStatus);
            }

            const res = await fetch(`/api/admin/transactions?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setTransactions(data.transactions);
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination.total,
                    totalPages: data.pagination.totalPages
                }));
            }
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
        } finally {
            setLoadingTable(false);
        }
    }, [pagination.page, pagination.limit, sortBy, sortOrder, filters, activeTab]);

    useEffect(() => {
        fetchStats();
        fetchAnalytics();
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleApplyFilters = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchTransactions();
    };

    const handleResetFilters = () => {
        setFilters({
            search: '',
            status: 'All',
            riskStatus: 'All',
            dateRange: 'All',
            account: '',
            initiatedBy: 'All',
            minAmount: '',
            maxAmount: ''
        });
        setActiveTab('ALL');
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (filters.status && filters.status !== 'All') params.append('status', filters.status);
        if (activeTab === 'FLAGGED') params.append('riskStatus', 'FLAGGED');
        window.open(`/api/admin/transactions/export?${params.toString()}`, '_blank');
    };

    const handleRefresh = () => {
        fetchStats();
        fetchAnalytics();
        fetchTransactions();
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-surface/20">
                <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">Transactions</h1>
                    <p className="text-xs text-foreground/60 mt-1">
                        Monitor, review and investigate all banking transactions across the institution.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="px-3.5 py-2 rounded-lg bg-surface/30 hover:bg-surface/50 text-foreground text-xs font-semibold border border-surface/20 transition-colors flex items-center gap-1.5"
                    >
                        <svg className="w-4 h-4 text-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                    <button
                        type="button"
                        onClick={handleExport}
                        className="px-4 py-2 rounded-lg bg-primary hover:bg-secondary text-surface text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
                    >
                        <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export Transactions
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <TransactionStats stats={stats} loading={loadingStats} />

            {/* Analytics Visualizations */}
            <TransactionAnalytics analytics={analytics} loading={loadingAnalytics} />

            {/* Search, Filter & Tabs Toolbar */}
            <TransactionFilters
                filters={filters}
                onChange={handleFilterChange}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setPagination(prev => ({ ...prev, page: 1 }));
                }}
                counts={{ flagged: stats?.flagged }}
            />

            {/* Transactions Full-Width Data Table */}
            <TransactionTable
                transactions={transactions}
                loading={loadingTable}
                onSelectTransaction={(tx) => setSelectedTransaction(tx)}
                pagination={pagination}
                onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
                onLimitChange={(newLimit) => setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }))}
                onSort={handleSort}
                sortBy={sortBy}
                sortOrder={sortOrder}
            />

            {/* Transaction Detail & Investigation Drawer */}
            {selectedTransaction && (
                <TransactionDetailsDrawer
                    transaction={selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                    onFlagUpdated={() => {
                        fetchStats();
                        fetchTransactions();
                        setSelectedTransaction(null);
                    }}
                    onNoteAdded={() => {
                        fetchTransactions();
                    }}
                />
            )}
        </div>
    );
}
