import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { getActiveBankSettings } from '@/lib/bankSettings';
import { createAuditLog } from '@/lib/audit';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const settings = await getActiveBankSettings();
        return NextResponse.json({ success: true, settings });
    } catch (err) {
        console.error('Get bank settings error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { settings, reason } = body;

        if (!settings) {
            return NextResponse.json({ success: false, message: 'Missing settings payload' }, { status: 400 });
        }

        const db = await getDb();
        const current = await getActiveBankSettings();
        const newVersion = (current.version || 1) + 1;
        const now = new Date();

        // 1. Save version snapshot in bankSettingsHistory
        await db.collection('bankSettingsHistory').insertOne({
            version: current.version || 1,
            settings: current,
            reason: reason || 'Configuration updated by administrator',
            changedBy: session.username || session.email || 'Admin',
            createdAt: now
        });

        // 2. Update active configuration
        const updatedConfig = {
            ...settings,
            _id: 'active_config',
            version: newVersion,
            updatedBy: session.username || session.email || 'Admin',
            updatedAt: now
        };

        await db.collection('bankSettings').updateOne(
            { _id: 'active_config' },
            { $set: updatedConfig },
            { upsert: true }
        );

        // 3. Immutable audit log entry
        await createAuditLog({
            actorName: session.username || session.email,
            actorRole: 'ADMIN',
            action: 'BANK_SETTINGS_UPDATED',
            category: 'SETTINGS',
            targetType: 'Settings',
            targetId: `v${newVersion}`,
            description: `Bank settings updated to version ${newVersion}: ${reason || 'Administrative policy update'}`,
            severity: 'WARNING',
            outcome: 'SUCCESS',
            changes: {
                before: { version: current.version },
                after: { version: newVersion }
            }
        });

        return NextResponse.json({
            success: true,
            message: `Bank configuration version ${newVersion} saved successfully.`,
            settings: updatedConfig
        });
    } catch (err) {
        console.error('Update bank settings error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
