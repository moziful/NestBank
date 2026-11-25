'use client';

export default function Step4Additional({
    employment = {},
    nominee = {},
    internalNotes = '',
    onEmploymentChange,
    onNomineeChange,
    onNotesChange,
    errors = {},
}) {
    const updateEmp = (field, val) => onEmploymentChange({ ...employment, [field]: val });
    const updateNom = (field, val) => onNomineeChange({ ...nominee, [field]: val });

    const inputClass =
        'mt-1 w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary outline-none focus:border-accent';

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-primary">Step 4 — Additional Information</h2>
                <p className="text-xs text-primary/65">
                    Record employment details, optional nominee information, and internal staff-only notes.
                </p>
            </div>

            {/* Employment Information */}
            <div className="space-y-3 rounded-xl border border-primary/15 bg-primary/[0.02] p-4">
                <h3 className="text-sm font-bold text-primary">Employment & Income</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-primary/80">Employment Status</label>
                        <select
                            value={employment.status || ''}
                            onChange={(e) => updateEmp('status', e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Select Status</option>
                            <option value="Salaried">Salaried</option>
                            <option value="Self-Employed">Self-Employed / Business</option>
                            <option value="Student">Student</option>
                            <option value="Unemployed">Unemployed</option>
                            <option value="Retired">Retired</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-primary/80">Employer / Business Name</label>
                        <input
                            type="text"
                            value={employment.employer || ''}
                            onChange={(e) => updateEmp('employer', e.target.value)}
                            placeholder="Company or business name"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-primary/80">Designation</label>
                        <input
                            type="text"
                            value={employment.designation || ''}
                            onChange={(e) => updateEmp('designation', e.target.value)}
                            placeholder="e.g. Senior Engineer"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-primary/80">Monthly Income (BDT)</label>
                        <input
                            type="number"
                            min={0}
                            value={employment.monthlyIncome || ''}
                            onChange={(e) => updateEmp('monthlyIncome', e.target.value)}
                            placeholder="e.g. 65000"
                            className={inputClass}
                        />
                        {errors.monthlyIncome && <p className="mt-1 text-xs text-rose-500">{errors.monthlyIncome}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-primary/80">Source of Income</label>
                        <select
                            value={employment.incomeSource || ''}
                            onChange={(e) => updateEmp('incomeSource', e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Select Source</option>
                            <option value="Salary">Salary</option>
                            <option value="Business Profit">Business Profit</option>
                            <option value="Remittance">Remittance</option>
                            <option value="Rental / Investments">Rental / Investments</option>
                            <option value="Family Support">Family Support</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-primary/80">Work Address</label>
                        <input
                            type="text"
                            value={employment.workAddress || ''}
                            onChange={(e) => updateEmp('workAddress', e.target.value)}
                            placeholder="Office or business location"
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>

            {/* Nominee Information (Optional) */}
            <div className="space-y-3 rounded-xl border border-primary/15 bg-primary/[0.02] p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-primary">Nominee Information (Optional)</h3>
                    <span className="text-[11px] text-primary/55">Can also be added at account opening</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-primary/80">Nominee Full Name</label>
                        <input
                            type="text"
                            value={nominee.fullName || ''}
                            onChange={(e) => updateNom('fullName', e.target.value)}
                            placeholder="Full name"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-primary/80">Relationship</label>
                        <select
                            value={nominee.relationship || ''}
                            onChange={(e) => updateNom('relationship', e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Select Relationship</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Parent">Parent</option>
                            <option value="Child">Child</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-primary/80">Nominee Date of Birth</label>
                        <input
                            type="date"
                            value={nominee.dateOfBirth || ''}
                            onChange={(e) => updateNom('dateOfBirth', e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-primary/80">Nominee Contact Number</label>
                        <input
                            type="tel"
                            value={nominee.contactNumber || ''}
                            onChange={(e) => updateNom('contactNumber', e.target.value)}
                            placeholder="017XXXXXXXX"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-primary/80">Nominee NID / Birth Reg.</label>
                        <input
                            type="text"
                            value={nominee.identityNumber || ''}
                            onChange={(e) => updateNom('identityNumber', e.target.value)}
                            placeholder="Document number"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-primary/80">Nominee Address</label>
                        <input
                            type="text"
                            value={nominee.address || ''}
                            onChange={(e) => updateNom('address', e.target.value)}
                            placeholder="Present address"
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>

            {/* Staff-only Internal Notes */}
            <div className="space-y-1.5">
                <label className="block text-xs font-medium text-primary/80">
                    Internal Staff Notes <span className="text-[11px] text-primary/55">(Not visible to customer)</span>
                </label>
                <textarea
                    rows={3}
                    value={internalNotes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="Record any onboarding observations or verification remarks..."
                    className={inputClass}
                />
            </div>
        </div>
    );
}
