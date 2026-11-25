import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const db = await getDb();
        const totalCustomers = await db.collection('users').countDocuments({ role: 'Customer' });
        const activeCustomers = await db.collection('users').countDocuments({ role: 'Customer', status: 'Active' });
        const inactiveCustomers = await db.collection('users').countDocuments({ role: 'Customer', status: 'Inactive' });
        const blockedCustomers = await db.collection('users').countDocuments({ role: 'Customer', status: 'Blocked' });

        // New customers this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newThisMonth = await db.collection('users').countDocuments({
            role: 'Customer',
            createdAt: { $gte: startOfMonth },
        });

        // Recent customer audit activity
        const recentActivities = await db.collection('auditLogs')
            .find({
                $or: [
                    { recordRef: { $regex: '^CUS-' } },
                    { action: { $regex: 'CUSTOMER' } },
                ]
            })
            .sort({ createdAt: -1 })
            .limit(6)
            .toArray();

        return NextResponse.json({
            success: true,
            statistics: {
                totalCustomers,
                activeCustomers,
                inactiveCustomers,
                blockedCustomers,
                newThisMonth,
            },
            recentActivities,
        });
    } catch (error) {
        console.error('Customer stats error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
