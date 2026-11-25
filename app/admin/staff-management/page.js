'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    FiUserPlus,
    FiExternalLink,
    FiCheckCircle,
    FiAlertCircle,
    FiKey,
} from 'react-icons/fi';

import StaffStats from './components/StaffStats';
import StaffFilters from './components/StaffFilters';
import StaffTable from './components/StaffTable';
import StaffFormModal from './components/StaffFormModal';
import StaffProfileDrawer from './components/StaffProfileDrawer';
import DeactivateStaffDialog from './components/DeactivateStaffDialog';

export default function StaffManagementPage() {
    // Filter & Pagination States
    const [search, setSearch] = useState('');
    const [department, setDepartment] = useState('All');
    const [status, setStatus] = useState('All');
    const [sortBy, setSortBy] = useState('createdAt');
    const [page, setPage] = useState(1);
    const limit = 10;

    // Modals & Drawers
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedStaffForEdit, setSelectedStaffForEdit] = useState(null);
    const [selectedStaffForView, setSelectedStaffForView] = useState(null);
    const [deactivateStaffTarget, setDeactivateStaffTarget] = useState(null);

    // Notifications & Messages
    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const [resetPwNotice, setResetPwNotice] = useState(null);

    // Data States
    const [statsData, setStatsData] = useState(null);
    const [isStatsLoading, setIsStatsLoading] = useState(true);
    const [staffData, setStaffData] = useState(null);
    const [isStaffLoading, setIsStaffLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isStatusUpdating, setIsStatusUpdating] = useState(false);

    // Fetch Stats
    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/staff/statistics');
            if (res.ok) {
                const json = await res.json();
                setStatsData(json);
            }
        } catch (err) {
            console.error('Fetch staff stats error:', err);
        } finally {
            setIsStatsLoading(false);
        }
    }, []);

    // Fetch Staff Directory
    const fetchStaff = useCallback(async () => {
        setIsStaffLoading(true);
        try {
            const query = new URLSearchParams({
                search,
                department,
                status,
                sortBy,
                page: String(page),
                limit: String(limit),
            });
            const res = await fetch(`/api/admin/staff?${query.toString()}`);
            if (res.ok) {
                const json = await res.json();
                setStaffData(json);
            }
        } catch (err) {
            console.error('Fetch staff list error:', err);
        } finally {
            setIsStaffLoading(false);
        }
    }, [search, department, status, sortBy, page, limit]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    const staffList = staffData?.staff || [];
    const pagination = staffData?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };
    const recentActivities = statsData?.recentActivities || [];

    // Handlers
    const handleResetFilters = () => {
        setSearch('');
        setDepartment('All');
        setStatus('All');
        setSortBy('createdAt');
        setPage(1);
    };

    const handleExportCsv = () => {
        if (!staffList.length) return;
        const headers = ['Employee ID', 'Name', 'Email', 'Phone', 'Department', 'Designation', 'Status', 'Joining Date'];
        const rows = staffList.map((s) => [
            s.employeeId,
            `"${s.name}"`,
            s.email,
            s.phone || '',
            `"${s.department}"`,
            `"${s.designation}"`,
            s.status,
            s.joiningDate ? new Date(s.joiningDate).toLocaleDateString() : '',
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `nestbank-staff-directory-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleOpenCreateModal = () => {
        setSelectedStaffForEdit(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (staff) => {
        setSelectedStaffForEdit(staff);
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        setFeedback({ type: '', message: '' });
        setIsCreating(true);
        try {
            if (selectedStaffForEdit) {
                const res = await fetch(`/api/admin/staff/${selectedStaffForEdit._id || selectedStaffForEdit.employeeId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || 'Update failed');
                setFeedback({ type: 'success', message: json.message || 'Staff profile updated successfully.' });
            } else {
                const res = await fetch('/api/admin/staff', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || 'Creation failed');
                setFeedback({ type: 'success', message: `Staff account provisioned for ${json.staff.name} (${json.staff.employeeId}).` });
            }
            setIsFormModalOpen(false);
            setSelectedStaffForEdit(null);
            fetchStaff();
            fetchStats();
        } catch (err) {
            setFeedback({ type: 'error', message: err.message || 'Operation failed. Please try again.' });
        } finally {
            setIsCreating(false);
        }
    };

    const handleStatusAction = async (target) => {
        if (target.targetStatus === 'Active') {
            setIsStatusUpdating(true);
            try {
                const res = await fetch(`/api/admin/staff/${target._id || target.employeeId}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'Active', reason: 'Admin reactivation' }),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.message);
                setFeedback({ type: 'success', message: json.message });
                if (selectedStaffForView?._id === target._id) {
                    setSelectedStaffForView({ ...selectedStaffForView, status: 'Active' });
                }
                fetchStaff();
                fetchStats();
            } catch (err) {
                setFeedback({ type: 'error', message: err.message || 'Activation failed' });
            } finally {
                setIsStatusUpdating(false);
            }
        } else {
            setDeactivateStaffTarget(target);
        }
    };

    const handleConfirmDeactivation = async ({ id, status, reason }) => {
        setIsStatusUpdating(true);
        try {
            const res = await fetch(`/api/admin/staff/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, reason }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message);
            setFeedback({ type: 'success', message: json.message });
            setDeactivateStaffTarget(null);
            if (selectedStaffForView?._id === id) {
                setSelectedStaffForView({ ...selectedStaffForView, status });
            }
            fetchStaff();
            fetchStats();
        } catch (err) {
            setFeedback({ type: 'error', message: err.message || 'Failed to change status' });
        } finally {
            setIsStatusUpdating(false);
        }
    };

    const handleResetPassword = async (staff) => {
        if (!confirm(`Are you sure you want to reset the password for ${staff.name}?`)) return;
        try {
            const res = await fetch(`/api/admin/staff/${staff._id || staff.employeeId}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message);
            setResetPwNotice({
                name: staff.name,
                employeeId: staff.employeeId,
                tempPassword: json.tempPassword,
            });
        } catch (err) {
            setFeedback({ type: 'error', message: err.message || 'Password reset failed' });
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 text-primary">
            {/* 1. Header with [+ Add New Staff] */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Staff Management</h1>
                    <p className="mt-1 text-sm opacity-75">
                        Manage internal bank employees, assign operational departments, and oversee system access.
                    </p>
                </div>
                <div>
                    <button
                        type="button"
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-xs font-semibold text-white hover:bg-secondary transition-colors shadow-sm cursor-pointer"
                    >
                        <FiUserPlus className="h-4 w-4" />
                        <span>+ Add New Staff</span>
                    </button>
                </div>
            </div>

            {/* Notification / Alert Banners */}
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

            {/* Password Reset Modal Banner */}
            {resetPwNotice && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-800 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                        <FiKey className="h-4 w-4" />
                        <span>Password Reset Generated for {resetPwNotice.name} ({resetPwNotice.employeeId})</span>
                    </div>
                    <p>
                        Temporary Password:{' '}
                        <code className="bg-white/60 px-2 py-0.5 rounded font-mono font-bold text-primary select-all">
                            {resetPwNotice.tempPassword}
                        </code>
                    </p>
                    <p className="text-[11px] opacity-80">
                        Please copy and transmit this temporary password to the staff member securely. They will be required to change it on next login.
                    </p>
                    <button
                        type="button"
                        onClick={() => setResetPwNotice(null)}
                        className="rounded bg-amber-600 px-3 py-1 font-semibold text-white hover:bg-amber-700 text-[11px] cursor-pointer"
                    >
                        I have recorded this password
                    </button>
                </div>
            )}

            {/* 2. Staff Overview Cards */}
            <StaffStats statistics={statsData?.statistics} isLoading={isStatsLoading} />

            {/* 3. Search and Filters */}
            <StaffFilters
                search={search}
                onSearchChange={(val) => {
                    setSearch(val);
                    setPage(1);
                }}
                department={department}
                onDepartmentChange={(val) => {
                    setDepartment(val);
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

            {/* 4. Staff Directory Table */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-bold">Staff Directory</h2>
                    <span className="text-xs opacity-70">
                        {pagination.total} staff members registered
                    </span>
                </div>
                <StaffTable
                    staffList={staffList}
                    pagination={pagination}
                    onPageChange={setPage}
                    onViewStaff={(member) => setSelectedStaffForView(member)}
                    onEditStaff={handleOpenEditModal}
                    onStatusChange={handleStatusAction}
                    onResetPassword={handleResetPassword}
                />
            </div>

            {/* 5. Recent Staff Activity Feed */}
            <div className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-bold">Recent Staff Activity</h3>
                        <p className="text-xs opacity-70">Audit trail of actions conducted by bank staff employees</p>
                    </div>
                    <Link
                        href="/admin/audit-logs"
                        className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                    >
                        View All Audit Logs <FiExternalLink className="h-3.5 w-3.5" />
                    </Link>
                </div>

                <div className="divide-y divide-primary/10">
                    {recentActivities.slice(0, 6).map((act, idx) => (
                        <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-3">
                                <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
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

            {/* Modals and Drawers */}
            <StaffFormModal
                isOpen={isFormModalOpen}
                staff={selectedStaffForEdit}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setSelectedStaffForEdit(null);
                }}
                onSubmit={handleFormSubmit}
                isSubmitting={isCreating}
            />

            <StaffProfileDrawer
                isOpen={!!selectedStaffForView}
                staff={selectedStaffForView}
                onClose={() => setSelectedStaffForView(null)}
                onEdit={(staff) => {
                    setSelectedStaffForView(null);
                    handleOpenEditModal(staff);
                }}
                onStatusChange={handleStatusAction}
                onResetPassword={handleResetPassword}
            />

            <DeactivateStaffDialog
                isOpen={!!deactivateStaffTarget}
                staff={deactivateStaffTarget}
                onClose={() => setDeactivateStaffTarget(null)}
                onConfirm={handleConfirmDeactivation}
                isPending={isStatusUpdating}
            />
        </div>
    );
}
