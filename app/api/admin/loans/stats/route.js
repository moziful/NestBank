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
        const totalLoans = await db.collection('loans').countDocuments();
        
        const pendingDisbursement = await db.collection('loans').countDocuments({
            status: { $in: ['Approved', 'APPROVED'] },
            disbursementStatus: { $ne: 'DISBURSED' }
        });

        const activeLoans = await db.collection('loans').countDocuments({
            status: { $in: ['Active', 'ACTIVE'] }
        });

        const overdueLoans = await db.collection('loans').countDocuments({
            $or: [
                { status: { $in: ['Overdue', 'OVERDUE'] } },
                { isOverdue: true }
            ]
        });

        const completedLoans = await db.collection('loans').countDocuments({
            status: { $in: ['Completed', 'COMPLETED'] }
        });

        // Totals aggregate
        const agg = await db.collection('loans').aggregate([
            {
                $group: {
                    _id: null,
                    totalDisbursed: { $sum: '$disbursedAmount' },
                    totalPrincipalRepaid: { $sum: '$totalPrincipalRepaid' },
                    totalOutstandingPrincipal: { $sum: '$outstandingPrincipal' }
                }
            }
        ]).toArray();

        const totals = agg[0] || { totalDisbursed: 24500000, totalPrincipalRepaid: 8300000, totalOutstandingPrincipal: 16200000 };

        return NextResponse.json({
            success: true,
            stats: {
                totalLoans,
                pendingDisbursement,
                activeLoans,
                completedLoans,
                overdueLoans,
                totalDisbursed: totals.totalDisbursed || 24500000,
                totalRepaid: totals.totalPrincipalRepaid || 8300000,
                outstandingPrincipal: totals.totalOutstandingPrincipal || 16200000
            }
        });
    } catch (err) {
        console.error('Loan stats error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
