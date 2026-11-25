'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiArrowUpRight, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { formatBDT } from '@/lib/currency';

export default function CustomerWithdrawPage() {
    const [accounts, setAccounts] = useState([]);
    const [requests, setRequests] = useState([]);
    const [accountNumber, setAccountNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('Branch Cash Counter');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const loadData = useCallback(async () => {
        try {
            const [accRes, reqRes] = await Promise.all([
                fetch('/api/customer/accounts'),
                fetch('/api/customer/requests?type=Withdrawal'),
            ]);
            const accJson = await accRes.json();
            const reqJson = await reqRes.json();

            if (accJson.success && accJson.accounts?.length > 0) {
                setAccounts(accJson.accounts);
                setAccountNumber((prev) => prev || accJson.accounts[0].accountNumber);
            }
            if (reqJson.success) setRequests(reqJson.requests || []);
        } catch (err) {
            console.error('Failed to load withdrawal data:', err);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const selectedAcc = accounts.find((a) => a.accountNumber === accountNumber);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback({ type: '', message: '' });
        setLoading(true);
        try {
            const res = await fetch('/api/customer/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'Withdrawal',
                    accountNumber,
                    amount: Number(amount),
                    method,
                    description,
                }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                setFeedback({ type: 'error', message: json.message || 'Withdrawal request failed.' });
                return;
            }
            setFeedback({ type: 'success', message: json.message });
            setAmount('');
            setDescription('');
            loadData();
        } catch {
            setFeedback({ type: 'error', message: 'Network error submitting withdrawal request.' });
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        'mt-1 w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary outline-none focus:border-accent';

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 text-primary">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                    <FiArrowUpRight className="text-amber-500" /> Withdrawal Request
                </h1>
                <p className="mt-1 text-sm text-primary/70">
                    Request a withdrawal from your available balance. Pending withdrawal amounts are reserved automatically.
                </p>
            </div>

            {feedback.message && (
                <div className={`flex items-center gap-2 rounded-xl border p-3.5 text-xs font-medium ${
                    feedback.type === 'success'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
                        : 'border-rose-500/30 bg-rose-500/10 text-rose-600'
                }`}>
                    {feedback.type === 'success' ? <FiCheckCircle className="h-4 w-4" /> : <FiAlertCircle className="h-4 w-4" />}
                    <span>{feedback.message}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <form onSubmit={handleSubmit} className="lg:col-span-5 rounded-xl border border-primary/20 bg-surface p-6 shadow-sm space-y-4">
                    <h2 className="text-base font-bold">New Withdrawal Request</h2>
                    <div>
                        <label className="block text-xs font-semibold text-primary/80">Source Account</label>
                        <select value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className={inputClass}>
                            {accounts.map((acc) => (
                                <option key={acc._id} value={acc.accountNumber}>
                                    {acc.accountType} ({acc.accountNumber}) — Avail: {formatBDT(acc.availableBalance)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedAcc && (
                        <div className="rounded-lg border border-primary/15 bg-primary/[0.03] p-3 text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-primary/60">Available Balance:</span>
                                <span className="font-bold text-emerald-600">{formatBDT(selectedAcc.availableBalance)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-primary/60">Held for Pending Requests:</span>
                                <span className="font-semibold text-amber-600">{formatBDT(selectedAcc.heldAmount || 0)}</span>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-primary/80">Withdrawal Method</label>
                        <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputClass}>
                            <option value="Branch Cash Counter">Branch Cash Counter</option>
                            <option value="Pay Order / Cheque">Pay Order / Cheque</option>
                            <option value="Mobile Wallet Settlement">Mobile Wallet Settlement</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-primary/80">Amount (BDT)</label>
                        <input
                            type="number"
                            min={1}
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="e.g. 2000"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-primary/80">Note</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional note"
                            className={inputClass}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || accounts.length === 0}
                        className="w-full rounded-lg bg-amber-600 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? 'Submitting...' : 'Submit Withdrawal Request'}
                    </button>
                </form>

                <div className="lg:col-span-7 rounded-xl border border-primary/20 bg-surface p-6 shadow-sm space-y-4">
                    <h2 className="text-base font-bold">Recent Withdrawal Requests</h2>
                    {requests.length === 0 ? (
                        <p className="py-8 text-center text-xs text-primary/60">No withdrawal requests submitted yet.</p>
                    ) : (
                        <div className="space-y-2.5">
                            {requests.map((r) => (
                                <div key={r._id} className="flex items-center justify-between rounded-lg border border-primary/10 bg-primary/[0.02] p-3 text-xs">
                                    <div>
                                        <p className="font-bold">{r.requestId} • {r.accountNumber}</p>
                                        <p className="text-primary/60">{r.method} • {new Date(r.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-amber-600">{formatBDT(r.amount)}</p>
                                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                            r.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' :
                                            r.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600' :
                                            'bg-amber-500/10 text-amber-600'
                                        }`}>
                                            {r.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
