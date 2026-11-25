'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomerStatusBadge from './CustomerStatusBadge';
import { formatBDT } from '../../overview/DashboardCharts';
import {
    FiEye,
    FiCheckCircle,
    FiUserX,
    FiShield,
    FiMoreVertical,
} from 'react-icons/fi';
import Pagination from '@/app/components/Pagination';

export default function CustomerTable({
    customers = [],
    pagination = {},
    onPageChange,
    onStatusChange,
    onBlockCustomer,
    onUnblockCustomer,
}) {
    const router = useRouter();
    const [actionMenuOpenId, setActionMenuOpenId] = useState(null);

    const getInitials = (name) => {
        if (!name) return 'CU';
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
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Customer ID</th>
                            <th className="py-3 px-4">Phone</th>
                            <th className="py-3 px-4">Accounts</th>
                            <th className="py-3 px-4">Total Balance</th>
                            <th className="py-3 px-4">Joined Date</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10">
                        {customers.length ? (
                            customers.map((c) => (
                                <tr
                                    key={c._id || c.customerId}
                                    className="hover:bg-primary/5 transition-colors group cursor-pointer"
                                    onClick={() => router.push(`/admin/customers/${c._id || c.customerId}`)}
                                >
                                    {/* Customer profile initials & name */}
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-accent/20 text-accent font-bold grid place-items-center shrink-0">
                                                {getInitials(c.name)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-primary truncate">{c.name}</p>
                                                <p className="text-[11px] opacity-70 truncate">{c.email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Customer ID */}
                                    <td className="py-3 px-4 font-mono font-medium text-[11px]">
                                        {c.customerId || 'CUS-AUTO'}
                                    </td>

                                    {/* Phone */}
                                    <td className="py-3 px-4 opacity-80">{c.phone || 'N/A'}</td>

                                    {/* Accounts Count & Types */}
                                    <td className="py-3 px-4">
                                        <span className="font-semibold">{c.accountCount || (c.accounts?.length || 1)}</span>
                                        <span className="opacity-60 ml-1">account{c.accountCount > 1 ? 's' : ''}</span>
                                    </td>

                                    {/* Total Balance */}
                                    <td className="py-3 px-4 font-bold text-accent">
                                        {formatBDT(c.totalBalance || 0)}
                                    </td>

                                    {/* Joined Date */}
                                    <td className="py-3 px-4 opacity-70">
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </td>

                                    {/* Status Badge */}
                                    <td className="py-3 px-4">
                                        <CustomerStatusBadge status={c.status || 'Active'} />
                                    </td>

                                    {/* Action dropdown menu */}
                                    <td
                                        className="py-3 px-4 text-right"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="relative inline-block text-left">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActionMenuOpenId(
                                                        actionMenuOpenId === c._id ? null : c._id
                                                    )
                                                }
                                                className="p-1 rounded-md hover:bg-primary/10 transition-colors cursor-pointer"
                                                title="Open Actions"
                                            >
                                                <FiMoreVertical className="h-4 w-4" />
                                            </button>

                                            {actionMenuOpenId === c._id && (
                                                <div className="absolute right-0 top-8 z-30 w-48 rounded-lg border border-primary/20 bg-surface py-1 text-primary shadow-xl">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActionMenuOpenId(null);
                                                            router.push(`/admin/customers/${c._id || c.customerId}`);
                                                        }}
                                                        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-primary/10 font-medium cursor-pointer"
                                                    >
                                                        <FiEye className="h-3.5 w-3.5 text-accent" />
                                                        View Full Profile
                                                    </button>

                                                    {c.status === 'Active' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActionMenuOpenId(null);
                                                                onStatusChange(c, 'Inactive');
                                                            }}
                                                            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-primary/10 text-zinc-700 font-medium cursor-pointer"
                                                        >
                                                            <FiUserX className="h-3.5 w-3.5" />
                                                            Deactivate Customer
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActionMenuOpenId(null);
                                                                c.status === 'Blocked'
                                                                    ? onUnblockCustomer(c)
                                                                    : onStatusChange(c, 'Active');
                                                            }}
                                                            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-primary/10 text-emerald-600 font-medium cursor-pointer"
                                                        >
                                                            <FiCheckCircle className="h-3.5 w-3.5" />
                                                            Activate Customer
                                                        </button>
                                                    )}

                                                    {c.status !== 'Blocked' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActionMenuOpenId(null);
                                                                onBlockCustomer(c);
                                                            }}
                                                            className="flex w-full items-center gap-2 border-t border-primary/10 px-3 py-2 text-left hover:bg-primary/10 text-rose-600 font-medium cursor-pointer"
                                                        >
                                                            <FiShield className="h-3.5 w-3.5 text-rose-600" />
                                                            Block Customer (AML)
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="py-8 text-center opacity-60">
                                    No customer records found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <Pagination
                pagination={pagination}
                onPageChange={onPageChange}
                entityName="customers"
            />
        </div>
    );
}
