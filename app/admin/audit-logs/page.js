'use client';

import { useState, useEffect, useCallback } from 'react';
import AuditStats from './components/AuditStats';
import AuditAnalytics from './components/AuditAnalytics';
import AuditFilters from './components/AuditFilters';
import AuditLogTable from './components/AuditLogTable';
import AuditLogDetailsDrawer from './components/AuditLogDetailsDrawer';

export default function AdminAuditLogsPage() {
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);
    const [loadingTable, setLoadingTable] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null);

    // Filter states
    const [activeTab, setActiveTab] = useState('ALL');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [severity, setSeverity] = useState('All');
    const [outcome, setOutcome] = useState('All');
    const [dateRange, setDateRange] = useState('All');

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });

    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            const res = await fetch('/api/admin/audit-logs/stats');
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Failed to fetch audit stats:', err);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            setLoadingAnalytics(true);
            const res = await fetch('/api/admin/audit-logs/analytics?days=30');
            const data = await res.json();
            if (data.success) {
                setAnalytics(data.analytics);
            }
        } catch (err) {
            console.error('Failed to fetch audit analytics:', err);
        } finally {
            setLoadingAnalytics(false);
        }
    };

    const fetchLogs = useCallback(async () => {
        try {
            setLoadingTable(true);
            const params = new URLSearchParams({
                tab: activeTab,
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });

            if (search) params.append('search', search);
            if (category && category !== 'All') params.append('category', category);
            if (severity && severity !== 'All') params.append('severity', severity);
            if (outcome && outcome !== 'All') params.append('outcome', outcome);
            if (dateRange && dateRange !== 'All') params.append('dateRange', dateRange);

            const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setLogs(data.logs);
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination.total,
                    totalPages: data.pagination.totalPages
                }));
            }
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
        } finally {
            setLoadingTable(false);
        }
    }, [activeTab, pagination.page, pagination.limit, search, category, severity, outcome, dateRange]);

    useEffect(() => {
        fetchStats();
        fetchAnalytics();
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleResetFilters = () => {
        setSearch('');
        setCategory('All');
        setSeverity('All');
        setOutcome('All');
        setDateRange('All');
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleExport = () => {
        window.open('/api/admin/audit-logs/export', '_blank');
        // Refresh to see export audit log record
        setTimeout(() => {
            fetchStats();
            fetchLogs();
        }, 1200);
    };

    const handleRefresh = () => {
        fetchStats();
        fetchAnalytics();
        fetchLogs();
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-primary/10">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Audit Logs</h1>
                    <p className="text-xs opacity-60 mt-1">
                        Track administrative actions, system operations, and institutional security events.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="px-3.5 py-2 rounded-lg border border-primary/20 hover:bg-primary/5 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                        <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                    <button
                        type="button"
                        onClick={handleExport}
                        className="px-4 py-2 rounded-lg bg-accent text-white hover:opacity-90 text-xs font-semibold shadow transition-opacity flex items-center gap-1.5 cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export Logs (CSV)
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <AuditStats stats={stats} loading={loadingStats} />

            {/* Visual Analytics */}
            <AuditAnalytics analytics={analytics} loading={loadingAnalytics} />

            {/* Filters Toolbar */}
            <AuditFilters
                activeTab={activeTab}
                onTabChange={handleTabChange}
                search={search}
                onSearchChange={(v) => {
                    setSearch(v);
                    setPagination(prev => ({ ...prev, page: 1 }));
                }}
                category={category}
                onCategoryChange={(v) => {
                    setCategory(v);
                    setPagination(prev => ({ ...prev, page: 1 }));
                }}
                severity={severity}
                onSeverityChange={(v) => {
                    setSeverity(v);
                    setPagination(prev => ({ ...prev, page: 1 }));
                }}
                outcome={outcome}
                onOutcomeChange={(v) => {
                    setOutcome(v);
                    setPagination(prev => ({ ...prev, page: 1 }));
                }}
                dateRange={dateRange}
                onDateRangeChange={(v) => {
                    setDateRange(v);
                    setPagination(prev => ({ ...prev, page: 1 }));
                }}
                onReset={handleResetFilters}
                counts={stats}
            />

            {/* Audit Logs Table */}
            <AuditLogTable
                logs={logs}
                loading={loadingTable}
                pagination={pagination}
                onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))}
                onSelectLog={(log) => setSelectedLog(log)}
            />

            {/* Audit Event Details Drawer */}
            {selectedLog && (
                <AuditLogDetailsDrawer
                    log={selectedLog}
                    onClose={() => setSelectedLog(null)}
                />
            )}
        </div>
    );
}
