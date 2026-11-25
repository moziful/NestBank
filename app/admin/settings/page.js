'use client';

import { useState, useEffect } from 'react';
import GeneralSettingsTab from './components/GeneralSettingsTab';
import TransactionRulesTab from './components/TransactionRulesTab';
import FeesSettingsTab from './components/FeesSettingsTab';
import LoanPoliciesTab from './components/LoanPoliciesTab';
import SecurityRiskTab from './components/SecurityRiskTab';
import SystemControlsTab from './components/SystemControlsTab';
import ChangeHistoryTab from './components/ChangeHistoryTab';

export default function AdminSettingsPage() {
    const [originalSettings, setOriginalSettings] = useState(null);
    const [settings, setSettings] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [activeTab, setActiveTab] = useState('GENERAL');
    const [hasChanges, setHasChanges] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [changeReason, setChangeReason] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (data.success) {
                setOriginalSettings(data.settings);
                setSettings(JSON.parse(JSON.stringify(data.settings)));
                setHasChanges(false);
            }
        } catch (err) {
            console.error('Failed to load settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/admin/settings/history');
            const data = await res.json();
            if (data.success) {
                setHistory(data.history || []);
            }
        } catch (err) {
            console.error('Failed to load history:', err);
        }
    };

    useEffect(() => {
        fetchSettings();
        fetchHistory();
    }, []);

    const handleFieldChange = (path, value) => {
        setSettings(prev => {
            const updated = JSON.parse(JSON.stringify(prev));
            const parts = path.split('.');
            let current = updated;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) current[parts[i]] = {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
            return updated;
        });
        setHasChanges(true);
    };

    const handleReset = () => {
        if (originalSettings) {
            setSettings(JSON.parse(JSON.stringify(originalSettings)));
            setHasChanges(false);
            setErrorMsg('');
        }
    };

    const handleSaveConfirm = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    settings,
                    reason: changeReason || 'Administrative configuration update'
                })
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMsg(data.message);
                setShowConfirmModal(false);
                setChangeReason('');
                setOriginalSettings(data.settings);
                setSettings(JSON.parse(JSON.stringify(data.settings)));
                setHasChanges(false);
                fetchHistory();
            } else {
                setErrorMsg(data.message || 'Failed to save settings.');
            }
        } catch (err) {
            setErrorMsg('Network error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    const handleRestore = async (version) => {
        if (!confirm(`Are you sure you want to rollback to configuration v${version}?`)) return;
        setRestoring(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const res = await fetch(`/api/admin/settings/restore/${version}`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMsg(data.message);
                fetchSettings();
                fetchHistory();
            } else {
                setErrorMsg(data.message || 'Failed to rollback version.');
            }
        } catch (err) {
            setErrorMsg('Network error occurred.');
        } finally {
            setRestoring(false);
        }
    };

    const tabs = [
        { id: 'GENERAL', label: 'General' },
        { id: 'RULES', label: 'Transaction Rules' },
        { id: 'FEES', label: 'Fees & Charges' },
        { id: 'LOANS', label: 'Loan Policies' },
        { id: 'RISK', label: 'Security & Risk' },
        { id: 'SYSTEM', label: 'System Controls' },
        { id: 'HISTORY', label: 'Change History' },
    ];

    if (loading) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="h-10 w-48 bg-primary/10 rounded animate-pulse" />
                <div className="h-96 bg-primary/5 rounded-xl border border-primary/20 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-primary/10">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black tracking-tight">Banking Settings</h1>
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-accent/15 text-accent">
                            v{settings?.version || 1}
                        </span>
                    </div>
                    <p className="text-xs opacity-60 mt-1">
                        Configure institutional operational rules, limits, fee tariffs, and risk parameters.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={!hasChanges}
                        onClick={handleReset}
                        className="px-3.5 py-2 rounded-lg border border-primary/20 hover:bg-primary/5 text-xs font-semibold cursor-pointer transition-colors disabled:opacity-40"
                    >
                        Reset Changes
                    </button>
                    <button
                        type="button"
                        disabled={!hasChanges || saving}
                        onClick={() => setShowConfirmModal(true)}
                        className="px-4 py-2 rounded-lg bg-accent text-white hover:opacity-90 text-xs font-bold shadow transition-opacity cursor-pointer disabled:opacity-40"
                    >
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Notifications */}
            {successMsg && (
                <div className="p-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                    {successMsg}
                </div>
            )}
            {errorMsg && (
                <div className="p-3.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-medium">
                    {errorMsg}
                </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-primary/10">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                                isActive
                                    ? 'bg-accent text-surface shadow'
                                    : 'opacity-70 hover:opacity-100 hover:bg-primary/5'
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Body */}
            <div>
                {activeTab === 'GENERAL' && (
                    <GeneralSettingsTab data={settings?.general} onChange={handleFieldChange} />
                )}
                {activeTab === 'RULES' && (
                    <TransactionRulesTab rules={settings?.transactionRules} onChange={handleFieldChange} />
                )}
                {activeTab === 'FEES' && (
                    <FeesSettingsTab fees={settings?.fees} onChange={handleFieldChange} />
                )}
                {activeTab === 'LOANS' && (
                    <LoanPoliciesTab
                        loanPolicies={settings?.loanPolicies}
                        onChange={(field, val) => {
                            setSettings(prev => ({ ...prev, [field]: val }));
                            setHasChanges(true);
                        }}
                    />
                )}
                {activeTab === 'RISK' && (
                    <SecurityRiskTab riskRules={settings?.riskRules} onChange={handleFieldChange} />
                )}
                {activeTab === 'SYSTEM' && (
                    <SystemControlsTab systemControls={settings?.systemControls} onChange={handleFieldChange} />
                )}
                {activeTab === 'HISTORY' && (
                    <ChangeHistoryTab history={history} onRestore={handleRestore} restoring={restoring} />
                )}
            </div>

            {/* Confirmation Dialog */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md bg-surface text-primary border border-primary/20 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-150">
                        <h3 className="text-base font-bold">Confirm Banking Configuration Update</h3>
                        <p className="text-xs opacity-75">
                            You are saving a new version (v{(settings?.version || 1) + 1}) of the bank-wide operational rules.
                        </p>
                        <div>
                            <label className="block text-xs font-semibold mb-1 opacity-70">Reason for Change (Audit Log Memo)</label>
                            <textarea
                                rows={2}
                                required
                                placeholder="Explain reason for policy change (e.g. Annual transfer limit increase)..."
                                value={changeReason}
                                onChange={(e) => setChangeReason(e.target.value)}
                                className="w-full p-2.5 rounded-lg bg-surface border border-primary/20 text-xs text-primary focus:ring-1 focus:ring-accent"
                            />
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/5 text-xs font-semibold cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={saving}
                                onClick={handleSaveConfirm}
                                className="px-5 py-2 rounded-lg bg-accent text-white hover:opacity-90 text-xs font-bold cursor-pointer transition-opacity"
                            >
                                {saving ? 'Saving...' : 'Confirm & Apply'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
