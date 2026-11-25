'use client';

import { useState } from 'react';

export default function DisbursementModal({ loan, onClose, onDisbursed }) {
    const [destinationAccount, setDestinationAccount] = useState(loan?.accountNumber || '');
    const [adminNote, setAdminNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (!loan) return null;

    const handleConfirmDisbursement = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');
        try {
            const res = await fetch(`/api/admin/loans/${loan.loanId || loan._id}/disburse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destinationAccountNumber: destinationAccount,
                    adminNote
                })
            });
            const data = await res.json();
            if (data.success) {
                onDisbursed();
            } else {
                setErrorMsg(data.message || 'Disbursement failed.');
            }
        } catch (err) {
            setErrorMsg('Network error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-md bg-surface text-primary border border-primary/20 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-150 text-xs">
                <div>
                    <h3 className="text-base font-bold">Execute Loan Disbursement</h3>
                    <p className="opacity-70 mt-0.5">
                        Credit principal funds to the verified customer bank account.
                    </p>
                </div>

                {errorMsg && (
                    <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-400">
                        {errorMsg}
                    </div>
                )}

                <div className="p-3.5 rounded-xl bg-accent/10 border border-primary/10 space-y-2">
                    <div className="flex justify-between font-medium">
                        <span className="opacity-70">Loan Identifier</span>
                        <span className="font-mono font-bold text-accent">{loan.loanId || loan.applicationId}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                        <span className="opacity-70">Applicant</span>
                        <span className="font-semibold">{loan.customerName}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                        <span className="opacity-70">Principal Amount</span>
                        <span className="font-bold text-sm text-accent">
                            ৳{(loan.approvedAmount || loan.amount || loan.requestedAmount || 0).toLocaleString()}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleConfirmDisbursement} className="space-y-3 pt-1">
                    <div>
                        <label className="block font-semibold mb-1 opacity-70">Destination Bank Account Number</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. NB1002938471"
                            value={destinationAccount}
                            onChange={(e) => setDestinationAccount(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs font-mono focus:ring-1 focus:ring-accent"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1 opacity-70">Admin Authorization Note</label>
                        <textarea
                            rows={2}
                            placeholder="Verified national ID and sanction letter..."
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            className="w-full p-2.5 rounded-lg bg-surface border border-primary/20 text-primary text-xs focus:ring-1 focus:ring-accent"
                        />
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/5 font-semibold cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !destinationAccount}
                            className="px-5 py-2 rounded-lg bg-accent text-white hover:opacity-90 font-bold cursor-pointer transition-opacity disabled:opacity-40"
                        >
                            {submitting ? 'Disbursing...' : 'Confirm & Disburse Funds'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
