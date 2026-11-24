'use client';

import { useState } from 'react';
import { FiKey, FiLock, FiCheckCircle, FiAlertCircle, FiShield } from 'react-icons/fi';
import { useAuth } from '../providers';

export default function ProfileSecurityPage() {
    const { user, refreshSession } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handlePinUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPin !== confirmPin) {
            setError('New PIN and Confirm PIN do not match');
            return;
        }

        if (!/^\d{4,6}$/.test(newPin)) {
            setError('PIN must be 4 to 6 numeric digits');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/user/pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: currentPassword || undefined,
                    oldPin: oldPin || undefined,
                    newPin,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.message || 'Failed to update transaction PIN');
                setLoading(false);
                return;
            }

            setMessage('Transaction PIN configured successfully! It will now be required for secure transactions.');
            setCurrentPassword('');
            setOldPin('');
            setNewPin('');
            setConfirmPin('');
            await refreshSession();
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 sm:p-10 max-w-4xl mx-auto text-primary">
            <div className="flex items-center gap-3">
                <FiShield className="h-8 w-8 text-accent" />
                <div>
                    <h1 className="text-2xl font-bold">Profile & Security</h1>
                    <p className="text-sm opacity-75">Manage your account credentials, security preferences, and transaction PIN</p>
                </div>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-2">
                <div className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <FiKey className="text-accent" />
                        Transaction PIN Configuration
                    </h2>
                    <p className="mt-1 text-xs opacity-75">
                        Your transaction PIN is never stored in plaintext and is required to authorize transfers and withdrawals.
                    </p>

                    {message && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-700 border border-green-500/30">
                            <FiCheckCircle className="h-5 w-5 shrink-0" />
                            <span>{message}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-600 border border-red-500/30">
                            <FiAlertCircle className="h-5 w-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handlePinUpdate} className="mt-6 space-y-4">
                        <div>
                            <label className="block text-xs font-medium" htmlFor="currentPassword">
                                Current Account Password
                            </label>
                            <input
                                id="currentPassword"
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Verify your password"
                                className="mt-1 w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 text-sm outline-none focus:border-accent"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium" htmlFor="newPin">
                                New Transaction PIN (4-6 digits)
                            </label>
                            <input
                                id="newPin"
                                type="password"
                                maxLength={6}
                                required
                                value={newPin}
                                onChange={(e) => setNewPin(e.target.value)}
                                placeholder="••••"
                                className="mt-1 w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 text-sm outline-none focus:border-accent font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium" htmlFor="confirmPin">
                                Confirm New PIN
                            </label>
                            <input
                                id="confirmPin"
                                type="password"
                                maxLength={6}
                                required
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value)}
                                placeholder="••••"
                                className="mt-1 w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 text-sm outline-none focus:border-accent font-mono"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md bg-accent py-2 text-sm font-semibold text-white hover:bg-secondary disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Set / Update Transaction PIN'}
                        </button>
                    </form>
                </div>

                <div className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <FiLock className="text-accent" />
                        Account Security Overview
                    </h2>
                    <dl className="mt-4 space-y-3 text-sm">
                        <div className="flex justify-between border-b border-primary/10 pb-2">
                            <dt className="opacity-75">Account Holder:</dt>
                            <dd className="font-medium">{user?.name}</dd>
                        </div>
                        <div className="flex justify-between border-b border-primary/10 pb-2">
                            <dt className="opacity-75">Username:</dt>
                            <dd className="font-mono text-xs">{user?.username}</dd>
                        </div>
                        <div className="flex justify-between border-b border-primary/10 pb-2">
                            <dt className="opacity-75">Email:</dt>
                            <dd className="text-xs">{user?.email}</dd>
                        </div>
                        <div className="flex justify-between border-b border-primary/10 pb-2">
                            <dt className="opacity-75">Role Tier:</dt>
                            <dd className="font-semibold text-accent">{user?.role}</dd>
                        </div>
                        <div className="flex justify-between border-b border-primary/10 pb-2">
                            <dt className="opacity-75">Account Status:</dt>
                            <dd className="font-medium text-green-600">{user?.status || 'Active'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="opacity-75">Password Hashing:</dt>
                            <dd className="text-xs text-green-700 font-semibold">Bcrypt (Salt rounds 10)</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="opacity-75">PIN Protection:</dt>
                            <dd className="text-xs text-green-700 font-semibold">Bcrypt Cryptographic Hash</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}
