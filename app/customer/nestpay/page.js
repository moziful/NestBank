'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    FiSmartphone,
    FiZap,
    FiShield,
    FiGrid,
    FiCheckCircle,
    FiArrowLeft,
    FiBell,
} from 'react-icons/fi';

export default function NestPayPreviewPage() {
    const [notified, setNotified] = useState(false);

    const features = [
        {
            title: 'Instant QR & Merchant Pay',
            desc: 'Scan and pay at thousands of retail outlets directly from your NestBank accounts.',
            icon: FiGrid,
        },
        {
            title: 'Mobile Recharge & Utility Bills',
            desc: 'Top up mobile balances and settle electricity, gas, water, and internet bills in seconds.',
            icon: FiZap,
        },
        {
            title: 'Bank-Grade PIN & Biometric Guard',
            desc: 'Protected by NestBank atomic ledger security and real-time fraud monitoring.',
            icon: FiShield,
        },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 text-primary">
            <div className="flex items-center justify-between gap-4">
                <Link
                    href="/customer"
                    className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-surface px-3.5 py-2 text-xs font-semibold hover:bg-primary/5"
                >
                    <FiArrowLeft className="h-4 w-4" /> Back to Overview
                </Link>
                <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent border border-accent/30">
                    Coming Soon
                </span>
            </div>

            {/* Hero Card */}
            <div className="rounded-2xl border border-accent/30 bg-surface p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-bold text-accent">
                            <FiSmartphone className="h-4 w-4" />
                            <span>Powered by NestBank</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                            NestPay — Mobile Banking Service
                        </h1>
                        <p className="text-sm text-primary/75 max-w-2xl">
                            Our upcoming mobile-first payment and wallet experience, seamlessly connected to your NestBank Savings and Current accounts.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setNotified(true)}
                        disabled={notified}
                        className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-semibold shadow-sm transition shrink-0 cursor-pointer ${
                            notified
                                ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 cursor-default'
                                : 'bg-accent text-white hover:opacity-90'
                        }`}
                    >
                        {notified ? (
                            <>
                                <FiCheckCircle className="h-4 w-4" /> Early Access Registered
                            </>
                        ) : (
                            <>
                                <FiBell className="h-4 w-4" /> Notify Me at Launch
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Feature Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {features.map((f) => {
                    const Icon = f.icon;
                    return (
                        <div key={f.title} className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-2.5">
                            <div className="inline-flex rounded-xl bg-accent/15 p-3 text-accent">
                                <Icon className="h-5 w-5" />
                            </div>
                            <h3 className="text-sm font-bold text-primary">{f.title}</h3>
                            <p className="text-xs text-primary/70 leading-relaxed">{f.desc}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
