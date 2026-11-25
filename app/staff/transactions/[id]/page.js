import { Suspense, use } from 'react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

function TransactionDetailContent({ params }) {
    const { id } = use(params);
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Link
                    href="/staff/transactions"
                    className="p-2 rounded-lg border border-primary/20 bg-surface text-primary hover:bg-primary/5 transition"
                >
                    <FiArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-primary">Transaction #{id}</h1>
                    <p className="text-sm text-primary/70">Staff transaction surveillance and investigation.</p>
                </div>
            </div>
            <div className="rounded-xl border border-primary/20 bg-surface p-6">
                <p className="text-sm text-primary/80">
                    Use the Transactions drawer in <Link href="/staff/transactions" className="text-accent underline font-semibold">Staff Transactions</Link> to inspect, add notes, and flag suspicious transactions with real-time audit logging.
                </p>
            </div>
        </div>
    );
}

export default function StaffTransactionDetailPage({ params }) {
    return (
        <Suspense fallback={<div className="p-8 text-center text-primary/60">Loading transaction record...</div>}>
            <TransactionDetailContent params={params} />
        </Suspense>
    );
}
