'use client';

import { useState, useEffect, useCallback } from 'react';
import ApprovalStats from './components/ApprovalStats';
import ApprovalFilters from './components/ApprovalFilters';
import ApprovalTable from './components/ApprovalTable';
import ApprovalDetailsDrawer from './components/ApprovalDetailsDrawer';

export default function AdminApprovalsPage() {
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingTable, setLoadingTable] = useState(true);
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedItemType, setSelectedItemType] = useState('BANKING');

    // Tabs: ALL, DEPOSIT, WITHDRAWAL, LOAN, HISTORY
    const [activeTab, setActiveTab] = useState('ALL');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('All');
    const [priority, setPriority] = useState('All');

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });

    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            const res = await fetch('/api/admin/approvals/stats');
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Failed to fetch approval stats:', err);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchRequests = useCallback(async () => {
        try {
            setLoadingTable(true);
            const params = new URLSearchParams({
                tab: activeTab,
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });

            if (search) params.append('search', search);
            if (status && status !== 'All') params.append('status', status);
            if (priority && priority !== 'All') params.append('priority', priority);

            const res = await fetch(`/api/admin/approvals?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setItems(data.items);
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination.total,
                    totalPages: data.pagination.totalPages
                }));
            }
        } catch (err) {
            console.error('Failed to fetch approval items:', err);
        } finally {
            setLoadingTable(false);
        }
    }, [activeTab, pagination.page, pagination.limit, search, status, priority]);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatus('All');
        setPriority('All');
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleDecisionSuccess = () => {
        setSelectedItem(null);
        fetchStats();
        fetchRequests();
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-primary/10">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Approvals</h1>
                    <p className="text-xs opacity-60 mt-1">
                        Review, verify, and decide pending deposits, withdrawals, and credit underwriting applications.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            fetchStats();
                            fetchRequests();
                        }}
                        className="px-3.5 py-2 rounded-lg border border-primary/20 hover:bg-primary/5 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                        <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <ApprovalStats stats={stats} loading={loadingStats} />

            {/* Tabs & Search Toolbar */}
            <ApprovalFilters
                activeTab={activeTab}
                onTabChange={handleTabChange}
                search={search}
                onSearchChange={(val) => {
                    setSearch(val);
                    setPagination(prev => ({ ...prev, page: 1 }));
                }}
                status={status}
                onStatusChange={setStatus}
                priority={priority}
                onPriorityChange={setPriority}
                onReset={handleResetFilters}
                counts={stats}
            />

            {/* Requests Table */}
            <ApprovalTable
                items={items}
                activeTab={activeTab}
                loading={loadingTable}
                pagination={pagination}
                onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))}
                onSelectRequest={(item, type) => {
                    setSelectedItem(item);
                    setSelectedItemType(type);
                }}
            />

            {/* Decision Drawer */}
            {selectedItem && (
                <ApprovalDetailsDrawer
                    item={selectedItem}
                    itemType={selectedItemType}
                    onClose={() => setSelectedItem(null)}
                    onDecisionSuccess={handleDecisionSuccess}
                />
            )}
        </div>
    );
}
