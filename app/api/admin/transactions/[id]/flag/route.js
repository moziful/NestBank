import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request, context) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const { id } = await context.params;
        const body = await request.json();
        const { reason, ruleTriggered } = body;

        if (!reason || reason.trim().length < 5) {
            return NextResponse.json({ success: false, message: 'A specific reason (min 5 chars) is required to flag this transaction.' }, { status: 400 });
        }

        const db = await getDb();
        let query = ObjectId.isValid(id) ? { $or: [{ _id: new ObjectId(id) }, { transactionId: id }] } : { transactionId: id };
        
        const transaction = await db.collection('transactions').findOne(query);
        if (!transaction) {
            return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
        }

        const flagRecord = {
            flaggedAt: new Date(),
            flaggedBy: session.username || session.email || 'Admin',
            flaggedByRole: session.role,
            reason: reason.trim(),
            rule: ruleTriggered || 'Manual Investigation',
            status: 'FLAGGED'
        };

        await db.collection('transactions').updateOne(
            { _id: transaction._id },
            {
                $set: {
                    riskStatus: 'FLAGGED',
                    updatedAt: new Date()
                },
                $push: {
                    riskFlags: flagRecord
                }
            }
        );

        // Audit log entry
        await db.collection('auditLogs').insertOne({
            actor: session.username || session.email,
            role: session.role,
            action: 'TRANSACTION_FLAGGED',
            event: `Transaction ${transaction.transactionId} flagged: ${reason}`,
            recordRef: transaction.transactionId,
            severity: 'Security',
            createdAt: new Date()
        });

        return NextResponse.json({
            success: true,
            message: 'Transaction flagged successfully for investigation.',
            riskStatus: 'FLAGGED'
        });
    } catch (err) {
        console.error('Flag transaction error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
