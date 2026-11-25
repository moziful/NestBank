'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { formatBDT } from '@/lib/currency';

const RATES = {
    'Personal Loan': 11.5,
    'Home Loan': 8.5,
    'Business Loan': 10.0,
    'Auto Loan': 9.5,
    'Education Loan': 7.5,
};

export default function CustomerApplyLoanPage() {
    const router = useRouter();
    const [accounts, setAccounts] = useState([]);
    const [loanType, setLoanType] = useState('Personal Loan');
    const [amount, setAmount] = useState('100000');
    const [durationMonths, setDurationMonths] = useState('12');
    const [accountNumber, setAccountNumber] = useState('');
    const [monthlyIncome, setMonthlyIncome] = useState('');
    const [purpose, setPurpose] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/customer/accounts')
            .then((r) => r.json())
            .then((json) => {
                if (json.success && json.accounts?.length > 0) {
                    setAccounts(json.accounts);
                    setAccountNumber(json.accounts[0].accountNumber);
                }
            })
            .catch(() => {});
    }, []);

    const principal = Number(amount) || 0;
    const months = Number(durationMonths) || 12;
    const rate = RATES[loanType] || 11.5;
    const monthlyRate = rate / 12 / 100;
    const estimatedEmi =
        principal > 0 && months > 0
            ? Math.round((principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1))
            : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/customer/loans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    loanType,
                    amount: principal,
                    durationMonths: months,
                    accountNumber,
                    monthlyIncome: Number(monthlyIncome) || 0,
                    purpose,
                }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                setError(json.message || 'Loan application failed.');
                return;
            }
            router.push('/customer/loans');
        } catch {
            setError('Network error submitting loan application.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        'mt-1 w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary outline-none focus:border-accent';

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 text-primary">
            <div className="flex items-center gap-3">
                <Link href="/customer/loans" className="p-2 rounded-lg border border-primary/20 bg-surface hover:bg-primary/5">
                    <FiArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Apply for a Loan</h1>
                    <p className="text-xs text-primary/70">Submit a loan application for Staff verification and Admin underwriting.</p>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-medium text-rose-600">
                    <FiAlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-primary/80">Loan Product</label>
                        <select value={loanType} onChange={(e) => setLoanType(e.target.value)} className={inputClass}>
                            {Object.keys(RATES).map((k) => (
                                <option key={k} value={k}>{k} ({RATES[k]}% p.a.)</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-primary/80">Disbursement Account</label>
                        <select value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className={inputClass}>
                            {accounts.map((a) => (
                                <option key={a._id} value={a.accountNumber}>{a.accountType} ({a.accountNumber})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-primary/80">Requested Amount (BDT)</label>
                        <input
                            type="number"
                            min={10000}
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-primary/80">Tenor (Months)</label>
                        <select value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)} className={inputClass}>
                            {[6, 12, 18, 24, 36, 48, 60].map((m) => (
                                <option key={m} value={m}>{m} Months</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-primary/80">Monthly Income (BDT)</label>
                        <input
                            type="number"
                            min={0}
                            value={monthlyIncome}
                            onChange={(e) => setMonthlyIncome(e.target.value)}
                            placeholder="e.g. 60000"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-primary/80">Purpose</label>
                        <input
                            type="text"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            placeholder="e.g. Home renovation"
                            className={inputClass}
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-accent/30 bg-accent/10 p-4 flex items-center justify-between text-xs">
                    <div>
                        <p className="font-bold text-primary">Estimated Monthly Installment (EMI)</p>
                        <p className="text-primary/70">Interest Rate: {rate}% p.a. • Reducing Balance</p>
                    </div>
                    <p className="text-xl font-bold text-accent">{formatBDT(estimatedEmi)}/mo</p>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={loading || accounts.length === 0}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 cursor-pointer"
                    >
                        <FiCheckCircle className="h-4 w-4" />
                        {loading ? 'Submitting...' : 'Submit Application'}
                    </button>
                </div>
            </form>
        </div>
    );
}
