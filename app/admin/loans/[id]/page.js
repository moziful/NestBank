import { Suspense } from 'react';
import LoanDetailContent from './LoanDetailContent';

export default function LoanDetailPage({ params }) {
    return (
        <Suspense fallback={
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="h-10 w-48 bg-primary/10 rounded animate-pulse" />
                <div className="h-64 bg-primary/5 rounded-xl border border-primary/20 animate-pulse" />
            </div>
        }>
            <LoanDetailContent params={params} />
        </Suspense>
    );
}
