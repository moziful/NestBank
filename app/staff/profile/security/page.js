'use client';

import ProfileSecurityPage from '@/app/profile-security/page';

export default function StaffSecurityPage() {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-primary">Officer Security & Credentials</h1>
                <p className="text-sm text-primary/70">
                    Manage your officer transaction PIN, secure credentials, and authentication settings.
                </p>
            </div>
            <ProfileSecurityPage />
        </div>
    );
}
