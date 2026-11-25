'use client';

export default function GeneralSettingsTab({ data, onChange }) {
    if (!data) return null;

    return (
        <div className="space-y-6 text-xs">
            {/* Bank Information */}
            <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-primary">Institutional Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block opacity-70 mb-1 font-semibold">Bank Name</label>
                        <input
                            type="text"
                            value={data.bankName || ''}
                            onChange={(e) => onChange('general.bankName', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs focus:ring-1 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label className="block opacity-70 mb-1 font-semibold">Bank Code</label>
                        <input
                            type="text"
                            value={data.bankCode || ''}
                            onChange={(e) => onChange('general.bankCode', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs focus:ring-1 focus:ring-accent font-mono"
                        />
                    </div>
                    <div>
                        <label className="block opacity-70 mb-1 font-semibold">Currency Code</label>
                        <input
                            type="text"
                            disabled
                            value={data.currency || 'BDT'}
                            className="w-full px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-primary text-xs font-mono opacity-80"
                        />
                    </div>
                    <div>
                        <label className="block opacity-70 mb-1 font-semibold">Support Email</label>
                        <input
                            type="email"
                            value={data.supportEmail || ''}
                            onChange={(e) => onChange('general.supportEmail', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs focus:ring-1 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label className="block opacity-70 mb-1 font-semibold">Support Helpline</label>
                        <input
                            type="text"
                            value={data.supportPhone || ''}
                            onChange={(e) => onChange('general.supportPhone', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs focus:ring-1 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label className="block opacity-70 mb-1 font-semibold">Operating Time Zone</label>
                        <select
                            value={data.timezone || 'Asia/Dhaka'}
                            onChange={(e) => onChange('general.timezone', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs focus:ring-1 focus:ring-accent cursor-pointer"
                        >
                            <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                            <option value="UTC">UTC (GMT+0)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Default Account Rules */}
            <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-primary">Default Account Governance</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block opacity-70 mb-1 font-semibold">Default Account Status</label>
                        <select
                            value={data.defaultAccountStatus || 'Active'}
                            onChange={(e) => onChange('general.defaultAccountStatus', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs focus:ring-1 focus:ring-accent cursor-pointer"
                        >
                            <option value="Active">Active</option>
                            <option value="Pending Verification">Pending Verification</option>
                        </select>
                    </div>
                    <div>
                        <label className="block opacity-70 mb-1 font-semibold">Minimum Opening Balance (BDT)</label>
                        <input
                            type="number"
                            min="0"
                            value={data.minimumOpeningBalance || 500}
                            onChange={(e) => onChange('general.minimumOpeningBalance', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs focus:ring-1 focus:ring-accent"
                        />
                        <span className="text-[10px] opacity-60 block mt-1">* Enforced for new account creations.</span>
                    </div>
                    <div>
                        <label className="block opacity-70 mb-1 font-semibold">Max Accounts per Customer</label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={data.maximumAccountsPerCustomer || 5}
                            onChange={(e) => onChange('general.maximumAccountsPerCustomer', parseInt(e.target.value, 10) || 1)}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-primary text-xs focus:ring-1 focus:ring-accent"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
