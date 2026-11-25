'use client';

import Link from 'next/link';
import { FiCheckCircle, FiUser, FiUserPlus, FiCreditCard } from 'react-icons/fi';

export default function RegistrationSuccessView({ result, onReset }) {
    return (
        <div className="rounded-xl border border-emerald-500/30 bg-surface p-6 sm:p-8 shadow-sm max-w-2xl mx-auto space-y-6">
            <div className="flex items-start gap-4">
                <div className="rounded-full bg-emerald-500/15 p-3 text-emerald-600 shrink-0">
                    <FiCheckCircle className="h-8 w-8" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-primary">Customer registered successfully</h2>
                    <p className="mt-1 text-sm text-primary/70">
                        The customer profile has been created. Identity verification is still pending.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-primary/15 bg-primary/[0.02] p-4 text-sm">
                <div>
                    <p className="text-xs text-primary/60">Customer ID</p>
                    <p className="font-bold text-primary">{result.customerId}</p>
                </div>
                <div>
                    <p className="text-xs text-primary/60">Customer Name</p>
                    <p className="font-semibold text-primary">{result.fullName}</p>
                </div>
                <div>
                    <p className="text-xs text-primary/60">Registration Status</p>
                    <span className="inline-block mt-0.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                        {result.registrationStatus || 'Registered'}
                    </span>
                </div>
                <div>
                    <p className="text-xs text-primary/60">Verification</p>
                    <span className="inline-block mt-0.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
                        {result.verificationStatus || 'Pending'}
                    </span>
                </div>
                <div className="sm:col-span-2">
                    <p className="text-xs text-primary/60">Registered By</p>
                    <p className="font-medium text-primary">{result.registeredBy}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                    href={`/staff/customers/${result.userId}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition"
                >
                    <FiUser className="h-4 w-4" />
                    View Customer Profile
                </Link>
                <button
                    type="button"
                    onClick={onReset}
                    className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-surface px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 transition cursor-pointer"
                >
                    <FiUserPlus className="h-4 w-4" />
                    Register Another Customer
                </button>
                <Link
                    href="/staff/create-account"
                    className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-surface px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 transition"
                >
                    <FiCreditCard className="h-4 w-4" />
                    Create Bank Account
                </Link>
            </div>
        </div>
    );
}
