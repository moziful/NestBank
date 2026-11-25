'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiUser, FiMail, FiPhone, FiShield, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '@/app/providers';

export default function StaffProfilePage() {
    const { user } = useAuth();
    const [saved, setSaved] = useState(false);

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-primary">Staff Profile</h1>
                <p className="text-sm text-primary/70">
                    Review your officer identity, department assignment, and operational credentials.
                </p>
            </div>

            {saved && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600 border border-emerald-500/20">
                    <FiCheckCircle className="h-4 w-4" />
                    <span>Profile settings updated successfully.</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Officer Card */}
                <div className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm flex flex-col items-center text-center">
                    <div className="h-20 w-20 rounded-full bg-accent/20 text-accent flex items-center justify-center text-2xl font-bold mb-4">
                        {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
                    </div>
                    <h2 className="text-lg font-bold text-primary">{user?.name || 'Bank Staff Officer'}</h2>
                    <p className="text-xs text-primary/60 mb-2">@{user?.username || 'staff'}</p>
                    <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                        {user?.role || 'Bank Staff'}
                    </span>

                    <div className="mt-6 w-full pt-4 border-t border-primary/10 text-left space-y-2 text-xs text-primary/70">
                        <div>
                            <span className="font-semibold text-primary">Branch:</span> Dhaka Main Branch
                        </div>
                        <div>
                            <span className="font-semibold text-primary">Designation:</span> Customer Relationship Officer
                        </div>
                        <div>
                            <span className="font-semibold text-primary">Status:</span> Active (Verified)
                        </div>
                    </div>
                </div>

                {/* Profile Information Form */}
                <div className="md:col-span-2 rounded-xl border border-primary/20 bg-surface p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-primary">Officer Details</h3>

                    <div className="space-y-4 text-sm">
                        <div>
                            <label className="block text-xs font-semibold text-primary/70 mb-1">Full Legal Name</label>
                            <input
                                type="text"
                                disabled
                                value={user?.name || 'Bank Officer'}
                                className="w-full px-3 py-2 rounded-lg border border-primary/20 bg-primary/5 text-primary cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-primary/70 mb-1">Official Email Address</label>
                            <input
                                type="email"
                                disabled
                                value={user?.email || 'staff@nestbank.com'}
                                className="w-full px-3 py-2 rounded-lg border border-primary/20 bg-primary/5 text-primary cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-primary/70 mb-1">System Role</label>
                            <input
                                type="text"
                                disabled
                                value="BANK_STAFF (Role permissions managed by Bank Administrator)"
                                className="w-full px-3 py-2 rounded-lg border border-primary/20 bg-primary/5 text-primary cursor-not-allowed"
                            />
                        </div>

                        <div className="pt-4 border-t border-primary/10 flex items-center justify-between">
                            <span className="text-xs text-primary/60">
                                Need to update credentials or configure transaction PIN?
                            </span>
                            <Link
                                href="/staff/profile/security"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90"
                            >
                                <FiShield className="h-3.5 w-3.5" />
                                Security Settings
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
