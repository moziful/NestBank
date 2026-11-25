'use client';

import CustomerSummary from '@/app/components/customers/CustomerSummary';

export default function Step5Review({
    formData,
    isDraft,
    confirmedAccurate,
    onConfirmChange,
    duplicateMatches = [],
}) {
    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-bold text-primary">Step 5 — Review & Submit</h2>
                <p className="text-xs text-primary/65">
                    Carefully verify all recorded details before creating the customer profile.
                </p>
            </div>

            <CustomerSummary formData={formData} isDraft={isDraft} />

            {duplicateMatches.length > 0 && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 font-medium">
                    Duplicate match warning active ({duplicateMatches[0]?.customerId}). Submission will be blocked if a confirmed duplicate exists.
                </div>
            )}

            <label className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/[0.03] p-4 text-xs text-primary cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={confirmedAccurate}
                    onChange={(e) => onConfirmChange(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-primary/30 accent-accent cursor-pointer"
                />
                <span className="font-medium leading-relaxed">
                    I confirm that I have reviewed the information, inspected the submitted documents, and recorded all customer details accurately.
                </span>
            </label>
        </div>
    );
}
