'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    FiArrowLeft,
    FiArrowRight,
    FiSave,
    FiCheckCircle,
    FiAlertCircle,
    FiUserPlus,
    FiX,
} from 'react-icons/fi';
import {
    validateStep1,
    validateStep2,
    validateStep3,
    validateStep4,
    validateFullRegistration,
} from '@/lib/customerValidation';
import RegistrationStepper from './components/RegistrationStepper';
import RegistrationSidebar from './components/RegistrationSidebar';
import RegistrationSuccessView from './components/RegistrationSuccessView';
import Step1Personal from './components/Step1Personal';
import Step2Contact from './components/Step2Contact';
import Step3Identity from './components/Step3Identity';
import Step4Additional from './components/Step4Additional';
import Step5Review from './components/Step5Review';

const INITIAL_FORM_DATA = {
    personalInfo: {
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        nationality: 'Bangladeshi',
        occupation: '',
        maritalStatus: '',
        photoDataUrl: '',
    },
    contactInfo: {
        mobile: '',
        alternatePhone: '',
        email: '',
    },
    addresses: {
        present: {
            division: '',
            district: '',
            upazila: '',
            postOffice: '',
            postalCode: '',
            addressLine: '',
        },
        permanent: {
            division: '',
            district: '',
            upazila: '',
            postOffice: '',
            postalCode: '',
            addressLine: '',
        },
        sameAsPresent: false,
    },
    identity: {
        documentType: 'NID',
        documentNumber: '',
        issueDate: '',
        expiryDate: '',
        frontDocument: null,
        backDocument: null,
    },
    employment: {
        status: '',
        employer: '',
        designation: '',
        monthlyIncome: '',
        incomeSource: '',
        workAddress: '',
    },
    nominee: {
        fullName: '',
        relationship: '',
        dateOfBirth: '',
        contactNumber: '',
        identityNumber: '',
        address: '',
    },
    internalNotes: '',
};

