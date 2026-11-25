'use client';

import { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiCopy, FiFileText, FiCheck } from 'react-icons/fi';
import { formatBDT } from '@/lib/currency';
import AccountStatusBadge from '@/app/admin/bank-accounts/components/AccountStatusBadge';
import AccountTypeBadge from '@/app/admin/bank-accounts/components/AccountTypeBadge';

function CustomerAccountDetailContent({ params }) {
    const { id } = use(params);
    const [account, setAccount] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`/api/customer/accounts/${id}`);
                const json = await res.json();
                if (json.success) {
                    setAccount(json.account);
                    setTransactions(json.transactions || []);
                }
            } catch (err) {
                console.error('Failed to fetch account details:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) {
        return <div className="p-8 text-center text-sm text-primary/60">Loading account details...</div>;
    }

    if (!account) {
        return (
            <div className="p-8 max-w-4xl mx-auto text-center space-y-3">
                <p className="text-sm text-rose-500 font-semibold">Account not found or access denied.</p>
                <Link href="/customer/accounts" className="text-xs text-accent underline">Back to My Accounts</Link>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-primary">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/customer/accounts"
                        className="p-2 rounded-lg border border-primary/20 bg-surface hover:bg-primary/5"
                    >
                        <FiArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold font-mono">{account.accountNumber}</h1>
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard?.writeText(account.accountNumber);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 1500);
                                }}
                                className="p-1 text-primary/60 hover:text-accent cursor-pointer"
                            >
                                {copied ? <FiCheck className="h-4 w-4 text-emerald-500" /> : <FiCopy className="h-4 w-4" />}
                            </button>
                            <AccountTypeBadge type={account.accountType} />
                            <AccountStatusBadge status={account.status} />
                        </div>
                        <p className="text-xs text-primary/60">
                            Opened {account.createdAt ? new Date(account.createdAt).toLocaleDateString() : '—'}
                        </p>
                    </div>
                </div>

                <Link
                    href={`/customer/statements?account=${account.accountNumber}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                >
                    <FiFileText className="h-4 w-4" /> Account Statement
                </Link>
            </div>

            {/* Balance & Limits */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
                    <p className="text-xs text-primary/60">Current Balance</p>
                    <p className="mt-1 text-xl font-bold">{formatBDT(account.balance)}</p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
                    <p className="text-xs text-primary/60">Available Balance</p>
                    <p className="mt-1 text-xl font-bold text-emerald-600">{formatBDT(account.availableBalance)}</p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
                    <p className="text-xs text-primary/60">Held Amount</p>
                    <p className="mt-1 text-xl font-bold text-amber-600">{formatBDT(account.heldAmount || 0)}</p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
                    <p className="text-xs text-primary/60">Per-Transaction Limit</p>
                    <p className="mt-1 text-xl font-bold">{formatBDT(account.perTransactionLimit || 500000)}</p>
                </div>
            </div>

            {/* Account Transactions */}
            <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-4">
                <h2 className="text-base font-bold">Account Transaction History</h2>
                {transactions.length === 0 ? (
                    <p className="py-8 text-center text-sm text-primary/60">No transactions on this account yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-primary/10 text-primary/60 uppercase">
                                    <th className="py-2.5 px-3">Ref ID</th>
                                    <th className="py-2.5 px-3">Type</th>
                                    <th className="py-2.5 px-3">Description</th>
                                    <th className="py-2.5 px-3">Amount</th>
                                    <th className="py-2.5 px-3">Status</th>
                                    <th className="py-2.5 px-3 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/10">
                                {transactions.map((tx) => (
                                    <tr key={tx._id || tx.transactionId} className="hover:bg-primary/[0.02]">
                                        <td className="py-3 px-3 font-mono font-semibold">{tx.transactionId || String(tx._id).slice(-8)}</td>
                                        <td className="py-3 px-3 font-medium">{tx.type}</td>
                                        <td className="py-3 px-3 text-primary/75">{tx.description || '—'}</td>
                                        <td className="py-3 px-3 font-bold">{formatBDT(tx.amount)}</td>
                                        <td className="py-3 px-3">
                                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                                                {tx.status || 'Completed'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-right text-primary/60">
                                            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CustomerAccountDetailPage({ params }) {
    return (
        <Suspense fallback={<div className="p-8 text-center text-sm text-primary/60">Loading account details...</div>}>
            <CustomerAccountDetailContent params={params} />
        </Suspense>
    );
}
