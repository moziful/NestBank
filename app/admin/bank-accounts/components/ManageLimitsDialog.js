'use client';

import { useState } from 'react';
import { FiSliders, FiX, FiCheckCircle } from 'react-icons/fi';

export default function ManageLimitsDialog({ isOpen, account, onClose, onConfirm, isPending }) {
    const limits = account?.limits || {};

    const [maxSingleTransfer, setMaxSingleTransfer] = useState(limits.maxSingleTransfer || 50000);
    const [dailyTransferLimit, setDailyTransferLimit] = useState(limits.dailyTransferLimit || 100000);
    const [dailyWithdrawalLimit, setDailyWithdrawalLimit] = useState(limits.dailyWithdrawalLimit || 40000);
    const [minimumBalance, setMinimumBalance] = useState(limits.minimumBalance || 500);

    if (!isOpen || !account) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({
            id: account._id || account.accountNumber,
            limits: {
                maxSingleTransfer: Number(maxSingleTransfer),
                dailyTransferLimit: Number(dailyTransferLimit),
                dailyWithdrawalLimit: Number(dailyWithdrawalLimit),
                minimumBalance: Number(minimumBalance),
                dailyTransactionCount: limits.dailyTransactionCount || 20,
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-primary/20 bg-surface p-6 shadow-2xl text-primary animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                    <div className="flex items-center gap-2 text-blue-600 font-bold">
                        <FiSliders className="h-5 w-5" />
                        <span>Manage Account Transaction Limits</span>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 rounded hover:bg-primary/10">
                        <FiX className="h-4 w-4" />
                    </button>
                </div>

                <div className="mt-2 text-xs opacity-75">
                    Account: <strong className="font-mono text-accent">•••• {account.accountNumber?.slice(-4)}</strong> ({account.customerName})
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
                    <div>
                        <label className="block font-semibold mb-1">Maximum Single Transfer (BDT) *</label>
                        <input
                            type="number"
                            min={1}
                            required
                            value={maxSingleTransfer}
                            onChange={(e) => setMaxSingleTransfer(e.target.value)}
                            className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs font-semibold"
                        />
                        <p className="mt-0.5 text-[10px] opacity-60">Maximum amount allowed per individual transfer</p>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Daily Transfer Limit (BDT) *</label>
                        <input
                            type="number"
                            min={1}
                            required
                            value={dailyTransferLimit}
                            onChange={(e) => setDailyTransferLimit(e.target.value)}
                            className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs font-semibold"
                        />
                        <p className="mt-0.5 text-[10px] opacity-60">Combined 24-hour outward transfer ceiling</p>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Daily Withdrawal Limit (BDT) *</label>
                        <input
                            type="number"
                            min={1}
                            required
                            value={dailyWithdrawalLimit}
                            onChange={(e) => setDailyWithdrawalLimit(e.target.value)}
                            className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs font-semibold"
                        />
                        <p className="mt-0.5 text-[10px] opacity-60">ATM and teller daily cash withdrawal cap</p>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Minimum Balance Requirement (BDT) *</label>
                        <input
                            type="number"
                            min={0}
                            required
                            value={minimumBalance}
                            onChange={(e) => setMinimumBalance(e.target.value)}
                            className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs font-semibold"
                        />
                        <p className="mt-0.5 text-[10px] opacity-60">Non-withdrawable maintenance buffer</p>
                    </div>

                    <div className="mt-6 flex justify-end gap-2 border-t border-primary/10 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-primary/20 px-4 py-2 font-semibold hover:bg-primary/5 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="rounded-lg bg-accent px-5 py-2 font-semibold text-white hover:bg-secondary transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {isPending ? 'Updating...' : 'Save Limits'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
