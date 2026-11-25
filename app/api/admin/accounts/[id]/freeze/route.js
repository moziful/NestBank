import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

async function resolveAccount(db, id) {
    if (ObjectId.isValid(id)) {
        return db.collection('accounts').findOne({ _id: new ObjectId(id) });
    }
    return db.collection('accounts').findOne({ accountNumber: id });
}

// POST /api/admin/accounts/[id]/freeze
export async function POST(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { reason = 'Suspicious transaction activity' } = body;

        const db = await getDb();
        const account = await resolveAccount(db, id);
        if (!account) {
            return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 });
        }

        await db.collection('accounts').updateOne(
            { _id: account._id },
            {
                $set: {
                    status: 'Frozen',
                    freezeReason: reason,
                    frozenAt: new Date(),
                    frozenBy: session.userId,
                    updatedAt: new Date(),
                },
            }
        );

        // Audit log
        await db.collection('auditLogs').insertOne({
            actorId: session.userId,
            actor: session.name || 'System Admin',
            action: 'ACCOUNT_FROZEN',
            event: `Froze bank account ${account.accountNumber} (${account.customerName}). Reason: ${reason}`,
            recordRef: account.accountNumber,
            severity: 'Security',
            createdAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: `Account ${account.accountNumber} has been frozen. Outgoing transfers and withdrawals are restricted.`,
        });
    } catch (error) {
        console.error('Freeze account error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
