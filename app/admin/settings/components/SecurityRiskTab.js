'use client';

export default function SecurityRiskTab({ riskRules, onChange }) {
    if (!riskRules) return null;

    return (
        <div className="space-y-6 text-xs">
            <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-primary">Automated Surveillance & Risk Thresholds</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block opacity-70 mb-1 font-semibold">Large Transfer Alert (BDT)</label>
                        <input
                            type="number"
                            value={riskRules.largeTransferAlert || 100000}
                            onChange={(e) => onChange('riskRules.largeTransferAlert', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs"
                        />
                    </div>
                    <div>
                        <label className="block opacity-70 mb-1 font-semibold">Large Withdrawal Alert (BDT)</label>
                        <input
                            type="number"
                            value={riskRules.largeWithdrawalAlert || 50000}
                            onChange={(e) => onChange('riskRules.largeWithdrawalAlert', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs"
                        />
                    </div>
                    <div>
                        <label className="block opacity-70 mb-1 font-semibold">Failed Login Lockout Threshold</label>
                        <input
                            type="number"
                            value={riskRules.failedLoginAlert || 5}
                            onChange={(e) => onChange('riskRules.failedLoginAlert', parseInt(e.target.value, 10) || 5)}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs"
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-primary">Automated Fraud Detection Rules</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center justify-between p-3 rounded-lg border border-primary/10 bg-primary/5 cursor-pointer">
                        <div>
                            <span className="font-semibold block">High Velocity Transaction Alerts</span>
                            <span className="opacity-60 text-[11px]">Flag accounts initiating &gt;10 transactions in 10 minutes</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={riskRules.enableRepeatedTransactionDetection ?? true}
                            onChange={(e) => onChange('riskRules.enableRepeatedTransactionDetection', e.target.checked)}
                            className="w-4 h-4 accent-accent cursor-pointer"
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-lg border border-primary/10 bg-primary/5 cursor-pointer">
                        <div>
                            <span className="font-semibold block">New Account High-Value Scrutiny</span>
                            <span className="opacity-60 text-[11px]">Flag transfers &gt;৳50,000 on accounts created in last 7 days</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={riskRules.enableNewAccountHighValueAlerts ?? true}
                            onChange={(e) => onChange('riskRules.enableNewAccountHighValueAlerts', e.target.checked)}
                            className="w-4 h-4 accent-accent cursor-pointer"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}
