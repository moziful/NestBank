import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';
        const actorRole = searchParams.get('actorRole') || '';
        const severity = searchParams.get('severity') || '';
        const outcome = searchParams.get('outcome') || '';
        const dateRange = searchParams.get('dateRange') || '';
        const tab = searchParams.get('tab') || 'ALL'; // ALL, ADMIN, STAFF, CUSTOMER, SECURITY, CRITICAL

        const db = await getDb();
        const query = {};

        // Search across eventId, actorName, targetId, description, action
        if (search) {
            query.$or = [
                { eventId: { $regex: search, $options: 'i' } },
                { actorName: { $regex: search, $options: 'i' } },
                { actorRole: { $regex: search, $options: 'i' } },
                { targetId: { $regex: search, $options: 'i' } },
                { targetType: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { event: { $regex: search, $options: 'i' } },
                { action: { $regex: search, $options: 'i' } },
                { recordRef: { $regex: search, $options: 'i' } },
            ];
        }

        // Tab filters
        if (tab === 'ADMIN') {
            query.actorRole = 'ADMIN';
        } else if (tab === 'STAFF') {
            query.actorRole = { $in: ['BANK_STAFF', 'STAFF', 'Bank Staff'] };
        } else if (tab === 'CUSTOMER') {
            query.actorRole = { $in: ['CUSTOMER', 'Customer'] };
        } else if (tab === 'SECURITY') {
            query.$or = [
                { category: 'SECURITY' },
                { action: { $regex: 'LOGIN|DENIED|BLOCKED|FROZEN|FLAGGED|AUTH', $options: 'i' } }
            ];
        } else if (tab === 'CRITICAL') {
            query.severity = 'CRITICAL';
        }

        // Direct filters
        if (category && category !== 'All') {
            query.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }
        if (actorRole && actorRole !== 'All') {
            query.actorRole = { $regex: new RegExp(`^${actorRole}$`, 'i') };
        }
        if (severity && severity !== 'All') {
            query.severity = { $regex: new RegExp(`^${severity}$`, 'i') };
        }
        if (outcome && outcome !== 'All') {
            query.outcome = { $regex: new RegExp(`^${outcome}$`, 'i') };
        }

        // Date range
        if (dateRange && dateRange !== 'All') {
            const now = new Date();
            let startDate = new Date();
            if (dateRange === 'today') {
                startDate.setHours(0, 0, 0, 0);
            } else if (dateRange === '7d') {
                startDate.setDate(now.getDate() - 7);
            } else if (dateRange === '30d') {
                startDate.setDate(now.getDate() - 30);
            }
            query.createdAt = { $gte: startDate };
        }

        const skip = (page - 1) * limit;
        const total = await db.collection('auditLogs').countDocuments(query);
        const logs = await db.collection('auditLogs')
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        // Normalise fields for presentation
        const normalizedLogs = logs.map(l => ({
            _id: l._id,
            eventId: l.eventId || `EVT-${l._id.toString().slice(-6).toUpperCase()}`,
            actorName: l.actorName || l.actor || 'System Admin',
            actorRole: (l.actorRole || l.role || 'Admin').toUpperCase(),
            action: l.action || 'ACTIVITY_LOGGED',
            category: l.category || 'SYSTEM',
            targetType: l.targetType || 'Record',
            targetId: l.targetId || l.recordRef || 'N/A',
            description: l.description || l.event || 'System operation executed.',
            severity: (l.severity || 'INFO').toUpperCase(),
            outcome: (l.outcome || 'SUCCESS').toUpperCase(),
            changes: l.changes || null,
            metadata: l.metadata || { ipAddress: '192.168.1.1', userAgent: 'Internal Portal' },
            createdAt: l.createdAt || new Date()
        }));

        return NextResponse.json({
            success: true,
            logs: normalizedLogs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1
            }
        });
    } catch (err) {
        console.error('List audit logs error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
