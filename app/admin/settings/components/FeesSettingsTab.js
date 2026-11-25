'use client';

export default function FeesSettingsTab({ fees, onChange }) {
    if (!fees) return null;

    const feeItems = [
        { key: 'transfer', label: 'Inter-Account Fund Transfer' },
        { key: 'deposit', label: 'Counter Cash Deposit' },
        { key: 'withdrawal', label: 'Cash Cheque Withdrawal' },
        { key: 'accountOpening', label: 'New Account Origination' },
        { key: 'loanProcessing', label: 'Credit Application Processing' },
    ];

    return (
        <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-4 text-xs">
            <div>
                <h4 className="text-sm font-bold text-primary">Banking Service Fees & Tariffs</h4>
                <p className="text-[11px] opacity-70">
                    Service charges are recorded distinctly in double-entry ledgers (principal amounts are never overwritten).
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-primary/5 border-b border-primary/10 opacity-70 uppercase tracking-wider font-semibold">
                            <th className="py-3 px-3">Service Operation</th>
                            <th className="py-3 px-3">Fee Type</th>
                            <th className="py-3 px-3">Value</th>
                            <th className="py-3 px-3">Min Cap (BDT)</th>
                            <th className="py-3 px-3">Max Cap (BDT)</th>
                            <th className="py-3 px-3 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10">
                        {feeItems.map((item) => {
                            const f = fees[item.key] || { enabled: true, type: 'FIXED', value: 0, minFee: 0, maxFee: 0 };
                            return (
                                <tr key={item.key} className="hover:bg-primary/5 transition-colors">
                                    <td className="py-3 px-3 font-semibold">{item.label}</td>
                                    <td className="py-3 px-3">
                                        <select
                                            value={f.type || 'FIXED'}
                                            onChange={(e) => onChange(`fees.${item.key}.type`, e.target.value)}
                                            className="px-2 py-1 rounded bg-surface border border-primary/20 text-primary text-xs"
                                        >
                                            <option value="FIXED">Fixed (BDT)</option>
                                            <option value="PERCENTAGE">Percentage (%)</option>
                                        </select>
                                    </td>
                                    <td className="py-3 px-3">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={f.value ?? 0}
                                            onChange={(e) => onChange(`fees.${item.key}.value`, parseFloat(e.target.value) || 0)}
                                            className="w-20 px-2 py-1 rounded bg-surface border border-primary/20 text-primary text-xs"
                                        />
                                    </td>
                                    <td className="py-3 px-3">
                                        <input
                                            type="number"
                                            value={f.minFee ?? 0}
                                            onChange={(e) => onChange(`fees.${item.key}.minFee`, parseFloat(e.target.value) || 0)}
                                            className="w-20 px-2 py-1 rounded bg-surface border border-primary/20 text-primary text-xs"
                                        />
                                    </td>
                                    <td className="py-3 px-3">
                                        <input
                                            type="number"
                                            value={f.maxFee ?? 0}
                                            onChange={(e) => onChange(`fees.${item.key}.maxFee`, parseFloat(e.target.value) || 0)}
                                            className="w-20 px-2 py-1 rounded bg-surface border border-primary/20 text-primary text-xs"
                                        />
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={f.enabled ?? true}
                                                onChange={(e) => onChange(`fees.${item.key}.enabled`, e.target.checked)}
                                                className="w-4 h-4 accent-accent cursor-pointer"
                                            />
                                            <span className="text-[11px] font-semibold">{f.enabled ? 'Active' : 'Waived'}</span>
                                        </label>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
