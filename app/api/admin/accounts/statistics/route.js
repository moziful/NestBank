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
        const totalAccounts = await db.collection('accounts').countDocuments();
        const activeAccounts = await db.collection('accounts').countDocuments({ status: 'Active' });
        const frozenAccounts = await db.collection('accounts').countDocuments({ status: 'Frozen' });

        // Total combined balance
        const balanceAgg = await db.collection('accounts').aggregate([
            { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
        ]).toArray();
        const totalAccountBalance = balanceAgg[0]?.totalBalance || 0;

        // Breakdown by account types
        const savingsCount = await db.collection('accounts').countDocuments({ accountType: 'Savings' });
        const currentCount = await db.collection('accounts').countDocuments({ accountType: 'Current' });
        const businessCount = await db.collection('accounts').countDocuments({ accountType: 'Business' });

        // Recent account audit activity
        const recentActivities = await db.collection('auditLogs')
            .find({
                $or: [
                    { recordRef: { $regex: '^NB' } },
                    { action: { $regex: 'ACCOUNT' } },
                ]
            })
            .sort({ createdAt: -1 })
            .limit(6)
            .toArray();

        return NextResponse.json({
            success: true,
            statistics: {
                totalAccounts,
                activeAccounts,
                frozenAccounts,
                totalAccountBalance,
                savingsCount,
                currentCount,
                businessCount,
            },
            recentActivities,
        });
    } catch (error) {
        console.error('Account stats error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
