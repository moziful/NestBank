'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiFileText, FiPlus, FiArrowRight } from 'react-icons/fi';
import { formatBDT } from '@/lib/currency';

export default function CustomerLoansPage() {
    const [loans, setLoans] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/customer/loans');
                const json = await res.json();
                if (json.success) {
                    setLoans(json.loans || []);
                    setProducts(json.products || []);
                }
            } catch (err) {
                console.error('Failed to fetch customer loans:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-primary">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <FiFileText className="text-accent" /> My Loans
                    </h1>
                    <p className="mt-1 text-sm text-primary/70">
                        Track your loan applications, active loan balances, and repayment schedules.
                    </p>
                </div>
                <Link
                    href="/customer/loans/apply"
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-90"
                >
                    <FiPlus className="h-4 w-4" /> Apply for Loan
                </Link>
            </div>

            {/* Available Loan Products */}
            {products.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {products.map((p) => (
                        <div key={p.name} className="rounded-xl border border-primary/15 bg-surface p-3.5 shadow-sm">
                            <p className="text-xs font-bold text-primary">{p.name}</p>
                            <p className="mt-1 text-sm font-bold text-accent">{p.interestRate}% p.a.</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Loans Table */}
            <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-4">
                <h2 className="text-base font-bold">Loan Applications & Active Loans</h2>

                {loading ? (
                    <p className="py-8 text-center text-sm text-primary/60">Loading loans...</p>
                ) : loans.length === 0 ? (
                    <div className="py-10 text-center space-y-3">
                        <p className="text-sm text-primary/60">You have not applied for any loans yet.</p>
                        <Link
                            href="/customer/loans/apply"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white"
                        >
                            Apply Now <FiArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-primary/10 text-primary/60 uppercase">
                                    <th className="py-3 px-3">Loan ID</th>
                                    <th className="py-3 px-3">Product</th>
                                    <th className="py-3 px-3">Principal</th>
                                    <th className="py-3 px-3">Monthly EMI</th>
                                    <th className="py-3 px-3">Tenor</th>
                                    <th className="py-3 px-3">Status</th>
                                    <th className="py-3 px-3 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/10">
                                {loans.map((l) => (
                                    <tr key={l._id} className="hover:bg-primary/[0.02]">
                                        <td className="py-3 px-3 font-mono font-bold text-accent">{l.loanId}</td>
                                        <td className="py-3 px-3 font-semibold">{l.loanType}</td>
                                        <td className="py-3 px-3 font-bold">{formatBDT(l.amount)}</td>
                                        <td className="py-3 px-3">{formatBDT(l.monthlyInstallment || 0)}</td>
                                        <td className="py-3 px-3">{l.durationMonths} mos @ {l.interestRate}%</td>
                                        <td className="py-3 px-3">
                                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                                l.status === 'Active' || l.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600' :
                                                l.status === 'Overdue' || l.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600' :
                                                'bg-amber-500/10 text-amber-600'
                                            }`}>
                                                {l.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                            <Link
                                                href={`/customer/loans/${l.loanId || l._id}`}
                                                className="rounded-md bg-accent/15 px-3 py-1 text-[11px] font-semibold text-accent hover:bg-accent/25"
                                            >
                                                View Schedule
                                            </Link>
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