export default function StaffRegisterCustomerPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState({});
    const [completedSteps, setCompletedSteps] = useState({});
    const [confirmedAccurate, setConfirmedAccurate] = useState(false);

    // Draft & duplicate state
    const [activeDraftId, setActiveDraftId] = useState(null);
    const [savedDrafts, setSavedDrafts] = useState([]);
    const [duplicateMatches, setDuplicateMatches] = useState([]);
    const [checkingDuplicate, setCheckingDuplicate] = useState(false);

    // Submission & feedback state
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const [registrationResult, setRegistrationResult] = useState(null);

    const fetchDrafts = useCallback(async () => {
        try {
            const res = await fetch('/api/staff/customers/drafts');
            const data = await res.json();
            if (data.success) {
                setSavedDrafts(data.drafts || []);
            }
        } catch (err) {
            console.error('Failed to fetch drafts:', err);
        }
    }, []);

    useEffect(() => {
        fetchDrafts();
    }, [fetchDrafts]);

    const runDuplicateCheck = useCallback(async () => {
        const mobile = formData.contactInfo.mobile?.trim();
        const email = formData.contactInfo.email?.trim();
        const documentNumber = formData.identity.documentNumber?.trim();

        if (!mobile && !email && !documentNumber) {
            setDuplicateMatches([]);
            return;
        }

        try {
            setCheckingDuplicate(true);
            const params = new URLSearchParams();
            if (mobile) params.set('mobile', mobile);
            if (email) params.set('email', email);
            if (documentNumber) params.set('documentNumber', documentNumber);

            const res = await fetch(`/api/staff/customers/check-duplicate?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setDuplicateMatches(data.matches || []);
            }
        } catch (err) {
            console.error('Duplicate check error:', err);
        } finally {
            setCheckingDuplicate(false);
        }
    }, [formData.contactInfo.mobile, formData.contactInfo.email, formData.identity.documentNumber]);

    const validateCurrentStep = (stepNum) => {
        let res = { valid: true, errors: {} };
        if (stepNum === 1) res = validateStep1(formData.personalInfo);
        else if (stepNum === 2) res = validateStep2(formData.contactInfo, formData.addresses);
        else if (stepNum === 3) res = validateStep3(formData.identity);
        else if (stepNum === 4) res = validateStep4(formData.employment);

        setErrors(res.errors);
        if (res.valid) {
            setCompletedSteps((prev) => ({ ...prev, [stepNum]: true }));
        }
        return res.valid;
    };

    const handleNext = () => {
        setFeedback({ type: '', message: '' });
        if (validateCurrentStep(currentStep)) {
            if (currentStep === 2 || currentStep === 3) {
                runDuplicateCheck();
            }
            setCurrentStep((s) => Math.min(5, s + 1));
        }
    };

    const handlePrevious = () => {
        setFeedback({ type: '', message: '' });
        setErrors({});
        setCurrentStep((s) => Math.max(1, s - 1));
    };

    const handleStepClick = (targetStep) => {
        setFeedback({ type: '', message: '' });
        if (targetStep < currentStep || completedSteps[targetStep] || validateCurrentStep(currentStep)) {
            setErrors({});
            setCurrentStep(targetStep);
        }
    };

    const handleSaveDraft = async () => {
        setFeedback({ type: '', message: '' });
        setIsSavingDraft(true);
        try {
            const url = activeDraftId
                ? `/api/staff/customers/drafts/${activeDraftId}`
                : '/api/staff/customers/drafts';
            const method = activeDraftId ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentStep, formData }),
            });
            const data = await res.json();
            if (data.success && data.draft) {
                setActiveDraftId(data.draft._id);
                setFeedback({ type: 'success', message: 'Registration draft saved successfully.' });
                fetchDrafts();
            } else {
                setFeedback({ type: 'error', message: data.message || 'Failed to save draft.' });
            }
        } catch {
            setFeedback({ type: 'error', message: 'Network error while saving draft.' });
        } finally {
            setIsSavingDraft(false);
        }
    };

    const handleLoadDraft = (draft) => {
        setFormData({
            ...INITIAL_FORM_DATA,
            ...(draft.formData || {}),
        });
        setActiveDraftId(draft._id);
        setCurrentStep(draft.currentStep || 1);
        setErrors({});
        setFeedback({ type: 'success', message: 'Draft loaded. You can continue editing.' });
    };

    const handleDeleteDraft = async (draftId) => {
        try {
            const res = await fetch(`/api/staff/customers/drafts/${draftId}`, { method: 'DELETE' });
            if (res.ok) {
                if (activeDraftId === draftId) setActiveDraftId(null);
                fetchDrafts();
            }
        } catch (err) {
            console.error('Delete draft error:', err);
        }
    };

    const handlePreSubmit = () => {
        setFeedback({ type: '', message: '' });
        const full = validateFullRegistration(formData);
        if (!full.valid) {
            setErrors(full.errors);
            setFeedback({
                type: 'error',
                message: 'Some required fields are incomplete or invalid. Please review previous steps.',
            });
            return;
        }
        if (!confirmedAccurate) {
            setFeedback({
                type: 'error',
                message: 'Please check the confirmation box before submitting.',
            });
            return;
        }
        setShowConfirmModal(true);
    };

    const handleFinalSubmit = async () => {
        setShowConfirmModal(false);
        setIsSubmitting(true);
        setFeedback({ type: '', message: '' });

        try {
            const res = await fetch('/api/staff/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    draftId: activeDraftId,
                    confirmedAccurate,
                }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                if (data.errors) setErrors(data.errors);
                setFeedback({ type: 'error', message: data.message || 'Customer registration failed.' });
                return;
            }

            setRegistrationResult(data.result);
            setActiveDraftId(null);
            fetchDrafts();
        } catch {
            setFeedback({ type: 'error', message: 'An error occurred while submitting registration.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetAll = () => {
        setFormData(INITIAL_FORM_DATA);
        setCurrentStep(1);
        setErrors({});
        setCompletedSteps({});
        setConfirmedAccurate(false);
        setActiveDraftId(null);
        setDuplicateMatches([]);
        setFeedback({ type: '', message: '' });
        setRegistrationResult(null);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-primary">
            {/* Top Breadcrumb & Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <nav className="text-xs text-primary/60 mb-1 flex items-center gap-1.5">
                        <Link href="/staff/overview" className="hover:text-accent">Staff</Link>
                        <span>/</span>
                        <Link href="/staff/customers" className="hover:text-accent">Customers</Link>
                        <span>/</span>
                        <span className="text-primary font-medium">Register Customer</span>
                    </nav>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                            <FiUserPlus className="text-accent" />
                            Register New Customer
                        </h1>
                        {activeDraftId && !registrationResult && (
                            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-600 border border-amber-500/30">
                                Editing Draft
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-sm text-primary/70">
                        Collect personal details, verify identity documents, and create a pending customer profile.
                    </p>
                </div>

                <Link
                    href="/staff/customers"
                    className="inline-flex items-center gap-2 self-start rounded-lg border border-primary/20 bg-surface px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/5 transition"
                >
                    <FiArrowLeft className="h-4 w-4" />
                    Back to Customers
                </Link>
            </div>

            {registrationResult ? (
                <RegistrationSuccessView result={registrationResult} onReset={handleResetAll} />
            ) : (
                <>
                    {/* Stepper */}
                    <RegistrationStepper
                        currentStep={currentStep}
                        completedSteps={completedSteps}
                        onStepClick={handleStepClick}
                    />

                    {/* Feedback Banner */}
                    {feedback.message && (
                        <div
                            className={`flex items-center gap-2 rounded-xl border p-3.5 text-xs font-medium ${
                                feedback.type === 'success'
                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
                                    : 'border-rose-500/30 bg-rose-500/10 text-rose-600'
                            }`}
                        >
                            {feedback.type === 'success' ? (
                                <FiCheckCircle className="h-4 w-4 shrink-0" />
                            ) : (
                                <FiAlertCircle className="h-4 w-4 shrink-0" />
                            )}
                            <span>{feedback.message}</span>
                        </div>
                    )}

                    {/* Two-Column Desktop Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left Main Form Area */}
                        <div className="lg:col-span-8 rounded-xl border border-primary/20 bg-surface p-5 sm:p-6 shadow-sm space-y-6">
                            {currentStep === 1 && (
                                <Step1Personal
                                    data={formData.personalInfo}
                                    onChange={(personalInfo) => setFormData((prev) => ({ ...prev, personalInfo }))}
                                    errors={errors}
                                />
                            )}

                            {currentStep === 2 && (
                                <Step2Contact
                                    contactInfo={formData.contactInfo}
                                    addresses={formData.addresses}
                                    onContactChange={(contactInfo) => setFormData((prev) => ({ ...prev, contactInfo }))}
                                    onAddressesChange={(addresses) => setFormData((prev) => ({ ...prev, addresses }))}
                                    errors={errors}
                                    onBlurDuplicateCheck={runDuplicateCheck}
                                />
                            )}

                            {currentStep === 3 && (
                                <Step3Identity
                                    identity={formData.identity}
                                    onChange={(identity) => setFormData((prev) => ({ ...prev, identity }))}
                                    errors={errors}
                                    onBlurDuplicateCheck={runDuplicateCheck}
                                />
                            )}

                            {currentStep === 4 && (
                                <Step4Additional
                                    employment={formData.employment}
                                    nominee={formData.nominee}
                                    internalNotes={formData.internalNotes}
                                    onEmploymentChange={(employment) => setFormData((prev) => ({ ...prev, employment }))}
                                    onNomineeChange={(nominee) => setFormData((prev) => ({ ...prev, nominee }))}
                                    onNotesChange={(internalNotes) => setFormData((prev) => ({ ...prev, internalNotes }))}
                                    errors={errors}
                                />
                            )}

                            {currentStep === 5 && (
                                <Step5Review
                                    formData={formData}
                                    isDraft={Boolean(activeDraftId)}
                                    confirmedAccurate={confirmedAccurate}
                                    onConfirmChange={setConfirmedAccurate}
                                    duplicateMatches={duplicateMatches}
                                />
                            )}

                            {/* Navigation & Draft Controls */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary/15 pt-4">
                                <div className="flex items-center gap-2">
                                    {currentStep > 1 && (
                                        <button
                                            type="button"
                                            onClick={handlePrevious}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-surface px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/5 transition cursor-pointer"
                                        >
                                            <FiArrowLeft className="h-3.5 w-3.5" />
                                            Previous
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleSaveDraft}
                                        disabled={isSavingDraft}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition disabled:opacity-50 cursor-pointer"
                                    >
                                        <FiSave className="h-3.5 w-3.5 text-accent" />
                                        {isSavingDraft ? 'Saving...' : 'Save as Draft'}
                                    </button>
                                </div>

                                <div>
                                    {currentStep < 5 ? (
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition cursor-pointer"
                                        >
                                            Next Step
                                            <FiArrowRight className="h-3.5 w-3.5" />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handlePreSubmit}
                                            disabled={isSubmitting}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
                                        >
                                            <FiCheckCircle className="h-4 w-4" />
                                            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="lg:col-span-4">
                            <RegistrationSidebar
                                currentStep={currentStep}
                                completedSteps={completedSteps}
                                formData={formData}
                                duplicateMatches={duplicateMatches}
                                checkingDuplicate={checkingDuplicate}
                                savedDrafts={savedDrafts}
                                activeDraftId={activeDraftId}
                                onLoadDraft={handleLoadDraft}
                                onDeleteDraft={handleDeleteDraft}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Final Submission Confirmation Dialog */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-primary/20 bg-surface p-6 shadow-2xl text-primary space-y-4">
                        <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                            <h3 className="text-base font-bold">Confirm Customer Registration</h3>
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="p-1 rounded-md hover:bg-primary/10 cursor-pointer"
                            >
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="text-xs text-primary/80 leading-relaxed">
                            This will create a <strong>PENDING</strong> customer profile for{' '}
                            <strong>
                                {formData.personalInfo.firstName} {formData.personalInfo.lastName}
                            </strong>{' '}
                            and queue their identity documents for verification. No bank account or financial transaction will be created.
                        </p>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="rounded-lg border border-primary/20 px-4 py-2 text-xs font-semibold hover:bg-primary/5 cursor-pointer"
                            >
                                Review Again
                            </button>
                            <button
                                type="button"
                                onClick={handleFinalSubmit}
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                            >
                                Confirm & Register
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
