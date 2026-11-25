'use client';

import { useState } from 'react';
import { FiShield, FiAlertTriangle, FiX } from 'react-icons/fi';

export default function BlockCustomerDialog({ isOpen, customer, onClose, onConfirm, isPending }) {
    const [reason, setReason] = useState('Suspicious transaction activity');
    const [freezeAccounts, setFreezeAccounts] = useState(true);

    if (!isOpen || !customer) return null;

    const handleConfirm = () => {
        onConfirm({
            id: customer._id || customer.customerId,
            reason,
            freezeAccounts,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-rose-500/30 bg-surface p-6 shadow-2xl text-primary animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                    <div className="flex items-center gap-2.5 text-rose-600 font-bold">
                        <FiShield className="h-5 w-5" />
                        <span>Block Customer Account</span>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 rounded hover:bg-primary/10">
                        <FiX className="h-4 w-4" />
                    </button>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                    <p className="opacity-80">
                        Restrict <strong className="text-primary">{customer.name} ({customer.customerId})</strong> from all banking access. This triggers an official security investigation record.
                    </p>

                    <div>
                        <label className="block font-semibold mb-1">Reason for blocking *</label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full rounded-lg border border-primary/20 bg-white/20 p-2 outline-none focus:border-rose-500 text-xs font-medium"
                        >
                            <option value="Suspicious transaction activity">Suspicious transaction activity</option>
                            <option value="AML / Sanctions list alert">AML / Sanctions list alert</option>
                            <option value="Account takeover suspicion">Account takeover suspicion</option>
                            <option value="Repeated unauthorized PIN attempts">Repeated unauthorized PIN attempts</option>
                            <option value="Court / Regulatory directive">Court / Regulatory directive</option>
                        </select>
                    </div>

                    <div className="rounded-lg border border-primary/10 bg-primary/5 p-3 flex items-start gap-2.5">
                        <input
                            type="checkbox"
                            id="freezeAccs"
                            checked={freezeAccounts}
                            onChange={(e) => setFreezeAccounts(e.target.checked)}
                            className="mt-0.5"
                        />
                        <label htmlFor="freezeAccs" className="cursor-pointer">
                            <span className="font-semibold block">Freeze associated bank accounts</span>
                            <span className="opacity-70 text-[11px]">
                                Suspends all withdrawals, debit transfers, and card transactions on {customer.accountCount || 1} account(s).
                            </span>
                        </label>
                    </div>

                    <p className="text-[10px] opacity-60">
                        Historical transactions and balances remain strictly preserved in the ledger for compliance.
                    </p>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="rounded-lg border border-primary/20 px-4 py-2 text-xs font-semibold hover:bg-primary/5 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isPending}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        {isPending ? 'Blocking...' : 'Confirm Block'}
                    </button>
                </div>
            </div>
        </div>
    );
}
