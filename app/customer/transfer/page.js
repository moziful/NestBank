'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiSend, FiCheckCircle, FiAlertCircle, FiLock, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { formatBDT } from '@/lib/currency';

export default function CustomerTransferPage() {
    const [accounts, setAccounts] = useState([]);
    const [fromAccount, setFromAccount] = useState('');
    const [toAccount, setToAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [pin, setPin] = useState('');
    const [step, setStep] = useState('FORM'); // FORM | REVIEW | RECEIPT
    const [idempotencyKey, setIdempotencyKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [receipt, setReceipt] = useState(null);

    const loadAccounts = async () => {
        try {
            const res = await fetch('/api/customer/accounts');
            const json = await res.json();
            if (json.success && json.accounts?.length > 0) {
                setAccounts(json.accounts);
                const firstActive = json.accounts.find((a) => a.status === 'Active') || json.accounts[0];
                setFromAccount(firstActive.accountNumber);
            }
        } catch (err) {
            console.error('Failed to load accounts:', err);
        }
    };

    useEffect(() => {
        loadAccounts();
        setIdempotencyKey(`TRF-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    }, []);

    const selectedSource = accounts.find((a) => a.accountNumber === fromAccount);

    const handleReview = (e) => {
        e.preventDefault();
        setError('');
        const num = Number(amount);
        if (!fromAccount || !toAccount.trim()) {
            setError('Please select a source account and enter recipient account number.');
            return;
        }
        if (fromAccount === toAccount.trim()) {
            setError('Source and recipient accounts cannot be the same.');
            return;
        }
        if (!num || num <= 0) {
            setError('Enter a valid positive transfer amount.');
            return;
        }
        if (selectedSource && num > selectedSource.availableBalance) {
            setError('Transfer amount exceeds your available balance.');
            return;
        }
        setStep('REVIEW');
    };

    const handleConfirmTransfer = async (e) => {
        e.preventDefault();
        setError('');
        if (!pin || pin.length < 4) {
            setError('Please enter your 4-6 digit Transaction PIN.');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/customer/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fromAccountNumber: fromAccount,
                    toAccountNumber: toAccount.trim(),
                    amount: Number(amount),
                    description,
                    pin,
                    idempotencyKey,
                }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                setError(json.message || 'Transfer failed.');
                return;
            }
            setReceipt(json.receipt);
            setStep('RECEIPT');
            loadAccounts();
        } catch {
            setError('Network error while processing transfer.');
        } finally {
            setLoading(false);
        }
    };

    const handleNewTransfer = () => {
        setToAccount('');
        setAmount('');
        setDescription('');
        setPin('');
        setError('');
        setReceipt(null);
        setStep('FORM');
        setIdempotencyKey(`TRF-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    };

    const inputClass =
        'mt-1 w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary outline-none focus:border-accent';

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 text-primary">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                    <FiSend className="text-accent" /> Transfer Money
                </h1>
                <p className="mt-1 text-sm text-primary/70">
                    Send funds securely between NestBank accounts with real-time PIN verification.
                </p>
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-medium text-rose-600">
                    <FiAlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {step === 'FORM' && (
                <form onSubmit={handleReview} className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-primary/80">Source Account</label>
                        <select
                            value={fromAccount}
                            onChange={(e) => setFromAccount(e.target.value)}
                            className={inputClass}
                        >
                            {accounts.map((acc) => (
                                <option key={acc._id} value={acc.accountNumber}>
                                    {acc.accountType} ({acc.accountNumber}) — Available: {formatBDT(acc.availableBalance)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-primary/80">Recipient Account Number</label>
                        <input
                            type="text"
                            required
                            value={toAccount}
                            onChange={(e) => setToAccount(e.target.value)}
                            placeholder="e.g. NB-10023456"
                            className={inputClass}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-primary/80">Amount (BDT)</label>
                            <input
                                type="number"
                                min={1}
                                step="any"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className={inputClass}
                            />
                            {selectedSource && (
                                <p className="mt-1 text-[11px] text-primary/60">
                                    Available: {formatBDT(selectedSource.availableBalance)} • Limit: {formatBDT(selectedSource.perTransactionLimit || 500000)}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-primary/80">Description / Reference</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. Monthly Rent, Invoice #12"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            className="rounded-lg bg-accent px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 cursor-pointer"
                        >
                            Review Transfer
                        </button>
                    </div>
                </form>
            )}

            {step === 'REVIEW' && (
                <form onSubmit={handleConfirmTransfer} className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm space-y-5">
                    <h2 className="text-lg font-bold">Review & Authorize Transfer</h2>

                    <div className="rounded-xl border border-primary/15 bg-primary/[0.02] p-4 space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-primary/60">From Account:</span>
                            <span className="font-mono font-bold">{fromAccount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-primary/60">To Account:</span>
                            <span className="font-mono font-bold">{toAccount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-primary/60">Transfer Amount:</span>
                            <span className="text-base font-bold text-accent">{formatBDT(Number(amount))}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-primary/60">Description:</span>
                            <span>{description || 'Fund Transfer'}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-primary/80 flex items-center gap-1.5">
                            <FiLock className="text-accent" /> Enter Transaction PIN
                        </label>
                        <input
                            type="password"
                            maxLength={6}
                            required
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="4-6 digit PIN"
                            className={inputClass}
                        />
                        <p className="mt-1 text-[11px] text-primary/60">
                            Haven&apos;t set a PIN yet? <Link href="/customer/profile/security" className="text-accent underline">Configure PIN</Link>
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <button
                            type="button"
                            onClick={() => setStep('FORM')}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 px-4 py-2 text-xs font-semibold hover:bg-primary/5 cursor-pointer"
                        >
                            <FiArrowLeft className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? 'Processing...' : 'Confirm & Send Money'}
                        </button>
                    </div>
                </form>
            )}

            {step === 'RECEIPT' && receipt && (
                <div className="rounded-xl border border-emerald-500/30 bg-surface p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-emerald-500/15 p-3 text-emerald-600">
                            <FiCheckCircle className="h-7 w-7" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Transfer Successful</h2>
                            <p className="text-xs text-primary/65">Transaction ID: {receipt.transactionId}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-primary/15 bg-primary/[0.02] p-4 space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-primary/60">From:</span>
                            <span className="font-mono font-semibold">{receipt.fromAccount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-primary/60">To:</span>
                            <span className="font-mono font-semibold">{receipt.toAccount} ({receipt.recipientName})</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-primary/60">Amount:</span>
                            <span className="font-bold text-emerald-600 text-sm">{formatBDT(receipt.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-primary/60">Date:</span>
                            <span>{new Date(receipt.createdAt).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleNewTransfer}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white cursor-pointer"
                        >
                            <FiRefreshCw className="h-3.5 w-3.5" /> New Transfer
                        </button>
                        <Link
                            href="/customer/transactions"
                            className="rounded-lg border border-primary/20 px-4 py-2 text-xs font-semibold hover:bg-primary/5"
                        >
                            View Transactions
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
