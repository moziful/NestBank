'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiFileText, FiDownload, FiPrinter } from 'react-icons/fi';
import { formatBDT } from '@/lib/currency';

function StatementsContent() {
    const searchParams = useSearchParams();
    const initialAccount = searchParams.get('account') || '';

    const [accounts, setAccounts] = useState([]);
    const [accountNumber, setAccountNumber] = useState(initialAccount);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return d.toISOString().slice(0, 10);
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [statement, setStatement] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStatement = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ startDate, endDate });
            if (accountNumber) params.set('accountNumber', accountNumber);

            const res = await fetch(`/api/customer/statements?${params.toString()}`);
            const json = await res.json();
            if (json.success) {
                setAccounts(json.accounts || []);
                if (!accountNumber && json.accounts?.length > 0) {
                    setAccountNumber(json.accounts[0].accountNumber);
                }
                setStatement(json.statement);
            }
        } catch (err) {
            console.error('Statement load error:', err);
        } finally {
            setLoading(false);
        }
    }, [accountNumber, startDate, endDate]);

    useEffect(() => {
        fetchStatement();
    }, [fetchStatement]);

    const handleDownloadCSV = () => {
        if (!statement?.entries) return;
        const headers = ['Date,Ref ID,Type,Direction,Description,Amount'];
        const rows = statement.entries.map((e) =>
            `"${new Date(e.createdAt).toISOString()}","${e.transactionId || e._id}","${e.type}","${e.direction}","${(e.description || '').replace(/"/g, '""')}",${e.amount}`
        );
        const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `statement-${statement.accountNumber}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-primary">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <FiFileText className="text-accent" /> Account Statements
                    </h1>
                    <p className="mt-1 text-sm text-primary/70">
                        Ledger-accurate e-statements for your accounts.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleDownloadCSV}
                        disabled={!statement?.entries?.length}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-surface px-4 py-2 text-xs font-semibold hover:bg-primary/5 disabled:opacity-50 cursor-pointer"
                    >
                        <FiDownload className="h-4 w-4 text-accent" /> Export CSV
                    </button>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:opacity-90 cursor-pointer"
                    >
                        <FiPrinter className="h-4 w-4" /> Print / PDF
                    </button>
                </div>
            </div>

            {/* Period Selector */}
            <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                    <label className="block font-semibold text-primary/70 mb-1">Account</label>
                    <select
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm outline-none focus:border-accent"
                    >
                        {accounts.map((a) => (
                            <option key={a.accountNumber} value={a.accountNumber}>
                                {a.accountType} ({a.accountNumber})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block font-semibold text-primary/70 mb-1">From Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                </div>
                <div>
                    <label className="block font-semibold text-primary/70 mb-1">To Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-10 text-center text-sm text-primary/60">Generating statement...</div>
            ) : !statement ? (
                <div className="py-10 text-center text-sm text-primary/60">No account available for statement generation.</div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
                            <p className="text-xs text-primary/60">Opening Balance</p>
                            <p className="mt-1 text-lg font-bold">{formatBDT(statement.openingBalance)}</p>
                        </div>
                        <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
                            <p className="text-xs text-primary/60">Total Credits</p>
                            <p className="mt-1 text-lg font-bold text-emerald-600">+{formatBDT(statement.totalCredits)}</p>
                        </div>
                        <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
                            <p className="text-xs text-primary/60">Total Debits</p>
                            <p className="mt-1 text-lg font-bold text-rose-600">-{formatBDT(statement.totalDebits)}</p>
                        </div>
                        <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
                            <p className="text-xs text-primary/60">Closing Balance</p>
                            <p className="mt-1 text-lg font-bold text-accent">{formatBDT(statement.closingBalance)}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm">
                        <h2 className="text-base font-bold mb-4">Statement Ledger ({statement.transactionCount} entries)</h2>
                        {statement.entries.length === 0 ? (
                            <p className="py-6 text-center text-xs text-primary/60">No transactions recorded in this period.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-primary/10 text-primary/60 uppercase">
                                            <th className="py-2.5 px-3">Date</th>
                                            <th className="py-2.5 px-3">Ref ID</th>
                                            <th className="py-2.5 px-3">Type</th>
                                            <th className="py-2.5 px-3">Description</th>
                                            <th className="py-2.5 px-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-primary/10">
                                        {statement.entries.map((e) => (
                                            <tr key={e._id || e.transactionId}>
                                                <td className="py-2.5 px-3">{new Date(e.createdAt).toLocaleDateString()}</td>
                                                <td className="py-2.5 px-3 font-mono">{e.transactionId || String(e._id).slice(-8)}</td>
                                                <td className="py-2.5 px-3">{e.type}</td>
                                                <td className="py-2.5 px-3 text-primary/75">{e.description || '—'}</td>
                                                <td className={`py-2.5 px-3 text-right font-bold ${e.direction === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {e.direction === 'CREDIT' ? '+' : '-'}{formatBDT(e.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default function CustomerStatementsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-sm text-primary/60">Loading statement...</div>}>
            <StatementsContent />
        </Suspense>
    );
}
