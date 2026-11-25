import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { notifyUser } from '@/lib/notifications';

async function resolveAccount(db, id) {
    if (ObjectId.isValid(id)) {
        return db.collection('accounts').findOne({ _id: new ObjectId(id) });
    }
    return db.collection('accounts').findOne({ accountNumber: id });
}

// POST /api/admin/accounts/[id]/unfreeze
export async function POST(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { unfreezeReason = 'Administrative clearance' } = body;

        const db = await getDb();
        const account = await resolveAccount(db, id);
        if (!account) {
            return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 });
        }

        await db.collection('accounts').updateOne(
            { _id: account._id },
            {
                $set: {
                    status: 'Active',
                    unfreezeReason,
                    unfrozenAt: new Date(),
                    unfrozenBy: session.userId,
                    updatedAt: new Date(),
                },
            }
        );

        await db.collection('auditLogs').insertOne({
            actorId: session.userId,
            actor: session.name || 'System Admin',
            action: 'ACCOUNT_UNFROZEN',
            event: `Unfroze bank account ${account.accountNumber} (${account.customerName}). Reason: ${unfreezeReason}`,
            recordRef: account.accountNumber,
            severity: 'Info',
            createdAt: new Date(),
        });

        await notifyUser({
            userId: account.userId,
            title: 'Account Restored to Active',
            message: `Your account ${account.accountNumber} has been unfrozen and restored to Active status.`,
            category: 'ACCOUNT',
            href: `/customer/accounts/${account._id.toString()}`,
        });

        return NextResponse.json({
            success: true,
            message: `Account ${account.accountNumber} has been restored to Active status.`,
        });
    } catch (error) {
        console.error('Unfreeze account error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
