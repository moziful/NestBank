import { Suspense } from 'react';
import LoanDetailContent from '@/app/admin/loans/[id]/LoanDetailContent';

export default function StaffLoanDetailPage({ params }) {
    return (
        <Suspense fallback={
            <div className="p-8 text-center text-primary/60">
                Loading loan underwriting file...
            </div>
        }>
            <LoanDetailContent params={params} />
        </Suspense>
    );
}
