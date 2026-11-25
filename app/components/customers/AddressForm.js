'use client';

import { BD_DIVISIONS } from '@/lib/customerValidation';

function AddressBlock({ title, prefix, values = {}, onChange, errors = {}, disabled = false }) {
    const inputClass = `mt-1 w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary outline-none focus:border-accent ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`;

    const handleField = (field, val) => {
        onChange({ ...values, [field]: val });
    };

    return (
        <div className="space-y-3 rounded-xl border border-primary/15 bg-primary/[0.02] p-4">
            <h4 className="text-sm font-bold text-primary">{title}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-primary/80">
                        Division <span className="text-rose-500">*</span>
                    </label>
                    <select
                        disabled={disabled}
                        value={values.division || ''}
                        onChange={(e) => handleField('division', e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Select Division</option>
                        {BD_DIVISIONS.map((div) => (
                            <option key={div} value={div}>{div}</option>
                        ))}
                    </select>
                    {errors[`${prefix}Division`] && (
                        <p className="mt-1 text-xs text-rose-500">{errors[`${prefix}Division`]}</p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-medium text-primary/80">
                        District <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        disabled={disabled}
                        value={values.district || ''}
                        onChange={(e) => handleField('district', e.target.value)}
                        placeholder="e.g. Dhaka, Rajshahi"
                        className={inputClass}
                    />
                    {errors[`${prefix}District`] && (
                        <p className="mt-1 text-xs text-rose-500">{errors[`${prefix}District`]}</p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-medium text-primary/80">
                        Upazila / Thana {prefix === 'present' && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                        type="text"
                        disabled={disabled}
                        value={values.upazila || ''}
                        onChange={(e) => handleField('upazila', e.target.value)}
                        placeholder="e.g. Dhanmondi, Boalia"
                        className={inputClass}
                    />
                    {errors[`${prefix}Upazila`] && (
                        <p className="mt-1 text-xs text-rose-500">{errors[`${prefix}Upazila`]}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs font-medium text-primary/80">Post Office</label>
                        <input
                            type="text"
                            disabled={disabled}
                            value={values.postOffice || ''}
                            onChange={(e) => handleField('postOffice', e.target.value)}
                            placeholder="Post office"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-primary/80">Postal Code</label>
                        <input
                            type="text"
                            disabled={disabled}
                            value={values.postalCode || ''}
                            onChange={(e) => handleField('postalCode', e.target.value)}
                            placeholder="e.g. 1205"
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-primary/80">
                    Village / Road / House {prefix === 'present' && <span className="text-rose-500">*</span>}
                </label>
                <input
                    type="text"
                    disabled={disabled}
                    value={values.addressLine || ''}
                    onChange={(e) => handleField('addressLine', e.target.value)}
                    placeholder="House #12, Road #4, Sector 3..."
                    className={inputClass}
                />
                {errors[`${prefix}AddressLine`] && (
                    <p className="mt-1 text-xs text-rose-500">{errors[`${prefix}AddressLine`]}</p>
                )}
            </div>
        </div>
    );
}

export default function AddressForm({ addresses, onChange, errors = {} }) {
    const present = addresses.present || {};
    const permanent = addresses.sameAsPresent ? present : (addresses.permanent || {});

    const handleSameToggle = (checked) => {
        onChange({
            ...addresses,
            sameAsPresent: checked,
            permanent: checked ? { ...present } : (addresses.permanent || {}),
        });
    };

    return (
        <div className="space-y-4">
            <AddressBlock
                title="Present Address"
                prefix="present"
                values={present}
                onChange={(nextPresent) =>
                    onChange({
                        ...addresses,
                        present: nextPresent,
                        permanent: addresses.sameAsPresent ? nextPresent : addresses.permanent,
                    })
                }
                errors={errors}
            />

            <label className="inline-flex items-center gap-2 text-xs font-semibold text-primary cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={Boolean(addresses.sameAsPresent)}
                    onChange={(e) => handleSameToggle(e.target.checked)}
                    className="h-4 w-4 rounded border-primary/30 accent-accent cursor-pointer"
                />
                Same as present address
            </label>

            <AddressBlock
                title="Permanent Address"
                prefix="permanent"
                values={permanent}
                disabled={Boolean(addresses.sameAsPresent)}
                onChange={(nextPerm) =>
                    onChange({
                        ...addresses,
                        permanent: nextPerm,
                    })
                }
                errors={errors}
            />
        </div>
    );
}
