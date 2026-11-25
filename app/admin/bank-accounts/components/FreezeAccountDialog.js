'use client';

import { useState } from 'react';
import { FiLock, FiX } from 'react-icons/fi';

export default function FreezeAccountDialog({ isOpen, account, onClose, onConfirm, isPending }) {
    const [reason, setReason] = useState('Suspicious transaction activity');

    if (!isOpen || !account) return null;

    const handleConfirm = () => {
        onConfirm({
            id: account._id || account.accountNumber,
            reason,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-sky-500/30 bg-surface p-6 shadow-2xl text-primary animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                    <div className="flex items-center gap-2 text-sky-600 font-bold">
                        <FiLock className="h-5 w-5" />
                        <span>Freeze Bank Account</span>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 rounded hover:bg-primary/10">
                        <FiX className="h-4 w-4" />
                    </button>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                    <p className="opacity-80">
                        Temporarily restrict operations on account <strong className="font-mono text-accent">•••• {account.accountNumber?.slice(-4)}</strong> owned by <strong className="text-primary">{account.customerName}</strong>.
                    </p>

                    <div>
                        <label className="block font-semibold mb-1">Reason for freezing *</label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full rounded-lg border border-primary/20 bg-white/20 p-2 outline-none focus:border-sky-500 text-xs font-medium"
                        >
                            <option value="Suspicious transaction activity">Suspicious transaction activity</option>
                            <option value="Debit card loss / compromise">Debit card loss / compromise</option>
                            <option value="Regulatory inquiry or court order">Regulatory inquiry or court order</option>
                            <option value="Overdrawn / negative ledger dispute">Overdrawn / negative ledger dispute</option>
                            <option value="Customer voluntary protection request">Customer voluntary protection request</option>
                        </select>
                    </div>

                    <div className="rounded-lg border border-sky-500/20 bg-sky-500/10 p-3 text-[11px] text-sky-800 space-y-1">
                        <p className="font-bold">Freeze Policy Enforcement:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                            <li>All outgoing transfers and ATM/teller withdrawals are blocked immediately.</li>
                            <li>Existing balance ({account.balance}) and historical transactions remain preserved.</li>
                            <li>Action logged to system audit trail.</li>
                        </ul>
                    </div>
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
                        className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        {isPending ? 'Freezing...' : 'Confirm Freeze'}
                    </button>
                </div>
            </div>
        </div>
    );
}
