// lib/customerValidation.js - Shared client & server validation for Staff Customer Registration

export const BD_DIVISIONS = [
    'Dhaka',
    'Chattogram',
    'Rajshahi',
    'Khulna',
    'Barishal',
    'Sylhet',
    'Rangpur',
    'Mymensingh',
];

export const DOCUMENT_TYPES = [
    { value: 'NID', label: 'National ID (NID)' },
    { value: 'PASSPORT', label: 'Passport' },
    { value: 'BIRTH_CERT', label: 'Birth Registration Certificate' },
    { value: 'OTHER', label: 'Other Approved Identity Document' },
];

export const VERIFICATION_STATUSES = {
    NOT_SUBMITTED: { label: 'Not Submitted', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
    PENDING: { label: 'Pending Verification', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    VERIFIED: { label: 'Verified', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    REJECTED: { label: 'Rejected', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
    RESUBMISSION_REQUIRED: { label: 'Requires Resubmission', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
};

/**
 * Normalize Bangladesh mobile number to canonical 01XXXXXXXXX format.
 * Accepts 017XXXXXXXX, +88017XXXXXXXX, 88017XXXXXXXX (with optional spaces/dashes).
 */
export function normalizeBDPhone(rawPhone) {
    if (!rawPhone || typeof rawPhone !== 'string') {
        return { valid: false, normalized: '' };
    }
    const cleaned = rawPhone.replace(/[\s\-()]/g, '').trim();

    let local = cleaned;
    if (cleaned.startsWith('+880')) {
        local = '0' + cleaned.slice(4);
    } else if (cleaned.startsWith('880')) {
        local = '0' + cleaned.slice(3);
    }

    const isValid = /^01[3-9]\d{8}$/.test(local);
    return {
        valid: isValid,
        normalized: isValid ? local : cleaned,
    };
}

/**
 * Validate date of birth against minimum age policy (default 18 years).
 */
export function validateDateOfBirth(dobString, minAge = 18) {
    if (!dobString) {
        return { valid: false, message: 'Date of birth is required' };
    }
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) {
        return { valid: false, message: 'Invalid date of birth' };
    }
    const today = new Date();
    if (dob > today) {
        return { valid: false, message: 'Date of birth cannot be in the future' };
    }
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    if (age < minAge) {
        return { valid: false, message: `Customer must be at least ${minAge} years old` };
    }
    if (age > 120) {
        return { valid: false, message: 'Please enter a valid date of birth' };
    }
    return { valid: true, age };
}

export function validateStep1(personalInfo = {}) {
    const errors = {};
    const firstName = (personalInfo.firstName || '').trim();
    const lastName = (personalInfo.lastName || '').trim();
    const nationality = (personalInfo.nationality || '').trim();

    if (!firstName) errors.firstName = 'First name is required';
    if (!lastName) errors.lastName = 'Last name is required';
    if (!nationality) errors.nationality = 'Nationality is required';
    if (!personalInfo.gender) errors.gender = 'Gender is required';

    const dobCheck = validateDateOfBirth(personalInfo.dateOfBirth, 18);
    if (!dobCheck.valid) {
        errors.dateOfBirth = dobCheck.message;
    }

    return { valid: Object.keys(errors).length === 0, errors };
}

export function validateStep2(contactInfo = {}, addresses = {}) {
    const errors = {};
    const phoneCheck = normalizeBDPhone(contactInfo.mobile);
    if (!contactInfo.mobile || !contactInfo.mobile.trim()) {
        errors.mobile = 'Mobile number is required';
    } else if (!phoneCheck.valid) {
        errors.mobile = 'Enter a valid Bangladesh mobile number (e.g. 017XXXXXXXX or +88017XXXXXXXX)';
    }

    if (contactInfo.alternatePhone && contactInfo.alternatePhone.trim()) {
        const altCheck = normalizeBDPhone(contactInfo.alternatePhone);
        if (!altCheck.valid) {
            errors.alternatePhone = 'Enter a valid Bangladesh phone number';
        }
    }

    if (contactInfo.email && contactInfo.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactInfo.email.trim())) {
            errors.email = 'Enter a valid email address';
        }
    }

    const present = addresses.present || {};
    if (!present.division) errors.presentDivision = 'Present division is required';
    if (!present.district || !present.district.trim()) errors.presentDistrict = 'Present district is required';
    if (!present.upazila || !present.upazila.trim()) errors.presentUpazila = 'Upazila/Thana is required';
    if (!present.addressLine || !present.addressLine.trim()) errors.presentAddressLine = 'Village/Road/House is required';

    const permanent = addresses.sameAsPresent ? present : (addresses.permanent || {});
    if (!addresses.sameAsPresent) {
        if (!permanent.division) errors.permanentDivision = 'Permanent division is required';
        if (!permanent.district || !permanent.district.trim()) errors.permanentDistrict = 'Permanent district is required';
    }

    return { valid: Object.keys(errors).length === 0, errors };
}

export function validateStep3(identity = {}) {
    const errors = {};
    if (!identity.documentType) {
        errors.documentType = 'Identity document type is required';
    }
    const docNum = (identity.documentNumber || '').trim();
    if (!docNum) {
        errors.documentNumber = 'Document number is required';
    } else if (identity.documentType === 'NID' && !/^\d{10}(\d{3})?(\d{4})?$/.test(docNum)) {
        errors.documentNumber = 'NID must be 10, 13, or 17 digits';
    } else if (docNum.length < 5) {
        errors.documentNumber = 'Document number is too short';
    }

    if (identity.documentType === 'PASSPORT' && !identity.expiryDate) {
        errors.expiryDate = 'Expiry date is required for Passports';
    }

    if (identity.issueDate && identity.expiryDate) {
        if (new Date(identity.expiryDate) <= new Date(identity.issueDate)) {
            errors.expiryDate = 'Expiry date must be after issue date';
        }
    }

    if (!identity.frontDocument || !identity.frontDocument.name) {
        errors.frontDocument = 'Front-side document upload is required';
    }

    return { valid: Object.keys(errors).length === 0, errors };
}

export function validateStep4(employment = {}) {
    const errors = {};
    if (employment.monthlyIncome !== undefined && employment.monthlyIncome !== '' && Number(employment.monthlyIncome) < 0) {
        errors.monthlyIncome = 'Monthly income cannot be negative';
    }
    return { valid: Object.keys(errors).length === 0, errors };
}

export function validateFullRegistration(formData) {
    const s1 = validateStep1(formData.personalInfo);
    const s2 = validateStep2(formData.contactInfo, formData.addresses);
    const s3 = validateStep3(formData.identity);
    const s4 = validateStep4(formData.employment);

    const errors = { ...s1.errors, ...s2.errors, ...s3.errors, ...s4.errors };
    return {
        valid: Object.keys(errors).length === 0,
        errors,
        stepErrors: {
            1: !s1.valid,
            2: !s2.valid,
            3: !s3.valid,
            4: !s4.valid,
        },
    };
}
