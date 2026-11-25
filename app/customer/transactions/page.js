'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiX, FiActivity } from 'react-icons/fi';
import { formatBDT } from '@/lib/currency';
import Pagination from '@/app/components/Pagination';

export default function CustomerTransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [ownedAccounts, setOwnedAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('All');
    const [account, setAccount] = useState('All');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [selectedTx, setSelectedTx] = useState(null);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: '10',
                type,
                account,
            });
            if (search) params.set('search', search);

            const res = await fetch(`/api/customer/transactions?${params.toString()}`);
            const json = await res.json();
            if (json.success) {
                setTransactions(json.transactions || []);
                setOwnedAccounts(json.ownedAccounts || []);
                if (json.pagination) setPagination(json.pagination);
            }
        } catch (err) {
            console.error('Failed to fetch customer transactions:', err);
        } finally {
            setLoading(false);
        }
    }, [page, type, account, search]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-primary">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                    <FiActivity className="text-accent" /> Transaction History
                </h1>
                <p className="mt-1 text-sm text-primary/70">
                    Search, filter, and inspect receipts for all your personal banking transactions.
                </p>
            </div>

            <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[220px]">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 h-4 w-4" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search by ref ID or description..."
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-primary/20 bg-primary/5 outline-none focus:border-accent"
                        />
                    </div>

                    <select
                        value={type}
                        onChange={(e) => {
                            setType(e.target.value);
                            setPage(1);
                        }}
                        className="px-3 py-2 text-sm rounded-lg border border-primary/20 bg-primary/5 outline-none focus:border-accent"
                    >
                        <option value="All">All Types</option>
                        <option value="Transfer">Transfer</option>
                        <option value="Deposit">Deposit</option>
                        <option value="Withdrawal">Withdrawal</option>
                        <option value="LOAN_DISBURSEMENT">Loan Disbursement</option>
                    </select>

                    <select
                        value={account}
                        onChange={(e) => {
                            setAccount(e.target.value);
                            setPage(1);
                        }}
                        className="px-3 py-2 text-sm rounded-lg border border-primary/20 bg-primary/5 outline-none focus:border-accent"
                    >
                        <option value="All">All Accounts</option>
                        {ownedAccounts.map((acc) => (
                            <option key={acc} value={acc}>{acc}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="py-10 text-center text-sm text-primary/60">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                    <div className="py-10 text-center text-sm text-primary/60">No transactions found matching your filters.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-primary/10 text-primary/60 uppercase">
                                    <th className="py-3 px-3">Ref ID</th>
                                    <th className="py-3 px-3">Type</th>
                                    <th className="py-3 px-3">Account</th>
                                    <th className="py-3 px-3">Description</th>
                                    <th className="py-3 px-3">Amount</th>
                                    <th className="py-3 px-3">Status</th>
                                    <th className="py-3 px-3 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/10">
                                {transactions.map((tx) => (
                                    <tr
                                        key={tx._id || tx.transactionId}
                                        onClick={() => setSelectedTx(tx)}
                                        className="hover:bg-primary/[0.03] cursor-pointer transition"
                                    >
                                        <td className="py-3 px-3 font-mono font-semibold text-accent">
                                            {tx.transactionId || String(tx._id).slice(-8)}
                                        </td>
                                        <td className="py-3 px-3 font-medium">{tx.type}</td>
                                        <td className="py-3 px-3 font-mono">{tx.accountNumber || tx.fromAccount || '—'}</td>
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

                <Pagination
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    total={pagination.total}
                    limit={pagination.limit}
                    onPageChange={setPage}
                />
            </div>

            {/* Customer Receipt Drawer */}
            {selectedTx && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-surface text-primary border-l border-primary/20 p-6 shadow-2xl overflow-y-auto space-y-5">
                        <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                            <div>
                                <h3 className="text-lg font-bold">Transaction Receipt</h3>
                                <p className="text-xs font-mono text-primary/60">{selectedTx.transactionId || selectedTx._id}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedTx(null)}
                                className="p-1.5 rounded-lg hover:bg-primary/10 cursor-pointer"
                            >
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="rounded-xl border border-primary/15 bg-primary/[0.02] p-4 space-y-2.5 text-xs">
                            <div className="flex justify-between">
                                <span className="text-primary/60">Type</span>
                                <span className="font-bold">{selectedTx.type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-primary/60">Amount</span>
                                <span className="text-base font-bold text-accent">{formatBDT(selectedTx.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-primary/60">Status</span>
                                <span className="font-semibold text-emerald-600">{selectedTx.status || 'Completed'}</span>
                            </div>
                            {selectedTx.fromAccount && (
                                <div className="flex justify-between">
                                    <span className="text-primary/60">From Account</span>
                                    <span className="font-mono">{selectedTx.fromAccount}</span>
                                </div>
                            )}
                            {selectedTx.toAccount && (
                                <div className="flex justify-between">
                                    <span className="text-primary/60">To Account</span>
                                    <span className="font-mono">{selectedTx.toAccount}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-primary/60">Description</span>
                                <span>{selectedTx.description || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-primary/60">Timestamp</span>
                                <span>{selectedTx.createdAt ? new Date(selectedTx.createdAt).toLocaleString() : '—'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
