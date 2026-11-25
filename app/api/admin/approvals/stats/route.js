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

        const pendingDeposits = await db.collection('bankingRequests').countDocuments({
            type: { $in: ['DEPOSIT', 'Deposit'] },
            status: { $in: ['PENDING', 'Pending'] }
        });

        const pendingWithdrawals = await db.collection('bankingRequests').countDocuments({
            type: { $in: ['WITHDRAWAL', 'Withdrawal'] },
            status: { $in: ['PENDING', 'Pending'] }
        });

        const pendingLoans = await db.collection('loans').countDocuments({
            status: { $in: ['PENDING', 'Pending', 'Under Review', 'UNDER_REVIEW'] }
        });

        const totalPending = pendingDeposits + pendingWithdrawals + pendingLoans;

        // Total pending requested amount (deposits + withdrawals)
        const pendingAmountAgg = await db.collection('bankingRequests').aggregate([
            { $match: { status: { $in: ['PENDING', 'Pending'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).toArray();
        const totalPendingAmount = pendingAmountAgg[0]?.total || 0;

        return NextResponse.json({
            success: true,
            stats: {
                totalPending,
                pendingDeposits,
                pendingWithdrawals,
                pendingLoans,
                totalPendingAmount
            }
        });
    } catch (err) {
        console.error('Approvals stats error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
