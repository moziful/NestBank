'use client';

import { useState, useEffect, useCallback } from 'react';
import ApprovalStats from '@/app/admin/approvals/components/ApprovalStats';
import ApprovalFilters from '@/app/admin/approvals/components/ApprovalFilters';
import ApprovalTable from '@/app/admin/approvals/components/ApprovalTable';
import ApprovalDetailsDrawer from '@/app/admin/approvals/components/ApprovalDetailsDrawer';
import { FiCheckCircle, FiSend } from 'react-icons/fi';

export default function StaffRequestsPage() {
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

    const [forwardMessage, setForwardMessage] = useState('');

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
                setItems(data.items || []);
                if (data.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        total: data.pagination.total,
                        totalPages: data.pagination.totalPages
                    }));
                }
            }
        } catch (err) {
            console.error('Failed to fetch requests:', err);
        } finally {
            setLoadingTable(false);
        }
    }, [activeTab, search, status, priority, pagination.page, pagination.limit]);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleRowClick = (item) => {
        setSelectedItem(item);
        setSelectedItemType(item.itemType || (item.loanId ? 'LOAN' : 'BANKING'));
    };

    const handleForwardToAdmin = async (item, notes) => {
        try {
            const res = await fetch('/api/staff/requests/forward', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: item._id || item.requestId,
                    notes: notes || 'Forwarded to Admin by Bank Staff'
                })
            });
            const data = await res.json();
            if (data.success) {
                setForwardMessage('Request successfully forwarded to Admin desk.');
                setSelectedItem(null);
                fetchRequests();
                fetchStats();
                setTimeout(() => setForwardMessage(''), 4000);
            }
        } catch (err) {
            console.error('Failed to forward request:', err);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 text-primary">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-primary">Pending Customer Requests</h1>
                <p className="text-sm text-primary/70">
                    Verify deposit and withdrawal requests, inspect accounts, and forward high-value cases to Admin.
                </p>
            </div>

            {forwardMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600 border border-emerald-500/20">
                    <FiCheckCircle className="h-4 w-4" />
                    <span>{forwardMessage}</span>
                </div>
            )}

            <ApprovalStats stats={stats} loading={loadingStats} />

            <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
                <ApprovalFilters
                    activeTab={activeTab}
                    setActiveTab={(tab) => {
                        setActiveTab(tab);
                        setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    search={search}
                    setSearch={setSearch}
                    status={status}
                    setStatus={(st) => {
                        setStatus(st);
                        setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    priority={priority}
                    setPriority={(pr) => {
                        setPriority(pr);
                        setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    onSearchSubmit={fetchRequests}
                />

                <ApprovalTable
                    items={items}
                    loading={loadingTable}
                    pagination={pagination}
                    onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))}
                    onRowClick={handleRowClick}
                />
            </div>

            {selectedItem && (
                <div className="relative">
                    <ApprovalDetailsDrawer
                        item={selectedItem}
                        itemType={selectedItemType}
                        onClose={() => setSelectedItem(null)}
                        onActionSuccess={() => {
                            setSelectedItem(null);
                            fetchRequests();
                            fetchStats();
                        }}
                    />
                </div>
            )}
        </div>
    );
}
