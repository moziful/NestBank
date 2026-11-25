import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const db = await getDb();
        const staffUserId = session.userId;

        // 1. Customers registered by staff
        const registeredByMeCount = await db.collection('users').countDocuments({
            role: 'Customer',
            $or: [
                { createdBy: staffUserId },
                { 'metadata.registeredBy': staffUserId }
            ]
        });

        // 2. Accounts opened by staff
        const accountsOpenedByMeCount = await db.collection('accounts').countDocuments({
            $or: [
                { createdBy: staffUserId },
                { 'metadata.openedBy': staffUserId }
            ]
        });

        // 3. Pending requests
        const pendingRequestsCount = await db.collection('bankingRequests').countDocuments({
            status: 'Pending'
        });

        // 4. Transactions handled today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const transactionsTodayCount = await db.collection('transactions').countDocuments({
            createdAt: { $gte: startOfDay }
        });

        // 5. Loan applications in review/pending
        const pendingLoansCount = await db.collection('loans').countDocuments({
            status: { $in: ['Pending', 'Submitted', 'Under Review'] }
        });

        // 6. Flagged transactions awaiting review
        const flaggedTxCount = await db.collection('transactions').countDocuments({
            riskStatus: { $in: ['Flagged', 'Suspicious', 'Under Review'] }
        });

        // Recent transactions handled
        const recentTransactions = await db.collection('transactions')
            .find({})
            .sort({ createdAt: -1 })
            .limit(7)
            .toArray();

        // Staff operational activity timeline
        const recentAudit = await db.collection('auditLogs')
            .find({ actorRole: { $in: ['Bank Staff', 'Admin'] } })
            .sort({ timestamp: -1 })
            .limit(6)
            .toArray();

        return NextResponse.json({
            success: true,
            stats: {
                registeredByMe: registeredByMeCount,
                accountsOpenedByMe: accountsOpenedByMeCount,
                pendingRequests: pendingRequestsCount,
                transactionsToday: transactionsTodayCount,
                pendingLoans: pendingLoansCount,
                flaggedTransactions: flaggedTxCount,
            },
            recentTransactions,
            recentActivities: recentAudit
        });
    } catch (err) {
        console.error('Staff Overview API error:', err);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
