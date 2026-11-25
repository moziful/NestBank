import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request, context) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Only Admins can clear risk flags' }, { status: 403 });
        }

        const { id } = await context.params;
        const body = await request.json();
        const { resolutionNote } = body;

        if (!resolutionNote || resolutionNote.trim().length < 5) {
            return NextResponse.json({ success: false, message: 'A comprehensive clearance explanation (min 5 chars) is mandatory.' }, { status: 400 });
        }

        const db = await getDb();
        let query = ObjectId.isValid(id) ? { $or: [{ _id: new ObjectId(id) }, { transactionId: id }] } : { transactionId: id };
        
        const transaction = await db.collection('transactions').findOne(query);
        if (!transaction) {
            return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
        }

        const clearanceEntry = {
            clearedAt: new Date(),
            clearedBy: session.username || session.email || 'Admin',
            resolutionNote: resolutionNote.trim()
        };

        await db.collection('transactions').updateOne(
            { _id: transaction._id },
            {
                $set: {
                    riskStatus: 'CLEARED',
                    clearedDetails: clearanceEntry,
                    updatedAt: new Date()
                },
                $push: {
                    investigationNotes: {
                        note: `Risk Flag Cleared: ${resolutionNote.trim()}`,
                        author: session.username || session.email,
                        role: session.role,
                        createdAt: new Date()
                    }
                }
            }
        );

        // Audit log entry
        await db.collection('auditLogs').insertOne({
            actor: session.username || session.email,
            role: session.role,
            action: 'TRANSACTION_FLAG_CLEARED',
            event: `Risk flag cleared on ${transaction.transactionId}: ${resolutionNote}`,
            recordRef: transaction.transactionId,
            severity: 'Info',
            createdAt: new Date()
        });

        return NextResponse.json({
            success: true,
            message: 'Transaction risk flag successfully cleared.',
            riskStatus: 'CLEARED'
        });
    } catch (err) {
        console.error('Clear flag error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
