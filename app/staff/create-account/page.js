'use client';

import CreateAccountForm from '@/app/admin/bank-accounts/components/CreateAccountForm';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function StaffCreateAccountPage() {
    const router = useRouter();

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center gap-3">
                <Link
                    href="/staff/accounts"
                    className="p-2 rounded-lg border border-primary/20 bg-surface text-primary hover:bg-primary/5 transition"
                >
                    <FiArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Open Bank Account</h1>
                    <p className="text-sm text-primary/70">
                        Staff-assisted account opening for enrolled customers.
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-surface p-6 shadow-sm">
                <CreateAccountForm
                    onSuccess={() => {
                        router.push('/staff/accounts');
                    }}
                    onCancel={() => {
                        router.push('/staff/accounts');
                    }}
                />
            </div>
        </div>
    );
}
