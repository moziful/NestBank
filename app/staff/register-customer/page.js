'use client';

import { useState } from 'react';
import { FiUserPlus, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function StaffRegisterCustomerPage() {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username, email, password, phone, pin }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.message || 'Registration failed');
                setLoading(false);
                return;
            }

            setMessage('Customer registered successfully with opening account!');
            setName('');
            setUsername('');
            setEmail('');
            setPassword('');
            setPhone('');
            setPin('');
        } catch {
            setError('Error submitting customer registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 sm:p-10 max-w-xl mx-auto text-primary">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <FiUserPlus className="text-accent" />
                Staff Desk: Register Customer
            </h1>
            <p className="mt-1 text-sm opacity-75">
                Staff-assisted customer onboarding with automatic account provisioning
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

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-primary/20 bg-surface p-6 shadow-sm">
                <div>
                    <label className="block text-xs font-medium">Customer Full Name</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Smith"
                        className="mt-1 w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium">Customer Username</label>
                    <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="johnsmith"
                        className="mt-1 w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium">Customer Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john.smith@gmail.com"
                        className="mt-1 w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium">Phone</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 555 123 4567"
                        className="mt-1 w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium">Temporary Password</label>
                    <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="mt-1 w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium">Optional Transaction PIN (4-6 digits)</label>
                    <input
                        type="password"
                        maxLength={6}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="1234"
                        className="mt-1 w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-accent py-2 text-sm font-semibold text-white hover:bg-secondary disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Register Customer'}
                </button>
            </form>
        </div>
    );
}
