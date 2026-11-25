'use client';

import { useState, useEffect } from 'react';
import { FiX, FiCheckCircle } from 'react-icons/fi';
import { ACCOUNT_TYPES } from './AccountFilters';

export default function CreateAccountForm({ isOpen, onClose, onSubmit, isSubmitting }) {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [accountType, setAccountType] = useState('Savings');
    const [initialDeposit, setInitialDeposit] = useState(5000);
    const [maxSingleTransfer, setMaxSingleTransfer] = useState(50000);
    const [dailyTransferLimit, setDailyTransferLimit] = useState(100000);
    const [dailyWithdrawalLimit, setDailyWithdrawalLimit] = useState(40000);
    const [branch, setBranch] = useState('Principal Corporate Branch, Dhaka');

    useEffect(() => {
        if (!isOpen) return;
        // Fetch verified customers for selector
        fetch('/api/admin/customers?limit=100')
            .then((r) => r.json())
            .then((data) => {
                if (data.customers) {
                    setCustomers(data.customers);
                    if (data.customers.length) {
                        setSelectedCustomerId(data.customers[0]._id);
                    }
                }
            })
            .catch(console.error);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            customerId: selectedCustomerId,
            accountType,
            initialDeposit: Number(initialDeposit) || 0,
            maxSingleTransfer: Number(maxSingleTransfer) || 50000,
            dailyTransferLimit: Number(dailyTransferLimit) || 100000,
            dailyWithdrawalLimit: Number(dailyWithdrawalLimit) || 40000,
            minimumBalance: accountType === 'Business' ? 5000 : 500,
            branch,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl border border-primary/20 bg-surface p-6 shadow-2xl text-primary animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                    <h3 className="text-lg font-bold">Open Bank Account</h3>
                    <button type="button" onClick={onClose} className="p-1 rounded-md hover:bg-primary/10">
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
                    {/* A. Customer Selection */}
                    <div>
                        <label className="block font-semibold mb-1">Select Verified Customer *</label>
                        <select
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                            className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs font-medium cursor-pointer"
                        >
                            {customers.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.name} ({c.customerId}) — {c.email}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-[10px] opacity-60">
                            Accounts must be associated with an existing verified customer profile.
                        </p>
                    </div>

                    {/* B. Account Type & Branch */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold mb-1">Account Type *</label>
                            <select
                                value={accountType}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setAccountType(val);
                                    if (val === 'Business') {
                                        setMaxSingleTransfer(250000);
                                        setDailyTransferLimit(1000000);
                                        setDailyWithdrawalLimit(200000);
                                    } else {
                                        setMaxSingleTransfer(50000);
                                        setDailyTransferLimit(100000);
                                        setDailyWithdrawalLimit(40000);
                                    }
                                }}
                                className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs font-medium cursor-pointer"
                            >
                                {ACCOUNT_TYPES.filter((t) => t !== 'All').map((t) => (
                                    <option key={t} value={t}>
                                        {t} Account
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Initial Opening Deposit (BDT)</label>
                            <input
                                type="number"
                                min={0}
                                required
                                value={initialDeposit}
                                onChange={(e) => setInitialDeposit(e.target.value)}
                                className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs font-semibold"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Assigned Branch</label>
                        <input
                            type="text"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs"
                        />
                    </div>

                    {/* C. Initial Limits Configuration */}
                    <div className="rounded-lg border border-primary/10 bg-primary/5 p-3 space-y-3">
                        <span className="font-bold block text-primary">Initial Transaction Limits (Configurable)</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                                <label className="block text-[10px] opacity-75 mb-0.5">Max Single (BDT)</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={maxSingleTransfer}
                                    onChange={(e) => setMaxSingleTransfer(e.target.value)}
                                    className="w-full rounded border border-primary/20 bg-white/20 px-2 py-1 text-xs outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] opacity-75 mb-0.5">Daily Transfer</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={dailyTransferLimit}
                                    onChange={(e) => setDailyTransferLimit(e.target.value)}
                                    className="w-full rounded border border-primary/20 bg-white/20 px-2 py-1 text-xs outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] opacity-75 mb-0.5">Daily Withdrawal</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={dailyWithdrawalLimit}
                                    onChange={(e) => setDailyWithdrawalLimit(e.target.value)}
                                    className="w-full rounded border border-primary/20 bg-white/20 px-2 py-1 text-xs outline-none"
                                />
                            </div>
                        </div>
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
                            disabled={isSubmitting}
                            className="rounded-lg bg-accent px-5 py-2 font-semibold text-white hover:bg-secondary transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? 'Opening Account...' : 'Open Bank Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
