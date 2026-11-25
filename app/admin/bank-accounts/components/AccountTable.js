'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AccountStatusBadge from './AccountStatusBadge';
import AccountTypeBadge from './AccountTypeBadge';
import { formatBDT } from '../../overview/DashboardCharts';
import {
    FiEye,
    FiLock,
    FiUnlock,
    FiSliders,
    FiMoreVertical,
} from 'react-icons/fi';
import Pagination from '@/app/components/Pagination';

export default function AccountTable({
    accounts = [],
    pagination = {},
    onPageChange,
    onFreezeAccount,
    onUnfreezeAccount,
    onManageLimits,
}) {
    const router = useRouter();
    const [actionMenuOpenId, setActionMenuOpenId] = useState(null);

    // Mask account number: e.g. •••• 1025
    const maskAccount = (num) => {
        if (!num) return '•••• ----';
        return `•••• ${num.slice(-4)}`;
    };

    return (
        <div className="rounded-xl border border-primary/20 bg-surface shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-primary/10 bg-primary/5 font-semibold opacity-75">
                            <th className="py-3 px-4">Account Number</th>
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Account Type</th>
                            <th className="py-3 px-4">Available Balance</th>
                            <th className="py-3 px-4">Account Status</th>
                            <th className="py-3 px-4">Opened Date</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10">
                        {accounts.length ? (
                            accounts.map((acc) => (
                                <tr
                                    key={acc._id || acc.accountNumber}
                                    className="hover:bg-primary/5 transition-colors group cursor-pointer"
                                    onClick={() => router.push(`/admin/bank-accounts/${acc._id || acc.accountNumber}`)}
                                >
                                    {/* Account Number */}
                                    <td className="py-3 px-4 font-mono font-bold tracking-wider text-accent text-xs">
                                        {maskAccount(acc.accountNumber)}
                                    </td>

                                    {/* Customer name and ID */}
                                    <td className="py-3 px-4">
                                        <div>
                                            <p className="font-semibold text-primary">{acc.customerName}</p>
                                            <p className="text-[11px] opacity-70 font-mono">{acc.customerId}</p>
                                        </div>
                                    </td>

                                    {/* Type */}
                                    <td className="py-3 px-4">
                                        <AccountTypeBadge type={acc.accountType || 'Savings'} />
                                    </td>

                                    {/* Available Balance */}
                                    <td className="py-3 px-4">
                                        <div className="font-bold text-accent">
                                            {formatBDT(acc.availableBalance || acc.balance || 0)}
                                        </div>
                                        {acc.heldAmount > 0 && (
                                            <div className="text-[10px] text-amber-600">
                                                (Held: {formatBDT(acc.heldAmount)})
                                            </div>
                                        )}
                                    </td>

                                    {/* Status */}
                                    <td className="py-3 px-4">
                                        <AccountStatusBadge status={acc.status || 'Active'} />
                                    </td>

                                    {/* Opened Date */}
                                    <td className="py-3 px-4 opacity-70">
                                        {new Date(acc.createdAt).toLocaleDateString()}
                                    </td>

                                    {/* Action Dropdown Menu */}
                                    <td
                                        className="py-3 px-4 text-right"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="relative inline-block text-left">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActionMenuOpenId(
                                                        actionMenuOpenId === acc._id ? null : acc._id
                                                    )
                                                }
                                                className="p-1 rounded-md hover:bg-primary/10 transition-colors cursor-pointer"
                                                title="Open Actions"
                                            >
                                                <FiMoreVertical className="h-4 w-4" />
                                            </button>

                                            {actionMenuOpenId === acc._id && (
                                                <div className="absolute right-0 top-8 z-30 w-44 rounded-lg border border-primary/20 bg-surface py-1 text-primary shadow-xl">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActionMenuOpenId(null);
                                                            router.push(`/admin/bank-accounts/${acc._id || acc.accountNumber}`);
                                                        }}
                                                        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-primary/10 font-medium cursor-pointer"
                                                    >
                                                        <FiEye className="h-3.5 w-3.5 text-accent" />
                                                        View Details
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActionMenuOpenId(null);
                                                            onManageLimits(acc);
                                                        }}
                                                        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-primary/10 font-medium cursor-pointer"
                                                    >
                                                        <FiSliders className="h-3.5 w-3.5 text-blue-600" />
                                                        Manage Limits
                                                    </button>

                                                    {acc.status === 'Active' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActionMenuOpenId(null);
                                                                onFreezeAccount(acc);
                                                            }}
                                                            className="flex w-full items-center gap-2 border-t border-primary/10 px-3 py-2 text-left hover:bg-primary/10 text-sky-700 font-medium cursor-pointer"
                                                        >
                                                            <FiLock className="h-3.5 w-3.5 text-sky-600" />
                                                            Freeze Account
                                                        </button>
                                                    ) : acc.status === 'Frozen' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActionMenuOpenId(null);
                                                                onUnfreezeAccount(acc);
                                                            }}
                                                            className="flex w-full items-center gap-2 border-t border-primary/10 px-3 py-2 text-left hover:bg-primary/10 text-emerald-600 font-medium cursor-pointer"
                                                        >
                                                            <FiUnlock className="h-3.5 w-3.5 text-emerald-600" />
                                                            Unfreeze Account
                                                        </button>
                                                    ) : null}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="py-8 text-center opacity-60">
                                    No bank accounts found matching the criteria.
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
                entityName="accounts"
            />
        </div>
    );
}
