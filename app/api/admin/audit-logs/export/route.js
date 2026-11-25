import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { createAuditLog } from '@/lib/audit';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return new NextResponse('Forbidden: Admin access required', { status: 403 });
        }

        const db = await getDb();
        const logs = await db.collection('auditLogs').find({}).sort({ createdAt: -1 }).limit(5000).toArray();

        // Record the export action in audit logs as an immutable event
        await createAuditLog({
            actorName: session.username || session.email,
            actorRole: 'ADMIN',
            action: 'AUDIT_LOGS_EXPORTED',
            category: 'SECURITY',
            targetType: 'AuditLog',
            description: `Exported ${logs.length} audit trail records to CSV`,
            severity: 'WARNING',
            outcome: 'SUCCESS'
        });

        const headers = [
            'Event ID',
            'Timestamp',
            'Actor',
            'Role',
            'Category',
            'Action',
            'Target Type',
            'Target ID',
            'Severity',
            'Outcome',
            'Description'
        ];

        const rows = logs.map(l => [
            `"${l.eventId || l._id.toString()}"`,
            `"${l.createdAt ? new Date(l.createdAt).toISOString() : ''}"`,
            `"${l.actorName || l.actor || 'System'}"`,
            `"${l.actorRole || l.role || 'Admin'}"`,
            `"${l.category || 'SYSTEM'}"`,
            `"${l.action || ''}"`,
            `"${l.targetType || ''}"`,
            `"${l.targetId || l.recordRef || ''}"`,
            `"${l.severity || 'INFO'}"`,
            `"${l.outcome || 'SUCCESS'}"`,
            `"${(l.description || l.event || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename=audit-logs-export-${new Date().toISOString().slice(0, 10)}.csv`
            }
        });
    } catch (err) {
        console.error('Export audit logs error:', err);
        return new NextResponse('Internal server error', { status: 500 });
    }
}
