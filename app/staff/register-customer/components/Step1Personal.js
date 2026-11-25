'use client';

import { useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';

export default function Step1Personal({ data = {}, onChange, errors = {} }) {
    const [photoError, setPhotoError] = useState('');

    const update = (field, val) => {
        onChange({ ...data, [field]: val });
    };

    const handlePhotoUpload = (e) => {
        setPhotoError('');
        const file = e.target.files?.[0];
        if (!file) return;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setPhotoError('Photo must be JPG, PNG, or WEBP.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setPhotoError('Photo size must be under 2MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => update('photoDataUrl', reader.result);
        reader.readAsDataURL(file);
    };

    const inputClass =
        'mt-1 w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary outline-none focus:border-accent';

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-bold text-primary">Step 1 — Personal Information</h2>
                <p className="text-xs text-primary/65">
                    Enter legal personal details exactly as verified with the customer.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-medium text-primary/80">
                        First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.firstName || ''}
                        onChange={(e) => update('firstName', e.target.value)}
                        placeholder="e.g. Arif"
                        className={inputClass}
                    />
                    {errors.firstName && <p className="mt-1 text-xs text-rose-500">{errors.firstName}</p>}
                </div>

                <div>
                    <label className="block text-xs font-medium text-primary/80">Middle Name</label>
                    <input
                        type="text"
                        value={data.middleName || ''}
                        onChange={(e) => update('middleName', e.target.value)}
                        placeholder="Optional"
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-primary/80">
                        Last Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.lastName || ''}
                        onChange={(e) => update('lastName', e.target.value)}
                        placeholder="e.g. Hossain"
                        className={inputClass}
                    />
                    {errors.lastName && <p className="mt-1 text-xs text-rose-500">{errors.lastName}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-primary/80">
                        Date of Birth (Min 18 yrs) <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="date"
                        value={data.dateOfBirth || ''}
                        onChange={(e) => update('dateOfBirth', e.target.value)}
                        className={inputClass}
                    />
                    {errors.dateOfBirth && <p className="mt-1 text-xs text-rose-500">{errors.dateOfBirth}</p>}
                </div>

                <div>
                    <label className="block text-xs font-medium text-primary/80">
                        Gender <span className="text-rose-500">*</span>
                    </label>
                    <select
                        value={data.gender || ''}
                        onChange={(e) => update('gender', e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                    {errors.gender && <p className="mt-1 text-xs text-rose-500">{errors.gender}</p>}
                </div>

                <div>
                    <label className="block text-xs font-medium text-primary/80">
                        Nationality <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.nationality || ''}
                        onChange={(e) => update('nationality', e.target.value)}
                        placeholder="Bangladeshi"
                        className={inputClass}
                    />
                    {errors.nationality && <p className="mt-1 text-xs text-rose-500">{errors.nationality}</p>}
                </div>

                <div>
                    <label className="block text-xs font-medium text-primary/80">Occupation</label>
                    <select
                        value={data.occupation || ''}
                        onChange={(e) => update('occupation', e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Select Occupation</option>
                        <option value="Business">Business</option>
                        <option value="Private Service">Private Service</option>
                        <option value="Government Service">Government Service</option>
                        <option value="Freelancer / IT">Freelancer / IT</option>
                        <option value="Student">Student</option>
                        <option value="Homemaker">Homemaker</option>
                        <option value="Retired">Retired</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-primary/80">Marital Status</label>
                    <select
                        value={data.maritalStatus || ''}
                        onChange={(e) => update('maritalStatus', e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-primary/80">Profile Photo (Optional)</label>
                    <div className="mt-1 flex items-center gap-3">
                        {data.photoDataUrl ? (
                            <div className="flex items-center gap-2">
                                <img
                                    src={data.photoDataUrl}
                                    alt="Customer"
                                    className="h-10 w-10 rounded-full object-cover border border-primary/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => update('photoDataUrl', '')}
                                    className="text-xs text-rose-500 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                >
                                    <FiX className="h-3.5 w-3.5" /> Remove
                                </button>
                            </div>
                        ) : (
                            <label className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 cursor-pointer">
                                <FiUpload className="h-3.5 w-3.5 text-accent" />
                                Upload Photo (JPG/PNG, max 2MB)
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                    {photoError && <p className="mt-1 text-xs text-rose-500">{photoError}</p>}
                </div>
            </div>
        </div>
    );
}
