import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSession, hasRole, isAccountActive } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Customer'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }
        if (!isAccountActive(session)) {
            return NextResponse.json({ success: false, message: 'Account is suspended or inactive' }, { status: 403 });
        }

        const { id } = await params;
        const db = await getDb();

        const query = ObjectId.isValid(id)
            ? { _id: new ObjectId(id), userId: session.userId }
            : { accountNumber: id, userId: session.userId };

        const account = await db.collection('accounts').findOne(query);
        if (!account) {
            return NextResponse.json({ success: false, message: 'Account not found or access denied' }, { status: 404 });
        }

        const transactions = await db.collection('transactions')
            .find(
                {
                    $or: [
                        { accountNumber: account.accountNumber },
                        { fromAccount: account.accountNumber },
                        { toAccount: account.accountNumber },
                    ],
                },
                { projection: { investigationNotes: 0, riskScore: 0, flaggedBy: 0 } }
            )
            .sort({ createdAt: -1 })
            .limit(20)
            .toArray();

        return NextResponse.json({
            success: true,
            account: {
                ...account,
                _id: String(account._id),
                availableBalance: Math.max(0, (Number(account.balance) || 0) - (Number(account.heldAmount) || 0)),
            },
            transactions,
        });
    } catch (error) {
        console.error('Customer account detail API error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
