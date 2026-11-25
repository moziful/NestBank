'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    FiFileText,
    FiSearch,
    FiFilter,
    FiCheckCircle,
    FiClock,
    FiAlertCircle,
    FiSend,
} from 'react-icons/fi';
import LoanKPICards from '@/app/admin/loans/components/LoanKPICards';
import LoanTable from '@/app/admin/loans/components/LoanTable';

export default function StaffLoanApplicationsPage() {
    const [loans, setLoans] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');
    const [search, setSearch] = useState('');
    const [loanType, setLoanType] = useState('ALL');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/loans/stats');
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Failed to fetch loan stats:', err);
        }
    };

    const fetchLoans = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                status: activeTab,
                loanType,
                search
            });

            const res = await fetch(`/api/admin/loans?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setLoans(data.loans || []);
                if (data.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        total: data.pagination.total,
                        totalPages: data.pagination.totalPages
                    }));
                }
            }
        } catch (err) {
            console.error('Failed to fetch loans:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab, loanType, search, pagination.page, pagination.limit]);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchLoans();
    }, [fetchLoans]);

    const tabs = [
        { id: 'ALL', label: 'All Applications' },
        { id: 'Pending', label: 'Pending Verification' },
        { id: 'Under Review', label: 'Under Review' },
        { id: 'Approved', label: 'Sanctioned' },
        { id: 'Active', label: 'Active Loans' },
        { id: 'Overdue', label: 'Overdue' },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 text-primary">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Loan Applications Desk</h1>
                    <p className="text-sm text-primary/70">
                        Review customer credit applications, verify submitted documents, and forward files to Admin for underwriting sanction.
                    </p>
                </div>
            </div>

            {/* Portfolio KPI Cards */}
            <LoanKPICards stats={stats} />

            {/* Applications Desk Container */}
            <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm space-y-4">
                {/* Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-primary/10 pb-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                                setActiveTab(tab.id);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === tab.id
                                    ? 'bg-accent text-white shadow-sm'
                                    : 'text-primary/70 hover:bg-primary/5 hover:text-primary'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[240px]">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search by customer name, account #, or loan ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                    fetchLoans();
                                }
                            }}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-primary/20 bg-primary/5 text-primary focus:outline-none focus:border-accent"
                        />
                    </div>

                    <select
                        value={loanType}
                        onChange={(e) => {
                            setLoanType(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="px-3 py-2 text-sm rounded-lg border border-primary/20 bg-primary/5 text-primary focus:outline-none focus:border-accent"
                    >
                        <option value="ALL">All Loan Types</option>
                        <option value="Personal Loan">Personal Loan</option>
                        <option value="Home Loan">Home Loan</option>
                        <option value="Business Loan">Business Loan</option>
                        <option value="Auto Loan">Auto Loan</option>
                        <option value="Education Loan">Education Loan</option>
                    </select>
                </div>

                {/* Shared Loan Table with Staff BasePath and no direct disbursement authorization */}
                <LoanTable
                    loans={loans}
                    loading={loading}
                    pagination={pagination}
                    basePath="/staff/loan-applications"
                    permissions={{ canDisburse: false }}
                    onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))}
                    onOpenDisburseModal={() => { }}
                />
            </div>
        </div>
    );
}
