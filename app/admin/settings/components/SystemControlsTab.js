'use client';

export default function SystemControlsTab({ systemControls, onChange }) {
    if (!systemControls) return null;

    const switches = [
        { key: 'customerRegistration', field: 'registrationEnabled', label: 'Customer Self-Registration', desc: 'Permit public onboarding registration' },
        { key: 'accountOpening', field: 'accountOpeningEnabled', label: 'New Bank Account Opening', desc: 'Permit opening new deposit/savings accounts' },
        { key: 'fundTransfer', field: 'transfersEnabled', label: 'Inter-Account Fund Transfers', desc: 'Permit customers to execute balance transfers' },
        { key: 'depositRequests', field: 'depositsEnabled', label: 'Deposit Requisitions', desc: 'Permit submitting counter/online deposit slips' },
        { key: 'withdrawalRequests', field: 'withdrawalsEnabled', label: 'Withdrawal Requisitions', desc: 'Permit requesting cash and bank cheques' },
        { key: 'loanApplications', field: 'loanApplicationsEnabled', label: 'Credit & Loan Applications', desc: 'Permit submitting new loan requests' },
    ];

    return (
        <div className="space-y-6 text-xs">
            {/* Maintenance Mode Callout */}
            <div className={`rounded-xl border p-5 shadow-sm space-y-3 transition-colors ${
                systemControls.maintenanceMode
                    ? 'border-rose-500 bg-rose-500/10'
                    : 'border-primary/20 bg-surface'
            }`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-primary">Institutional Maintenance Mode</h4>
                        <p className="text-[11px] opacity-70">
                            When enabled, customer and staff public portals show a scheduled maintenance page. Admin console remains accessible.
                        </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <span className="font-bold text-xs">{systemControls.maintenanceMode ? 'ENABLED' : 'OFF'}</span>
                        <input
                            type="checkbox"
                            checked={systemControls.maintenanceMode ?? false}
                            onChange={(e) => onChange('systemControls.maintenanceMode', e.target.checked)}
                            className="w-5 h-5 accent-rose-600 cursor-pointer"
                        />
                    </label>
                </div>

                {systemControls.maintenanceMode && (
                    <div className="pt-2">
                        <label className="block opacity-70 mb-1 font-semibold">Public Notice Message</label>
                        <textarea
                            rows={2}
                            value={systemControls.maintenanceMessage || ''}
                            onChange={(e) => onChange('systemControls.maintenanceMessage', e.target.value)}
                            className="w-full p-2.5 rounded-lg bg-surface border border-rose-500/30 text-primary text-xs"
                        />
                    </div>
                )}
            </div>

            {/* Individual Sub-system Operation Toggles */}
            <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-primary">Banking Service Operation Toggles</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {switches.map((item) => (
                        <label key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-primary/10 bg-primary/5 cursor-pointer">
                            <div>
                                <span className="font-semibold block">{item.label}</span>
                                <span className="opacity-60 text-[11px]">{item.desc}</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={systemControls[item.field] ?? true}
                                onChange={(e) => onChange(`systemControls.${item.field}`, e.target.checked)}
                                className="w-4 h-4 accent-accent cursor-pointer"
                            />
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
