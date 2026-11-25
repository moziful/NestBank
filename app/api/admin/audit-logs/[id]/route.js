import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, context) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await context.params;
        const db = await getDb();

        let query = {};
        if (ObjectId.isValid(id)) {
            query = { $or: [{ _id: new ObjectId(id) }, { eventId: id }] };
        } else {
            query = { eventId: id };
        }

        const log = await db.collection('auditLogs').findOne(query);
        if (!log) {
            return NextResponse.json({ success: false, message: 'Audit event not found.' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            log: {
                _id: log._id,
                eventId: log.eventId || `EVT-${log._id.toString().slice(-6).toUpperCase()}`,
                actorName: log.actorName || log.actor || 'System Admin',
                actorId: log.actorId || 'ADM-1001',
                actorRole: (log.actorRole || log.role || 'Admin').toUpperCase(),
                action: log.action || 'ACTIVITY_LOGGED',
                category: log.category || 'SYSTEM',
                targetType: log.targetType || 'Record',
                targetId: log.targetId || log.recordRef || 'N/A',
                description: log.description || log.event || 'System activity.',
                severity: (log.severity || 'INFO').toUpperCase(),
                outcome: (log.outcome || 'SUCCESS').toUpperCase(),
                changes: log.changes || null,
                metadata: log.metadata || {
                    ipAddress: '192.168.1.10',
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NestBank Administrator',
                    requestId: 'REQ-INTERNAL',
                    correlationId: 'CORR-99214'
                },
                createdAt: log.createdAt || new Date()
            }
        });
    } catch (err) {
        console.error('Audit detail error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
