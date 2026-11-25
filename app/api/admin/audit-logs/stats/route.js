import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const db = await getDb();

        const totalEvents = await db.collection('auditLogs').countDocuments();

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEvents = await db.collection('auditLogs').countDocuments({
            createdAt: { $gte: todayStart }
        });

        const criticalEvents = await db.collection('auditLogs').countDocuments({
            severity: { $in: ['CRITICAL', 'Critical', 'Security'] }
        });

        const failedActions = await db.collection('auditLogs').countDocuments({
            outcome: { $in: ['FAILED', 'DENIED', 'Failed', 'Denied'] }
        });

        return NextResponse.json({
            success: true,
            stats: {
                totalEvents,
                todayEvents,
                criticalEvents,
                failedActions
            }
        });
    } catch (err) {
        console.error('Audit stats error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
