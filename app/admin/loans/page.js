'use client';

import { useState, useEffect, useCallback } from 'react';
import LoanKPICards from './components/LoanKPICards';
import LoanTable from './components/LoanTable';
import DisbursementModal from './components/DisbursementModal';

export default function AdminLoanManagementPage() {
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingLoans, setLoadingLoans] = useState(true);
    const [loans, setLoans] = useState([]);
    const [activeTab, setActiveTab] = useState('ALL');
    const [search, setSearch] = useState('');
    const [loanType, setLoanType] = useState('All');
    const [disburseLoan, setDisburseLoan] = useState(null);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });

    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            const res = await fetch('/api/admin/loans/stats');
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Failed to fetch loan stats:', err);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchLoans = useCallback(async () => {
        try {
            setLoadingLoans(true);
            const params = new URLSearchParams({
                tab: activeTab,
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });

            if (search) params.append('search', search);
            if (loanType && loanType !== 'All') params.append('loanType', loanType);

            const res = await fetch(`/api/admin/loans?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setLoans(data.loans);
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination.total,
                    totalPages: data.pagination.totalPages
                }));
            }
        } catch (err) {
            console.error('Failed to fetch loans:', err);
        } finally {
            setLoadingLoans(false);
        }
    }, [activeTab, pagination.page, pagination.limit, search, loanType]);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchLoans();
    }, [fetchLoans]);

    const tabs = [
        { id: 'ALL', label: 'All Loans' },
        { id: 'PENDING_DISBURSEMENT', label: 'Pending Disbursement', count: stats?.pendingDisbursement },
        { id: 'ACTIVE', label: 'Active Loans', count: stats?.activeLoans },
        { id: 'OVERDUE', label: 'Overdue Loans', count: stats?.overdueLoans },
        { id: 'COMPLETED', label: 'Completed Loans', count: stats?.completedLoans },
    ];

    const handleDisbursed = () => {
        setDisburseLoan(null);
        fetchStats();
        fetchLoans();
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-primary/10">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Loan Management</h1>
                    <p className="text-xs opacity-60 mt-1">
                        Monitor active loan portfolios, execute disbursements, and supervise installment schedules.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            fetchStats();
                            fetchLoans();
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
            <LoanKPICards stats={stats} loading={loadingStats} />

            {/* Filters Toolbar */}
            <div className="bg-surface border border-primary/20 rounded-xl p-4 shadow-sm space-y-4">
                {/* Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-primary/10">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                                    isActive
                                        ? 'bg-accent text-surface shadow'
                                        : 'opacity-70 hover:opacity-100 hover:bg-primary/5'
                                }`}
                            >
                                {tab.label}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                        isActive ? 'bg-surface text-primary' : 'bg-primary/15'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="lg:col-span-2 relative">
                        <input
                            type="text"
                            placeholder="Search by Loan ID, Application, Customer, or Account..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-background border border-primary/20 focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                        <svg className="w-4 h-4 absolute left-3 top-2.5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div>
                        <select
                            value={loanType}
                            onChange={(e) => {
                                setLoanType(e.target.value);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-primary/20 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                        >
                            <option value="All">All Loan Types</option>
                            <option value="Personal Loan">Personal Loan</option>
                            <option value="Education Loan">Education Loan</option>
                            <option value="Home Loan">Home Loan</option>
                            <option value="Business Loan">Business Loan</option>
                        </select>
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                setLoanType('All');
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            className="w-full py-2 rounded-lg border border-primary/20 hover:bg-primary/5 text-xs font-semibold cursor-pointer transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Loans Table */}
            <LoanTable
                loans={loans}
                loading={loadingLoans}
                pagination={pagination}
                onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))}
                onOpenDisburseModal={(l) => setDisburseLoan(l)}
            />

            {/* Disbursement Modal */}
            {disburseLoan && (
                <DisbursementModal
                    loan={disburseLoan}
                    onClose={() => setDisburseLoan(null)}
                    onDisbursed={handleDisbursed}
                />
            )}
        </div>
    );
}
