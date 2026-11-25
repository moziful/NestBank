'use client';

import { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export default function DeactivateStaffDialog({ isOpen, staff, onClose, onConfirm, isPending }) {
    const [reason, setReason] = useState('');
    const [targetAction, setTargetAction] = useState('Inactive'); // Inactive or Suspended

    if (!isOpen || !staff) return null;

    const handleAction = () => {
        onConfirm({ id: staff._id || staff.id, status: targetAction, reason });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-primary/20 bg-surface p-6 shadow-2xl text-primary animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-rose-500/15 grid place-items-center text-rose-600 shrink-0">
                        <FiAlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold">Manage Account Access</h3>
                        <p className="text-xs opacity-75">{staff.name} ({staff.employeeId})</p>
                    </div>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                    <p className="opacity-80">
                        Select whether to deactivate or suspend this employee. The employee will no longer be able to sign in. Previous banking transactions and audit history will remain preserved.
                    </p>

                    <div>
                        <label className="block font-semibold mb-1">Target Action</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setTargetAction('Inactive')}
                                className={`rounded-lg border py-2 text-center font-medium transition-colors ${
                                    targetAction === 'Inactive'
                                        ? 'border-zinc-700 bg-zinc-600 text-white'
                                        : 'border-primary/20 bg-white/20'
                                }`}
                            >
                                Deactivate
                            </button>
                            <button
                                type="button"
                                onClick={() => setTargetAction('Suspended')}
                                className={`rounded-lg border py-2 text-center font-medium transition-colors ${
                                    targetAction === 'Suspended'
                                        ? 'border-rose-600 bg-rose-600 text-white'
                                        : 'border-primary/20 bg-white/20'
                                }`}
                            >
                                Suspend (Investigation)
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Reason for status change</label>
                        <textarea
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Leave of absence, departmental reassignment, or pending inquiry..."
                            className="w-full rounded-lg border border-primary/20 bg-white/20 p-2 outline-none focus:border-accent text-xs"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="rounded-lg border border-primary/20 px-4 py-2 text-xs font-semibold hover:bg-primary/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleAction}
                        disabled={isPending}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
                    >
                        {isPending ? 'Processing...' : `Confirm ${targetAction}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
