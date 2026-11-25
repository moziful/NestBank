'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiCreditCard, FiCopy, FiEye, FiEyeOff, FiFileText, FiCheck } from 'react-icons/fi';
import { formatBDT } from '@/lib/currency';
import AccountStatusBadge from '@/app/admin/bank-accounts/components/AccountStatusBadge';
import AccountTypeBadge from '@/app/admin/bank-accounts/components/AccountTypeBadge';

export default function CustomerAccountsPage() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [revealed, setRevealed] = useState({});
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/customer/accounts');
                const json = await res.json();
                if (json.success) setAccounts(json.accounts || []);
            } catch (err) {
                console.error('Failed to fetch accounts:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const maskNumber = (num, isRevealed) => {
        if (!num) return '•••• ----';
        if (isRevealed) return num;
        return `•••• •••• ${String(num).slice(-4)}`;
    };

    const handleCopy = (id, accNum) => {
        navigator.clipboard?.writeText(accNum);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-primary">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <FiCreditCard className="text-accent" /> My Accounts
                    </h1>
                    <p className="mt-1 text-sm text-primary/70">
                        View your account balances, available funds, limits, and statements.
                    </p>
                </div>
                <Link
                    href="/customer/statements"
                    className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-surface px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/5"
                >
                    <FiFileText className="h-4 w-4 text-accent" />
                    Download Statements
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-48 rounded-xl border border-primary/20 bg-surface animate-pulse" />
                    ))}
                </div>
            ) : accounts.length === 0 ? (
                <div className="rounded-xl border border-primary/20 bg-surface p-10 text-center text-sm text-primary/60">
                    No bank accounts found under your profile. Contact Bank Staff to open an account.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {accounts.map((acc) => {
                        const isRev = Boolean(revealed[acc._id]);
                        return (
                            <div
                                key={acc._id}
                                className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm flex flex-col justify-between space-y-5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <AccountTypeBadge type={acc.accountType} />
                                            <AccountStatusBadge status={acc.status} />
                                        </div>
                                        <div className="flex items-center gap-2 pt-1">
                                            <span className="font-mono text-base font-bold tracking-wider">
                                                {maskNumber(acc.accountNumber, isRev)}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setRevealed((p) => ({ ...p, [acc._id]: !p[acc._id] }))}
                                                className="p-1 text-primary/60 hover:text-accent cursor-pointer"
                                                title={isRev ? 'Hide account number' : 'Show account number'}
                                            >
                                                {isRev ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(acc._id, acc.accountNumber)}
                                                className="p-1 text-primary/60 hover:text-accent cursor-pointer"
                                                title="Copy account number"
                                            >
                                                {copiedId === acc._id ? (
                                                    <FiCheck className="h-4 w-4 text-emerald-500" />
                                                ) : (
                                                    <FiCopy className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 rounded-xl border border-primary/10 bg-primary/[0.02] p-3.5 text-xs">
                                    <div>
                                        <p className="text-primary/60">Ledger Balance</p>
                                        <p className="mt-0.5 text-base font-bold text-primary">{formatBDT(acc.balance)}</p>
                                    </div>
                                    <div>
                                        <p className="text-primary/60">Available</p>
                                        <p className="mt-0.5 text-base font-bold text-emerald-600">{formatBDT(acc.availableBalance)}</p>
                                    </div>
                                    <div>
                                        <p className="text-primary/60">Held Amount</p>
                                        <p className="mt-0.5 text-base font-bold text-amber-600">{formatBDT(acc.heldAmount || 0)}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-primary/10 pt-3">
                                    <Link
                                        href={`/customer/accounts/${acc._id}`}
                                        className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition"
                                    >
                                        View Account Details
                                    </Link>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/customer/statements?account=${acc.accountNumber}`}
                                            className="rounded-lg border border-primary/20 px-3 py-2 text-xs font-semibold hover:bg-primary/5"
                                        >
                                            Statement
                                        </Link>
                                        <Link
                                            href="/customer/transfer"
                                            className="rounded-lg border border-primary/20 px-3 py-2 text-xs font-semibold hover:bg-primary/5"
                                        >
                                            Transfer
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
