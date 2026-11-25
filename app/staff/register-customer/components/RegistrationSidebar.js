'use client';

import { FiCheckCircle, FiCircle, FiInfo, FiClock, FiTrash2 } from 'react-icons/fi';
import DuplicateCustomerWarning from './DuplicateCustomerWarning';

export default function RegistrationSidebar({
    currentStep,
    completedSteps = {},
    formData,
    duplicateMatches = [],
    checkingDuplicate = false,
    savedDrafts = [],
    activeDraftId = null,
    onLoadDraft,
    onDeleteDraft,
}) {
    const completedCount = Object.values(completedSteps).filter(Boolean).length;
    const progressPercent = Math.round((completedCount / 5) * 100);

    const checklist = [
        {
            label: 'Personal details & age >= 18',
            done: Boolean(completedSteps[1]),
        },
        {
            label: 'Normalized BD mobile & present address',
            done: Boolean(completedSteps[2]),
        },
        {
            label: 'Identity document & front scan uploaded',
            done: Boolean(completedSteps[3]),
        },
        {
            label: 'Employment & nominee info reviewed',
            done: Boolean(completedSteps[4]),
        },
        {
            label: 'No unresolved duplicate matches',
            done: duplicateMatches.length === 0 && Boolean(formData?.contactInfo?.mobile),
        },
    ];

    return (
        <aside className="space-y-4">
            {/* Duplicate Warning Panel */}
            <DuplicateCustomerWarning matches={duplicateMatches} checking={checkingDuplicate} />

            {/* Registration Progress */}
            <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-primary">Registration Progress</h3>
                    <span className="text-xs font-bold text-accent">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-primary/10 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-accent transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <p className="text-[11px] text-primary/65">
                    Step {currentStep} of 5 • {completedCount} sections validated
                </p>
            </div>

            {/* Verification Checklist */}
            <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-primary">Verification Checklist</h3>
                <ul className="space-y-2.5 text-xs">
                    {checklist.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                            {item.done ? (
                                <FiCheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                                <FiCircle className="h-4 w-4 text-primary/30 shrink-0 mt-0.5" />
                            )}
                            <span className={item.done ? 'text-primary font-medium' : 'text-primary/65'}>
                                {item.label}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Saved Drafts */}
            {savedDrafts.length > 0 && (
                <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
                            <FiClock className="h-4 w-4 text-accent" /> Saved Drafts
                        </h3>
                        <span className="text-[11px] text-primary/60">{savedDrafts.length}</span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {savedDrafts.map((d) => {
                            const draftName =
                                [d.formData?.personalInfo?.firstName, d.formData?.personalInfo?.lastName]
                                    .filter(Boolean)
                                    .join(' ') || 'Untitled Draft';
                            const isCurrent = activeDraftId === d._id;

                            return (
                                <div
                                    key={d._id}
                                    className={`flex items-center justify-between gap-2 rounded-lg border p-2 text-xs ${
                                        isCurrent
                                            ? 'border-accent bg-accent/10'
                                            : 'border-primary/10 bg-primary/[0.02]'
                                    }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => onLoadDraft(d)}
                                        className="min-w-0 flex-1 text-left cursor-pointer"
                                    >
                                        <p className="truncate font-semibold text-primary">{draftName}</p>
                                        <p className="text-[10px] text-primary/60">
                                            Step {d.currentStep || 1} • {new Date(d.updatedAt).toLocaleDateString()}
                                        </p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDeleteDraft(d._id)}
                                        title="Delete draft"
                                        className="p-1 text-primary/50 hover:text-rose-500 cursor-pointer"
                                    >
                                        <FiTrash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Submission Guidance */}
            <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm space-y-2">
                <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
                    <FiInfo className="h-4 w-4 text-accent" /> Submission Guidance
                </h3>
                <ul className="space-y-1.5 text-[11px] text-primary/70 list-disc pl-4">
                    <li>Registration creates a <strong>PENDING</strong> customer profile only.</li>
                    <li>No bank account or deposit is created automatically.</li>
                    <li>Uploading KYC documents sets verification to <strong>Pending</strong> until reviewed.</li>
                    <li>Internal staff notes are hidden from customer-facing profiles.</li>
                </ul>
            </div>
        </aside>
    );
}
