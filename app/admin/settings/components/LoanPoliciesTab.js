'use client';

export default function LoanPoliciesTab({ loanPolicies = [], onChange }) {
    const handlePolicyChange = (index, field, value) => {
        const updated = [...loanPolicies];
        updated[index] = { ...updated[index], [field]: value };
        onChange('loanPolicies', updated);
    };

    return (
        <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-4 text-xs">
            <div>
                <h4 className="text-sm font-bold text-primary">Credit & Loan Underwriting Policies</h4>
                <p className="text-[11px] opacity-70">
                    Modifying policies governs prospective applications only. Pre-existing approved loans preserve their original contractual terms.
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-primary/5 border-b border-primary/10 opacity-70 uppercase tracking-wider font-semibold">
                            <th className="py-3 px-3">Loan Product</th>
                            <th className="py-3 px-3">Annual Interest</th>
                            <th className="py-3 px-3">Interest Method</th>
                            <th className="py-3 px-3">Max Principal (BDT)</th>
                            <th className="py-3 px-3">Max Term (Mos)</th>
                            <th className="py-3 px-3">Min Monthly Income</th>
                            <th className="py-3 px-3 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10">
                        {loanPolicies.map((lp, idx) => (
                            <tr key={idx} className="hover:bg-primary/5 transition-colors">
                                <td className="py-3 px-3 font-semibold">{lp.loanType}</td>
                                <td className="py-3 px-3">
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={lp.annualRate ?? 10}
                                            onChange={(e) => handlePolicyChange(idx, 'annualRate', parseFloat(e.target.value) || 0)}
                                            className="w-16 px-2 py-1 rounded bg-surface border border-primary/20 text-primary text-xs"
                                        />
                                        <span>%</span>
                                    </div>
                                </td>
                                <td className="py-3 px-3">
                                    <select
                                        value={lp.interestMethod || 'REDUCING_BALANCE'}
                                        onChange={(e) => handlePolicyChange(idx, 'interestMethod', e.target.value)}
                                        className="px-2 py-1 rounded bg-surface border border-primary/20 text-primary text-xs"
                                    >
                                        <option value="REDUCING_BALANCE">Reducing Balance</option>
                                        <option value="FLAT">Flat Rate</option>
                                    </select>
                                </td>
                                <td className="py-3 px-3">
                                    <input
                                        type="number"
                                        value={lp.maxAmount ?? 500000}
                                        onChange={(e) => handlePolicyChange(idx, 'maxAmount', parseFloat(e.target.value) || 0)}
                                        className="w-28 px-2 py-1 rounded bg-surface border border-primary/20 text-primary text-xs"
                                    />
                                </td>
                                <td className="py-3 px-3">
                                    <input
                                        type="number"
                                        value={lp.maxDurationMonths ?? 36}
                                        onChange={(e) => handlePolicyChange(idx, 'maxDurationMonths', parseInt(e.target.value, 10) || 12)}
                                        className="w-16 px-2 py-1 rounded bg-surface border border-primary/20 text-primary text-xs"
                                    />
                                </td>
                                <td className="py-3 px-3">
                                    <input
                                        type="number"
                                        value={lp.minMonthlyIncome ?? 15000}
                                        onChange={(e) => handlePolicyChange(idx, 'minMonthlyIncome', parseFloat(e.target.value) || 0)}
                                        className="w-24 px-2 py-1 rounded bg-surface border border-primary/20 text-primary text-xs"
                                    />
                                </td>
                                <td className="py-3 px-3 text-right">
                                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={lp.enabled ?? true}
                                            onChange={(e) => handlePolicyChange(idx, 'enabled', e.target.checked)}
                                            className="w-4 h-4 accent-accent cursor-pointer"
                                        />
                                        <span className="text-[11px] font-semibold">{lp.enabled ? 'Available' : 'Suspended'}</span>
                                    </label>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
