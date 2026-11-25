'use client';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import ProfileSecurityPage from '@/app/profile-security/page';

export default function CustomerSecurityPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-4 text-primary">
            <div className="flex items-center gap-3">
                <Link
                    href="/customer/profile"
                    className="p-2 rounded-lg border border-primary/20 bg-surface hover:bg-primary/5"
                >
                    <FiArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Security & Transaction PIN</h1>
                    <p className="text-sm text-primary/70">
                        Configure or update your 4-6 digit Transaction PIN used to authorize money transfers.
                    </p>
                </div>
            </div>
            <ProfileSecurityPage />
        </div>
    );
}
