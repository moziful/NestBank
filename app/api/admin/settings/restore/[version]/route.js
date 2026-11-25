import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { createAuditLog } from '@/lib/audit';

export async function POST(request, context) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { version } = await context.params;
        const versionNum = parseInt(version, 10);

        const db = await getDb();
        const historical = await db.collection('bankSettingsHistory').findOne({ version: versionNum });
        if (!historical || !historical.settings) {
            return NextResponse.json({ success: false, message: `Historical configuration version ${version} not found.` }, { status: 404 });
        }

        const current = await db.collection('bankSettings').findOne({ _id: 'active_config' });
        const nextVersion = ((current?.version || 1) + 1);
        const now = new Date();

        // 1. Archive current before restoration
        await db.collection('bankSettingsHistory').insertOne({
            version: current?.version || 1,
            settings: current,
            reason: `Pre-restoration snapshot before restoring version ${versionNum}`,
            changedBy: session.username || session.email || 'Admin',
            createdAt: now
        });

        // 2. Apply restored settings with new version number
        const restoredConfig = {
            ...historical.settings,
            _id: 'active_config',
            version: nextVersion,
            updatedBy: session.username || session.email || 'Admin',
            updatedAt: now
        };

        await db.collection('bankSettings').updateOne(
            { _id: 'active_config' },
            { $set: restoredConfig },
            { upsert: true }
        );

        // 3. Audit log
        await createAuditLog({
            actorName: session.username || session.email,
            actorRole: 'ADMIN',
            action: 'BANK_SETTINGS_RESTORED',
            category: 'SETTINGS',
            targetType: 'Settings',
            targetId: `v${versionNum}->v${nextVersion}`,
            description: `Restored banking settings from historical version ${versionNum} as new active version ${nextVersion}`,
            severity: 'CRITICAL',
            outcome: 'SUCCESS'
        });

        return NextResponse.json({
            success: true,
            message: `Successfully restored configuration from version ${versionNum} (Active: v${nextVersion}).`,
            settings: restoredConfig
        });
    } catch (err) {
        console.error('Restore settings error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
