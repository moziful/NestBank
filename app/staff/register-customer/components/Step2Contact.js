'use client';

import AddressForm from '@/app/components/customers/AddressForm';

export default function Step2Contact({
    contactInfo = {},
    addresses = {},
    onContactChange,
    onAddressesChange,
    errors = {},
    onBlurDuplicateCheck,
}) {
    const update = (field, val) => {
        onContactChange({ ...contactInfo, [field]: val });
    };

    const inputClass =
        'mt-1 w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary outline-none focus:border-accent';

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-bold text-primary">Step 2 — Contact Information</h2>
                <p className="text-xs text-primary/65">
                    Bangladesh mobile numbers (017XXXXXXXX or +88017XXXXXXXX) are normalized automatically for duplicate detection.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-medium text-primary/80">
                        Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="tel"
                        value={contactInfo.mobile || ''}
                        onChange={(e) => update('mobile', e.target.value)}
                        onBlur={onBlurDuplicateCheck}
                        placeholder="017XXXXXXXX or +88017..."
                        className={inputClass}
                    />
                    {errors.mobile && <p className="mt-1 text-xs text-rose-500">{errors.mobile}</p>}
                </div>

                <div>
                    <label className="block text-xs font-medium text-primary/80">Alternate Phone</label>
                    <input
                        type="tel"
                        value={contactInfo.alternatePhone || ''}
                        onChange={(e) => update('alternatePhone', e.target.value)}
                        placeholder="Optional"
                        className={inputClass}
                    />
                    {errors.alternatePhone && <p className="mt-1 text-xs text-rose-500">{errors.alternatePhone}</p>}
                </div>

                <div>
                    <label className="block text-xs font-medium text-primary/80">Email Address</label>
                    <input
                        type="email"
                        value={contactInfo.email || ''}
                        onChange={(e) => update('email', e.target.value)}
                        onBlur={onBlurDuplicateCheck}
                        placeholder="customer@example.com"
                        className={inputClass}
                    />
                    {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
                </div>
            </div>

            <AddressForm
                addresses={addresses}
                onChange={onAddressesChange}
                errors={errors}
            />
        </div>
    );
}
