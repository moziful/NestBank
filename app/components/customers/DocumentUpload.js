'use client';

import { useState } from 'react';
import { FiUploadCloud, FiFile, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function DocumentUpload({
    label,
    required = false,
    value,
    onChange,
    error,
    accept = '.jpg,.jpeg,.png,.webp,.pdf',
    helperText = 'JPG, PNG, WEBP, or PDF up to 5MB',
}) {
    const [localError, setLocalError] = useState('');

    const handleFileChange = (e) => {
        setLocalError('');
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            setLocalError('Unsupported file type. Please upload JPG, PNG, WEBP, or PDF.');
            return;
        }
        if (file.size > MAX_SIZE_BYTES) {
            setLocalError('File size exceeds 5MB limit.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            onChange({
                name: file.name,
                type: file.type,
                size: file.size,
                dataUrl: reader.result,
            });
        };
        reader.readAsDataURL(file);
    };

    const displayError = localError || error;
    const isImage = value?.type?.startsWith('image/');

    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-medium text-primary/80">
                {label} {required && <span className="text-rose-500">*</span>}
            </label>

            {!value?.name ? (
                <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-primary/[0.02] p-5 text-center transition hover:border-accent/50 hover:bg-accent/[0.03] cursor-pointer">
                    <FiUploadCloud className="h-7 w-7 text-accent mb-2" />
                    <span className="text-xs font-semibold text-primary">Click to upload document</span>
                    <span className="mt-0.5 text-[11px] text-primary/60">{helperText}</span>
                    <input
                        type="file"
                        accept={accept}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </label>
            ) : (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                    <div className="flex items-center gap-3 min-w-0">
                        {isImage && value.dataUrl ? (
                            <img
                                src={value.dataUrl}
                                alt={value.name}
                                className="h-12 w-16 rounded-md object-cover border border-primary/15 shrink-0"
                            />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-accent/15 text-accent shrink-0">
                                <FiFile className="h-5 w-5" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-primary flex items-center gap-1.5">
                                <FiCheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                {value.name}
                            </p>
                            <p className="text-[11px] text-primary/60">
                                {(value.size / 1024).toFixed(1)} KB • Ready for submission
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        title="Remove file"
                        className="rounded-lg p-1.5 text-primary/60 hover:bg-rose-500/10 hover:text-rose-500 transition cursor-pointer"
                    >
                        <FiX className="h-4 w-4" />
                    </button>
                </div>
            )}

            {displayError && (
                <p className="flex items-center gap-1 text-xs text-rose-500">
                    <FiAlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {displayError}
                </p>
            )}
        </div>
    );
}
