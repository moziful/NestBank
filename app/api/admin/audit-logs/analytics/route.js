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
        const days = parseInt(searchParams.get('days') || '30', 10);
        const db = await getDb();

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // 1. Audit activity over time (events per day)
        const activityOverTime = await db.collection('auditLogs').aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]).toArray();

        // 2. Events by Category
        const eventsByCategory = await db.collection('auditLogs').aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $toUpper: { $ifNull: ['$category', 'SYSTEM'] } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]).toArray();

        return NextResponse.json({
            success: true,
            analytics: {
                activityOverTime: activityOverTime.map(a => ({ date: a._id, count: a.count })),
                eventsByCategory: eventsByCategory.map(c => ({ category: c._id || 'SYSTEM', count: c.count }))
            }
        });
    } catch (err) {
        console.error('Audit analytics error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
