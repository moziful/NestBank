'use client';

import { useState } from 'react';
import { FiX, FiCheckCircle } from 'react-icons/fi';
import { ACCOUNT_TYPES } from './CustomerFilters';

export default function CustomerFormModal({ isOpen, onClose, onSubmit, isSubmitting }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [pin, setPin] = useState('1234');
    const [address, setAddress] = useState('Dhaka, Bangladesh');
    const [accountType, setAccountType] = useState('Savings');
    const [initialDeposit, setInitialDeposit] = useState(5000);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            name,
            email,
            phone,
            password,
            pin,
            address,
            accountType,
            initialDeposit: Number(initialDeposit) || 0,
            status: 'Active',
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl border border-primary/20 bg-surface p-6 shadow-2xl text-primary animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                    <h3 className="text-lg font-bold">Register New Customer</h3>
                    <button type="button" onClick={onClose} className="p-1 rounded-md hover:bg-primary/10">
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
                    {/* Personal info */}
                    <div>
                        <label className="block font-medium mb-1">Full Name *</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Arif Hossain"
                            className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block font-medium mb-1">Email Address *</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="customer@example.com"
                                className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Phone Number</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+880 1712 000000"
                                className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Residential Address</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="City, Country"
                            className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs"
                        />
                    </div>

                    {/* Account Setup */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block font-medium mb-1">Opening Account Type</label>
                            <select
                                value={accountType}
                                onChange={(e) => setAccountType(e.target.value)}
                                className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs"
                            >
                                {ACCOUNT_TYPES.filter((t) => t !== 'All').map((t) => (
                                    <option key={t} value={t}>
                                        {t} Account
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Initial Opening Deposit (BDT)</label>
                            <input
                                type="number"
                                min={0}
                                value={initialDeposit}
                                onChange={(e) => setInitialDeposit(e.target.value)}
                                className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs font-semibold"
                            />
                        </div>
                    </div>

                    {/* Password & Security PIN */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block font-medium mb-1">Temporary Password (min 6 chars) *</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Transaction PIN (4-6 digits)</label>
                            <input
                                type="password"
                                maxLength={6}
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="1234"
                                className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2 border-t border-primary/10 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-primary/20 px-4 py-2 font-semibold hover:bg-primary/5 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-accent px-5 py-2 font-semibold text-white hover:bg-secondary transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? 'Registering...' : 'Provision Customer Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
