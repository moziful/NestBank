'use client';

import { DOCUMENT_TYPES } from '@/lib/customerValidation';
import { FiUser, FiPhone, FiShield, FiBriefcase, FiUsers } from 'react-icons/fi';

export default function CustomerSummary({ formData, isDraft = false }) {
    const { personalInfo = {}, contactInfo = {}, addresses = {}, identity = {}, employment = {}, nominee = {} } = formData;
    const fullName = [personalInfo.firstName, personalInfo.middleName, personalInfo.lastName]
        .filter(Boolean)
        .join(' ');
    const docLabel = DOCUMENT_TYPES.find((d) => d.value === identity.documentType)?.label || identity.documentType || 'Not Selected';

    const presentAddr = addresses.present || {};
    const presentSummary = [presentAddr.addressLine, presentAddr.upazila, presentAddr.district, presentAddr.division]
        .filter(Boolean)
        .join(', ');

    const maskDocNumber = (num) => {
        if (!num) return 'Not Provided';
        const s = String(num).trim();
        if (s.length <= 4) return '••••';
        return `${'•'.repeat(s.length - 4)}${s.slice(-4)}`;
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/15 bg-primary/[0.03] p-4">
                <div>
                    <span className="inline-block rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 mb-1">
                        {isDraft ? 'Draft Preview' : 'Ready for Submission'}
                    </span>
                    <h3 className="text-lg font-bold text-primary">{fullName || 'Unnamed Customer'}</h3>
                    <p className="text-xs text-primary/60">
                        Customer Registration Summary • Verification starts as Pending
                    </p>
                </div>
                {personalInfo.photoDataUrl && (
                    <img
                        src={personalInfo.photoDataUrl}
                        alt="Profile preview"
                        className="h-14 w-14 rounded-full object-cover border border-primary/20"
                    />
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Personal Information */}
                <div className="rounded-xl border border-primary/15 p-4 space-y-2">
                    <h4 className="font-bold text-sm text-primary flex items-center gap-2 border-b border-primary/10 pb-2">
                        <FiUser className="text-accent" /> Personal Information
                    </h4>
                    <div className="space-y-1 text-primary/80">
                        <p><span className="font-semibold text-primary">Full Name:</span> {fullName || '—'}</p>
                        <p><span className="font-semibold text-primary">Date of Birth:</span> {personalInfo.dateOfBirth || '—'}</p>
                        <p><span className="font-semibold text-primary">Gender:</span> {personalInfo.gender || '—'}</p>
                        <p><span className="font-semibold text-primary">Nationality:</span> {personalInfo.nationality || '—'}</p>
                        <p><span className="font-semibold text-primary">Occupation:</span> {personalInfo.occupation || '—'}</p>
                        <p><span className="font-semibold text-primary">Marital Status:</span> {personalInfo.maritalStatus || '—'}</p>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="rounded-xl border border-primary/15 p-4 space-y-2">
                    <h4 className="font-bold text-sm text-primary flex items-center gap-2 border-b border-primary/10 pb-2">
                        <FiPhone className="text-accent" /> Contact & Address
                    </h4>
                    <div className="space-y-1 text-primary/80">
                        <p><span className="font-semibold text-primary">Mobile:</span> {contactInfo.mobile || '—'}</p>
                        <p><span className="font-semibold text-primary">Alternate Phone:</span> {contactInfo.alternatePhone || '—'}</p>
                        <p><span className="font-semibold text-primary">Email:</span> {contactInfo.email || '—'}</p>
                        <p><span className="font-semibold text-primary">Present Address:</span> {presentSummary || '—'}</p>
                        <p>
                            <span className="font-semibold text-primary">Permanent Address:</span>{' '}
                            {addresses.sameAsPresent ? 'Same as present address' : (addresses.permanent?.district || '—')}
                        </p>
                    </div>
                </div>

                {/* Identity Verification */}
                <div className="rounded-xl border border-primary/15 p-4 space-y-2">
                    <h4 className="font-bold text-sm text-primary flex items-center gap-2 border-b border-primary/10 pb-2">
                        <FiShield className="text-accent" /> Identity Verification
                    </h4>
                    <div className="space-y-1 text-primary/80">
                        <p><span className="font-semibold text-primary">Document Type:</span> {docLabel}</p>
                        <p><span className="font-semibold text-primary">Document Number:</span> {maskDocNumber(identity.documentNumber)}</p>
                        <p><span className="font-semibold text-primary">Front Document:</span> {identity.frontDocument?.name || 'Missing'}</p>
                        <p><span className="font-semibold text-primary">Back Document:</span> {identity.backDocument?.name || 'Not uploaded'}</p>
                        <p>
                            <span className="font-semibold text-primary">Initial Verification:</span>{' '}
                            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                                Pending Verification
                            </span>
                        </p>
                    </div>
                </div>

                {/* Employment & Nominee */}
                <div className="rounded-xl border border-primary/15 p-4 space-y-2">
                    <h4 className="font-bold text-sm text-primary flex items-center gap-2 border-b border-primary/10 pb-2">
                        <FiBriefcase className="text-accent" /> Employment & Nominee
                    </h4>
                    <div className="space-y-1 text-primary/80">
                        <p><span className="font-semibold text-primary">Employment Status:</span> {employment.status || '—'}</p>
                        <p><span className="font-semibold text-primary">Employer / Business:</span> {employment.employer || '—'}</p>
                        <p><span className="font-semibold text-primary">Monthly Income:</span> {employment.monthlyIncome ? `৳${Number(employment.monthlyIncome).toLocaleString()}` : '—'}</p>
                        <p className="pt-1 border-t border-primary/10">
                            <span className="font-semibold text-primary inline-flex items-center gap-1">
                                <FiUsers className="h-3 w-3" /> Nominee:
                            </span>{' '}
                            {nominee.fullName ? `${nominee.fullName} (${nominee.relationship || 'Relative'})` : 'Not provided'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
