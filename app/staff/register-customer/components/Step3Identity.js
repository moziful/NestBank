'use client';

import { DOCUMENT_TYPES } from '@/lib/customerValidation';
import DocumentUpload from '@/app/components/customers/DocumentUpload';
import { FiShield } from 'react-icons/fi';

export default function Step3Identity({
    identity = {},
    onChange,
    errors = {},
    onBlurDuplicateCheck,
}) {
    const update = (field, val) => {
        onChange({ ...identity, [field]: val });
    };

    const inputClass =
        'mt-1 w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary outline-none focus:border-accent';

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-bold text-primary">Step 3 — Identity Verification (KYC)</h2>
                <p className="text-xs text-primary/65">
                    Provide official identity details and upload clear scans. Uploading documents sets status to Pending Verification.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-primary/80">
                        Document Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                        value={identity.documentType || ''}
                        onChange={(e) => update('documentType', e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Select Document Type</option>
                        {DOCUMENT_TYPES.map((dt) => (
                            <option key={dt.value} value={dt.value}>{dt.label}</option>
                        ))}
                    </select>
                    {errors.documentType && <p className="mt-1 text-xs text-rose-500">{errors.documentType}</p>}
                </div>

                <div>
                    <label className="block text-xs font-medium text-primary/80">
                        Document Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={identity.documentNumber || ''}
                        onChange={(e) => update('documentNumber', e.target.value)}
                        onBlur={onBlurDuplicateCheck}
                        placeholder="e.g. 10, 13, or 17 digit NID"
                        className={inputClass}
                    />
                    {errors.documentNumber && <p className="mt-1 text-xs text-rose-500">{errors.documentNumber}</p>}
                </div>

                <div>
                    <label className="block text-xs font-medium text-primary/80">Issue Date (Optional)</label>
                    <input
                        type="date"
                        value={identity.issueDate || ''}
                        onChange={(e) => update('issueDate', e.target.value)}
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-primary/80">
                        Expiry Date {identity.documentType === 'PASSPORT' && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                        type="date"
                        value={identity.expiryDate || ''}
                        onChange={(e) => update('expiryDate', e.target.value)}
                        className={inputClass}
                    />
                    {errors.expiryDate && <p className="mt-1 text-xs text-rose-500">{errors.expiryDate}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DocumentUpload
                    label="Front-Side Document"
                    required
                    value={identity.frontDocument}
                    onChange={(doc) => update('frontDocument', doc)}
                    error={errors.frontDocument}
                />

                <DocumentUpload
                    label="Back-Side Document (Where Applicable)"
                    value={identity.backDocument}
                    onChange={(doc) => update('backDocument', doc)}
                />
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-primary/85">
                <FiShield className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                    <span className="font-bold">Initial Verification Status: Pending Verification.</span>{' '}
                    Identity numbers are encrypted at rest and never exposed in audit logs.
                </div>
            </div>
        </div>
    );
}
