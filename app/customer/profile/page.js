'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiUser, FiShield, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '@/app/providers';

export default function CustomerProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        fetch('/api/customer/records')
            .then((r) => r.json())
            .then((json) => {
                if (json.success && json.profile) setProfile(json.profile);
            })
            .catch(() => {});
    }, []);

    const displayUser = profile || user || {};

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 text-primary">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <FiUser className="text-accent" /> My Profile
                    </h1>
                    <p className="text-sm text-primary/70">
                        Review your personal information, KYC verification status, and security settings.
                    </p>
                </div>
                <Link
                    href="/customer/profile/security"
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                >
                    <FiShield className="h-4 w-4" /> Security & Transaction PIN
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm flex flex-col items-center text-center space-y-2">
                    <div className="h-20 w-20 rounded-full bg-accent/15 text-accent flex items-center justify-center text-2xl font-bold">
                        {displayUser.name ? displayUser.name.slice(0, 2).toUpperCase() : 'CU'}
                    </div>
                    <h2 className="text-lg font-bold">{displayUser.name || 'NestBank Customer'}</h2>
                    <p className="text-xs text-primary/60">@{displayUser.username || 'customer'}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                        <FiCheckCircle className="h-3.5 w-3.5" /> {displayUser.status || 'Active'}
                    </span>
                </div>

                <div className="md:col-span-2 rounded-xl border border-primary/20 bg-surface p-6 shadow-sm space-y-4 text-xs">
                    <h3 className="text-base font-bold border-b border-primary/10 pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-primary/60">Customer ID</p>
                            <p className="font-mono font-bold mt-0.5">{displayUser.customerId || '—'}</p>
                        </div>
                        <div>
                            <p className="text-primary/60">Email Address</p>
                            <p className="font-semibold mt-0.5">{displayUser.email || '—'}</p>
                        </div>
                        <div>
                            <p className="text-primary/60">Phone Number</p>
                            <p className="font-semibold mt-0.5">{displayUser.phone || '—'}</p>
                        </div>
                        <div>
                            <p className="text-primary/60">Address</p>
                            <p className="font-semibold mt-0.5">{displayUser.address || '—'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
