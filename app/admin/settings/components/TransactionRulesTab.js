'use client';

export default function TransactionRulesTab({ rules, onChange }) {
    if (!rules) return null;

    const transfer = rules.transfer || {};
    const withdrawal = rules.withdrawal || {};
    const deposit = rules.deposit || {};
    const restrictions = rules.restrictions || {};

    return (
        <div className="space-y-6 text-xs">
            {/* Fund Transfer Limits */}
            <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-primary">Inter-Account Fund Transfer Limits</h4>
                        <p className="text-[11px] opacity-70">Enforced by backend transfer execution handlers.</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs font-semibold">Service Active</span>
                        <input
                            type="checkbox"
                            checked={transfer.enabled ?? true}
                            onChange={(e) => onChange('transactionRules.transfer.enabled', e.target.checked)}
                            className="w-4 h-4 accent-accent cursor-pointer"
                        />
                    </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block opacity-70 mb-1 font-semibold">Minimum Single Transfer (BDT)</label>
                        <input
                            type="number"
                            value={transfer.minAmount || 100}
                            onChange={(e) => onChange('transactionRules.transfer.minAmount', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs"
                        />
                    </div>
                    <div>
                        <label className="block opacity-70 mb-1 font-semibold">Maximum Single Transfer (BDT)</label>
                        <input
                            type="number"
                            value={transfer.maxAmount || 100000}
                            onChange={(e) => onChange('transactionRules.transfer.maxAmount', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs"
                        />
                    </div>
                    <div>
                        <label className="block opacity-70 mb-1 font-semibold">Daily Cumulative Transfer Limit (BDT)</label>
                        <input
                            type="number"
                            value={transfer.dailyLimit || 200000}
                            onChange={(e) => onChange('transactionRules.transfer.dailyLimit', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs"
                        />
                    </div>
                    <div>
                        <label className="block opacity-70 mb-1 font-semibold">Monthly Transfer Limit (BDT)</label>
                        <input
                            type="number"
                            value={transfer.monthlyLimit || 1000000}
                            onChange={(e) => onChange('transactionRules.transfer.monthlyLimit', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs"
                        />
                    </div>
                    <div>
                        <label className="block opacity-70 mb-1 font-semibold">Max Daily Transfer Count</label>
                        <input
                            type="number"
                            value={transfer.dailyCountLimit || 20}
                            onChange={(e) => onChange('transactionRules.transfer.dailyCountLimit', parseInt(e.target.value, 10) || 1)}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs"
                        />
                    </div>
                    <div>
                        <label className="block opacity-70 mb-1 font-semibold">Mandatory Minimum Balance (BDT)</label>
                        <input
                            type="number"
                            value={transfer.minRemainingBalance || 500}
                            onChange={(e) => onChange('transactionRules.transfer.minRemainingBalance', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs"
                        />
                    </div>
                </div>
            </div>

            {/* Withdrawal & Deposit Limits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Withdrawal */}
                <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-primary">Cash Withdrawal Limits</h4>
                    <div className="space-y-3">
                        <div>
                            <label className="block opacity-70 mb-1 font-semibold">Maximum Single Withdrawal (BDT)</label>
                            <input
                                type="number"
                                value={withdrawal.maxAmount || 50000}
                                onChange={(e) => onChange('transactionRules.withdrawal.maxAmount', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs"
                            />
                        </div>
                        <div>
                            <label className="block opacity-70 mb-1 font-semibold">Daily Cumulative Withdrawal Ceiling (BDT)</label>
                            <input
                                type="number"
                                value={withdrawal.dailyLimit || 100000}
                                onChange={(e) => onChange('transactionRules.withdrawal.dailyLimit', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs"
                            />
                        </div>
                    </div>
                </div>

                {/* Deposit */}
                <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-primary">Deposit Thresholds</h4>
                    <div className="space-y-3">
                        <div>
                            <label className="block opacity-70 mb-1 font-semibold">Maximum Single Deposit (BDT)</label>
                            <input
                                type="number"
                                value={deposit.maxAmount || 200000}
                                onChange={(e) => onChange('transactionRules.deposit.maxAmount', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs"
                            />
                        </div>
                        <div>
                            <label className="block opacity-70 mb-1 font-semibold">Daily Cumulative Deposit Limit (BDT)</label>
                            <input
                                type="number"
                                value={deposit.dailyLimit || 500000}
                                onChange={(e) => onChange('transactionRules.deposit.dailyLimit', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Transaction Restrictions & Switches */}
            <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-primary">Operational Restriction Switches</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center justify-between p-3 rounded-lg border border-primary/10 bg-primary/5 cursor-pointer">
                        <div>
                            <span className="font-semibold block">Require Approval Above Threshold</span>
                            <span className="opacity-60 text-[11px]">Route withdrawals above ৳100,000 to approvals queue</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={restrictions.requireApprovalAboveThreshold ?? true}
                            onChange={(e) => onChange('transactionRules.restrictions.requireApprovalAboveThreshold', e.target.checked)}
                            className="w-4 h-4 accent-accent cursor-pointer"
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-lg border border-primary/10 bg-primary/5 cursor-pointer">
                        <div>
                            <span className="font-semibold block">Block Frozen Account Outflows</span>
                            <span className="opacity-60 text-[11px]">Strictly prevent debits from accounts marked Frozen</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={restrictions.blockFrozenAccounts ?? true}
                            onChange={(e) => onChange('transactionRules.restrictions.blockFrozenAccounts', e.target.checked)}
                            className="w-4 h-4 accent-accent cursor-pointer"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}
