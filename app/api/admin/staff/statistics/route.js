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
        const totalStaff = await db.collection('users').countDocuments({ role: 'Bank Staff' });
        const activeStaff = await db.collection('users').countDocuments({ role: 'Bank Staff', status: 'Active' });
        const inactiveStaff = await db.collection('users').countDocuments({
            role: 'Bank Staff',
            status: { $in: ['Inactive', 'Suspended'] },
        });

        // New this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newThisMonth = await db.collection('users').countDocuments({
            role: 'Bank Staff',
            createdAt: { $gte: startOfMonth },
        });

        // Recent staff activity logs
        const recentActivities = await db.collection('auditLogs')
            .find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();

        return NextResponse.json({
            success: true,
            statistics: {
                totalStaff,
                activeStaff,
                inactiveStaff,
                newThisMonth,
            },
            recentActivities,
        });
    } catch (error) {
        console.error('Staff statistics error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
