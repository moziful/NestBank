'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../providers';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '';
    const errorParam = searchParams.get('error');

    const { refreshSession } = useAuth();
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(
        errorParam === 'suspended' ? 'Your account has been suspended or is inactive.' : ''
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernameOrEmail, password }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setErrorMessage(data.message || 'Login failed. Please check your credentials.');
                setLoading(false);
                return;
            }

            await refreshSession();

            if (callbackUrl) {
                router.push(callbackUrl);
            } else {
                router.push(data.redirectPath || '/overview');
            }
        } catch (err) {
            console.error('Login error:', err);
            setErrorMessage('Unable to connect to server. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md rounded-xl border border-primary/20 bg-surface p-5 sm:p-8 shadow-2xl">
            <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight text-primary">NestBank Sign In</h1>
                <p className="mt-2 text-sm text-primary/70">
                    Secure banking portal for Customers, Staff, and Administrators
                </p>
            </div>

            {errorMessage && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-600 border border-red-500/30">
                    <FiAlertCircle className="h-5 w-5 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-primary" htmlFor="usernameOrEmail">
                        Username or Email
                    </label>
                    <div className="mt-1 flex items-center rounded-lg border border-primary/20 bg-white/20 px-3 py-2 focus-within:border-accent">
                        <FiUser className="mr-2 h-4 w-4 text-primary/50" />
                        <input
                            id="usernameOrEmail"
                            type="text"
                            required
                            value={usernameOrEmail}
                            onChange={(e) => setUsernameOrEmail(e.target.value)}
                            placeholder="e.g. admin, staff, or alice"
                            className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-primary/40"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-primary" htmlFor="password">
                        Password
                    </label>
                    <div className="mt-1 flex items-center rounded-lg border border-primary/20 bg-white/20 px-3 py-2 focus-within:border-accent">
                        <FiLock className="mr-2 h-4 w-4 text-primary/50" />
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-primary/40"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-accent py-2.5 text-center text-sm font-semibold text-white transition hover:bg-secondary disabled:opacity-50"
                >
                    {loading ? 'Authenticating...' : 'Sign In'}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-primary/70">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-semibold text-accent hover:underline">
                    Register as Customer
                </Link>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
            <Suspense fallback={<div className="text-center p-4">Loading login form...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
