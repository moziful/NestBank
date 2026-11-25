'use client';

import { FiCheck } from 'react-icons/fi';

export const REGISTRATION_STEPS = [
    { id: 1, title: 'Personal Info', subtitle: 'Identity & demographics' },
    { id: 2, title: 'Contact & Address', subtitle: 'Phone, email & location' },
    { id: 3, title: 'Identity KYC', subtitle: 'NID / Passport upload' },
    { id: 4, title: 'Additional Info', subtitle: 'Employment & nominee' },
    { id: 5, title: 'Review & Submit', subtitle: 'Verify & register' },
];

export default function RegistrationStepper({ currentStep, completedSteps = {}, onStepClick }) {
    return (
        <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {REGISTRATION_STEPS.map((step) => {
                    const isActive = currentStep === step.id;
                    const isDone = Boolean(completedSteps[step.id]) && !isActive;

                    return (
                        <button
                            key={step.id}
                            type="button"
                            onClick={() => onStepClick(step.id)}
                            className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition cursor-pointer ${
                                isActive
                                    ? 'border-accent bg-accent/10 text-primary'
                                    : isDone
                                    ? 'border-emerald-500/30 bg-emerald-500/5 text-primary hover:bg-emerald-500/10'
                                    : 'border-primary/10 bg-primary/[0.02] text-primary/70 hover:bg-primary/5'
                            }`}
                        >
                            <div
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                    isActive
                                        ? 'bg-accent text-white'
                                        : isDone
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-primary/10 text-primary/70'
                                }`}
                            >
                                {isDone ? <FiCheck className="h-4 w-4" /> : step.id}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-xs font-bold leading-tight">{step.title}</p>
                                <p className="truncate text-[10px] opacity-65">{step.subtitle}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
