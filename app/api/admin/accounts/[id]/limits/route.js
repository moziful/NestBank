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

// GET /api/admin/accounts/[id]/limits
export async function GET(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const db = await getDb();
        const account = await resolveAccount(db, id);

        if (!account) {
            return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            accountNumber: account.accountNumber,
            limits: account.limits || {
                maxSingleTransfer: 50000,
                dailyTransferLimit: 100000,
                dailyWithdrawalLimit: 40000,
                minimumBalance: 500,
                dailyTransactionCount: 20,
            },
        });
    } catch (error) {
        console.error('Fetch limits error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/admin/accounts/[id]/limits - update transaction limits with validation and audit log
export async function PATCH(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const {
            maxSingleTransfer,
            dailyTransferLimit,
            dailyWithdrawalLimit,
            minimumBalance,
            dailyTransactionCount,
        } = body;

        // Validations
        if (maxSingleTransfer <= 0 || dailyTransferLimit <= 0 || dailyWithdrawalLimit <= 0) {
            return NextResponse.json({ success: false, message: 'Transaction limits must be positive numbers.' }, { status: 400 });
        }

        if (Number(maxSingleTransfer) > Number(dailyTransferLimit)) {
            return NextResponse.json({
                success: false,
                message: 'Maximum single transfer cannot exceed the daily transfer limit.',
            }, { status: 400 });
        }

        if (Number(minimumBalance) < 0) {
            return NextResponse.json({ success: false, message: 'Minimum balance cannot be negative.' }, { status: 400 });
        }

        const db = await getDb();
        const account = await resolveAccount(db, id);
        if (!account) {
            return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 });
        }

        const oldLimits = account.limits || {};
        const newLimits = {
            maxSingleTransfer: Number(maxSingleTransfer),
            dailyTransferLimit: Number(dailyTransferLimit),
            dailyWithdrawalLimit: Number(dailyWithdrawalLimit),
            minimumBalance: Number(minimumBalance),
            dailyTransactionCount: Number(dailyTransactionCount) || 20,
        };

        await db.collection('accounts').updateOne(
            { _id: account._id },
            {
                $set: {
                    limits: newLimits,
                    limitsUpdatedAt: new Date(),
                    limitsUpdatedBy: session.userId,
                    updatedAt: new Date(),
                },
            }
        );

        // Audit log
        await db.collection('auditLogs').insertOne({
            actorId: session.userId,
            actor: session.name || 'System Admin',
            action: 'ACCOUNT_LIMITS_CHANGED',
            event: `Configured transaction limits for ${account.accountNumber}: Max Single ৳${newLimits.maxSingleTransfer}, Daily Transfer ৳${newLimits.dailyTransferLimit}, Daily Withdrawal ৳${newLimits.dailyWithdrawalLimit}`,
            recordRef: account.accountNumber,
            metadata: { oldLimits, newLimits },
            severity: 'Info',
            createdAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: 'Account transaction limits updated successfully.',
            limits: newLimits,
        });
    } catch (error) {
        console.error('Update limits error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
