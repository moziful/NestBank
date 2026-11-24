'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiLock, FiUser, FiMail, FiCheckCircle, FiAlertCircle, FiKey } from 'react-icons/fi';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username, email, password, pin }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.message || 'Registration failed.');
                setLoading(false);
                return;
            }

            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                router.push('/login');
            }, 1500);
        } catch {
            setError('Failed to submit registration. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
            <div className="w-full max-w-md rounded-xl border border-primary/20 bg-surface p-8 shadow-2xl">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Customer Registration</h1>
                    <p className="mt-2 text-sm text-primary/70">
                        Create your personal NestBank account with secure password and optional transaction PIN
                    </p>
                </div>

                {error && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-600 border border-red-500/30">
                        <FiAlertCircle className="h-5 w-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-700 border border-green-500/30">
                        <FiCheckCircle className="h-5 w-5 shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-primary" htmlFor="name">
                            Full Name
                        </label>
                        <div className="mt-1 flex items-center rounded-lg border border-primary/20 bg-white/20 px-3 py-2 focus-within:border-accent">
                            <FiUser className="mr-2 h-4 w-4 text-primary/50" />
                            <input
                                id="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Jane Doe"
                                className="w-full bg-transparent text-sm text-primary outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary" htmlFor="username">
                            Username
                        </label>
                        <div className="mt-1 flex items-center rounded-lg border border-primary/20 bg-white/20 px-3 py-2 focus-within:border-accent">
                            <FiUser className="mr-2 h-4 w-4 text-primary/50" />
                            <input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="janedoe"
                                className="w-full bg-transparent text-sm text-primary outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary" htmlFor="email">
                            Email Address
                        </label>
                        <div className="mt-1 flex items-center rounded-lg border border-primary/20 bg-white/20 px-3 py-2 focus-within:border-accent">
                            <FiMail className="mr-2 h-4 w-4 text-primary/50" />
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="jane@example.com"
                                className="w-full bg-transparent text-sm text-primary outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary" htmlFor="password">
                            Password (min 6 characters)
                        </label>
                        <div className="mt-1 flex items-center rounded-lg border border-primary/20 bg-white/20 px-3 py-2 focus-within:border-accent">
                            <FiLock className="mr-2 h-4 w-4 text-primary/50" />
                            <input
                                id="password"
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-transparent text-sm text-primary outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary" htmlFor="pin">
                            Transaction PIN (4-6 digits, optional)
                        </label>
                        <div className="mt-1 flex items-center rounded-lg border border-primary/20 bg-white/20 px-3 py-2 focus-within:border-accent">
                            <FiKey className="mr-2 h-4 w-4 text-primary/50" />
                            <input
                                id="pin"
                                type="password"
                                maxLength={6}
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="e.g. 1234"
                                className="w-full bg-transparent text-sm text-primary outline-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-accent py-2.5 text-center text-sm font-semibold text-white transition hover:bg-secondary disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-primary/70">
                    Already registered?{' '}
                    <Link href="/login" className="font-semibold text-accent hover:underline">
                        Sign In here
                    </Link>
                </div>
            </div>
        </div>
    );
}
