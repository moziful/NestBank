import { NextResponse } from 'next/server';
import { getSession, hasRole, isAccountActive } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Customer'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }
        if (!isAccountActive(session)) {
            return NextResponse.json({ success: false, message: 'Account is suspended or inactive' }, { status: 403 });
        }

        const db = await getDb();
        const userId = session.userId;

        const accounts = await db.collection('accounts')
            .find({ userId })
            .sort({ createdAt: 1 })
            .toArray();

        const accountNumbers = accounts.map((a) => a.accountNumber).filter(Boolean);

        const totalBalance = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
        const totalHeld = accounts.reduce((sum, a) => sum + (Number(a.heldAmount) || 0), 0);
        const activeAccountsCount = accounts.filter((a) => a.status === 'Active').length;

        const pendingRequestsCount = await db.collection('bankingRequests').countDocuments({
            userId,
            status: 'Pending',
        });

        const activeLoansCount = await db.collection('loans').countDocuments({
            userId,
            status: { $in: ['Active', 'Approved', 'Overdue'] },
        });

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const txScope = accountNumbers.length > 0
            ? {
                $or: [
                    { userId },
                    { accountNumber: { $in: accountNumbers } },
                    { fromAccount: { $in: accountNumbers } },
                    { toAccount: { $in: accountNumbers } },
                ],
            }
            : { userId };

        const recentTransactions = await db.collection('transactions')
            .find(txScope, { projection: { investigationNotes: 0, riskScore: 0, flaggedBy: 0 } })
            .sort({ createdAt: -1 })
            .limit(8)
            .toArray();

        const monthTxs = await db.collection('transactions')
            .find({ ...txScope, createdAt: { $gte: startOfMonth }, status: { $in: ['Completed', 'Success'] } })
            .toArray();

        let totalDepositsThisMonth = 0;
        let totalWithdrawalsThisMonth = 0;
        for (const tx of monthTxs) {
            if (tx.type === 'Deposit' || (tx.type === 'Transfer' && accountNumbers.includes(tx.toAccount) && !accountNumbers.includes(tx.fromAccount))) {
                totalDepositsThisMonth += Number(tx.amount) || 0;
            } else if (tx.type === 'Withdrawal' || (tx.type === 'Transfer' && accountNumbers.includes(tx.fromAccount) && !accountNumbers.includes(tx.toAccount))) {
                totalWithdrawalsThisMonth += Number(tx.amount) || 0;
            }
        }

        const recentRequests = await db.collection('bankingRequests')
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

        const notifications = await db.collection('notifications')
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

        return NextResponse.json({
            success: true,
            summary: {
                totalBalance,
                availableBalance: Math.max(0, totalBalance - totalHeld),
                totalHeld,
                activeAccountsCount,
                pendingRequestsCount,
                activeLoansCount,
                totalDepositsThisMonth,
                totalWithdrawalsThisMonth,
            },
            accounts: accounts.map((a) => ({
                ...a,
                _id: String(a._id),
                availableBalance: Math.max(0, (Number(a.balance) || 0) - (Number(a.heldAmount) || 0)),
            })),
            recentTransactions,
            recentRequests,
            notifications,
        });
    } catch (error) {
        console.error('Customer overview API error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
