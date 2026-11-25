import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Customer'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const accountNumber = searchParams.get('accountNumber');
        const startDateStr = searchParams.get('startDate');
        const endDateStr = searchParams.get('endDate');

        const db = await getDb();
        const ownedAccounts = await db.collection('accounts').find({ userId: session.userId }).toArray();

        if (ownedAccounts.length === 0) {
            return NextResponse.json({ success: true, accounts: [], statement: null });
        }

        const targetAcc = accountNumber
            ? ownedAccounts.find((a) => a.accountNumber === accountNumber)
            : ownedAccounts[0];

        if (!targetAcc) {
            return NextResponse.json({ success: false, message: 'Account not found or unauthorized.' }, { status: 403 });
        }

        const endDate = endDateStr ? new Date(`${endDateStr}T23:59:59.999Z`) : new Date();
        const startDate = startDateStr
            ? new Date(`${startDateStr}T00:00:00.000Z`)
            : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

        const txs = await db.collection('transactions')
            .find(
                {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: { $in: ['Completed', 'Success'] },
                    $or: [
                        { accountNumber: targetAcc.accountNumber },
                        { fromAccount: targetAcc.accountNumber },
                        { toAccount: targetAcc.accountNumber },
                    ],
                },
                { projection: { investigationNotes: 0, riskScore: 0, flaggedBy: 0, riskStatus: 0 } }
            )
            .sort({ createdAt: 1 })
            .toArray();

        let totalCredits = 0;
        let totalDebits = 0;
        const entries = txs.map((tx) => {
            const amt = Number(tx.amount) || 0;
            const isCredit =
                tx.type === 'Deposit' ||
                tx.type === 'Loan Disbursement' ||
                tx.type === 'LOAN_DISBURSEMENT' ||
                (tx.type === 'Transfer' && tx.toAccount === targetAcc.accountNumber);

            if (isCredit) totalCredits += amt;
            else totalDebits += amt;

            return {
                ...tx,
                direction: isCredit ? 'CREDIT' : 'DEBIT',
            };
        });

        const closingBalance = Number(targetAcc.balance) || 0;
        const openingBalance = Math.max(0, closingBalance - totalCredits + totalDebits);

        return NextResponse.json({
            success: true,
            accounts: ownedAccounts.map((a) => ({
                accountNumber: a.accountNumber,
                accountType: a.accountType,
                balance: a.balance,
            })),
            statement: {
                accountNumber: targetAcc.accountNumber,
                accountType: targetAcc.accountType,
                periodStart: startDate,
                periodEnd: endDate,
                openingBalance,
                totalCredits,
                totalDebits,
                closingBalance,
                transactionCount: entries.length,
                entries,
            },
        });
    } catch (error) {
        console.error('Customer statement GET error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
