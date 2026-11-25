'use client';

import { useState } from 'react';
import StaffStatusBadge from './StaffStatusBadge';
import {
    FiEye,
    FiEdit2,
    FiCheckCircle,
    FiUserX,
    FiKey,
    FiMoreVertical,
    FiChevronLeft,
    FiChevronRight,
} from 'react-icons/fi';

export default function StaffTable({
    staffList = [],
    pagination = {},
    onPageChange,
    onViewStaff,
    onEditStaff,
    onStatusChange,
    onResetPassword,
}) {
    const [actionMenuOpenId, setActionMenuOpenId] = useState(null);

    const getInitials = (name) => {
        if (!name) return 'ST';
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <div className="rounded-xl border border-primary/20 bg-surface shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-primary/10 bg-primary/5 font-semibold opacity-75">
                            <th className="py-3 px-4">Staff Member</th>
                            <th className="py-3 px-4">Employee ID</th>
                            <th className="py-3 px-4">Phone</th>
                            <th className="py-3 px-4">Department</th>
                            <th className="py-3 px-4">Joined Date</th>
                            <th className="py-3 px-4">Last Login</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10">
                        {staffList.length ? (
                            staffList.map((member) => (
                                <tr
                                    key={member._id || member.employeeId}
                                    className="hover:bg-primary/5 transition-colors group cursor-pointer"
                                    onClick={() => onViewStaff(member)}
                                >
                                    {/* Staff Name & Email */}
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-accent/20 text-accent font-bold grid place-items-center shrink-0">
                                                {getInitials(member.name)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-primary truncate">{member.name}</p>
                                                <p className="text-[11px] opacity-70 truncate">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Employee ID */}
                                    <td className="py-3 px-4 font-mono font-medium text-[11px]">
                                        {member.employeeId || 'STF-AUTO'}
                                    </td>

                                    {/* Phone */}
                                    <td className="py-3 px-4 opacity-80">{member.phone || 'N/A'}</td>

                                    {/* Department & Designation */}
                                    <td className="py-3 px-4">
                                        <div>
                                            <p className="font-medium">{member.department || 'General'}</p>
                                            <p className="text-[10px] opacity-60">{member.designation || 'Staff'}</p>
                                        </div>
                                    </td>

                                    {/* Joined Date */}
                                    <td className="py-3 px-4 opacity-70">
                                        {member.joiningDate
                                            ? new Date(member.joiningDate).toLocaleDateString()
                                            : new Date(member.createdAt).toLocaleDateString()}
                                    </td>

                                    {/* Last Login */}
                                    <td className="py-3 px-4 opacity-70">
                                        {member.lastLogin
                                            ? new Date(member.lastLogin).toLocaleTimeString([], {
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                                  month: 'short',
                                                  day: 'numeric',
                                              })
                                            : 'Never'}
                                    </td>

                                    {/* Status */}
                                    <td className="py-3 px-4">
                                        <StaffStatusBadge status={member.status || 'Active'} />
                                    </td>

                                    {/* Actions */}
                                    <td
                                        className="py-3 px-4 text-right"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="relative inline-block text-left">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActionMenuOpenId(
                                                        actionMenuOpenId === member._id ? null : member._id
                                                    )
                                                }
                                                className="p-1 rounded-md hover:bg-primary/10 transition-colors"
                                                title="Open Actions"
                                            >
                                                <FiMoreVertical className="h-4 w-4" />
                                            </button>

                                            {actionMenuOpenId === member._id && (
                                                <div className="absolute right-0 top-8 z-30 w-44 rounded-lg border border-primary/20 bg-surface py-1 text-primary shadow-xl">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActionMenuOpenId(null);
                                                            onViewStaff(member);
                                                        }}
                                                        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-primary/10 font-medium"
                                                    >
                                                        <FiEye className="h-3.5 w-3.5 text-accent" />
                                                        View Details
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActionMenuOpenId(null);
                                                            onEditStaff(member);
                                                        }}
                                                        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-primary/10 font-medium"
                                                    >
                                                        <FiEdit2 className="h-3.5 w-3.5 text-blue-600" />
                                                        Edit Profile
                                                    </button>

                                                    {member.status === 'Active' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActionMenuOpenId(null);
                                                                onStatusChange(member);
                                                            }}
                                                            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-primary/10 text-rose-600 font-medium"
                                                        >
                                                            <FiUserX className="h-3.5 w-3.5" />
                                                            Deactivate / Suspend
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActionMenuOpenId(null);
                                                                onStatusChange({
                                                                    ...member,
                                                                    targetStatus: 'Active',
                                                                });
                                                            }}
                                                            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-primary/10 text-emerald-600 font-medium"
                                                        >
                                                            <FiCheckCircle className="h-3.5 w-3.5" />
                                                            Activate Account
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActionMenuOpenId(null);
                                                            onResetPassword(member);
                                                        }}
                                                        className="flex w-full items-center gap-2 border-t border-primary/10 px-3 py-2 text-left hover:bg-primary/10 text-amber-700 font-medium"
                                                    >
                                                        <FiKey className="h-3.5 w-3.5 text-amber-600" />
                                                        Reset Password
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="py-8 text-center opacity-60">
                                    No staff records found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-primary/10 px-4 py-3 text-xs">
                    <span className="opacity-70">
                        Showing {(pagination.page - 1) * pagination.limit + 1} -{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} staff
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={pagination.page <= 1}
                            onClick={() => onPageChange(pagination.page - 1)}
                            className="p-1.5 rounded-md border border-primary/20 hover:bg-primary/10 disabled:opacity-40"
                        >
                            <FiChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="font-semibold">
                            {pagination.page} / {pagination.totalPages}
                        </span>
                        <button
                            type="button"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => onPageChange(pagination.page + 1)}
                            className="p-1.5 rounded-md border border-primary/20 hover:bg-primary/10 disabled:opacity-40"
                        >
                            <FiChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
