import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request, context) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await context.params;
        const body = await request.json();
        const { note } = body;

        if (!note || note.trim().length < 3) {
            return NextResponse.json({ success: false, message: 'Note content cannot be blank (min 3 chars).' }, { status: 400 });
        }

        const db = await getDb();
        let query = ObjectId.isValid(id) ? { $or: [{ _id: new ObjectId(id) }, { transactionId: id }] } : { transactionId: id };
        
        const transaction = await db.collection('transactions').findOne(query);
        if (!transaction) {
            return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
        }

        const noteObj = {
            note: note.trim(),
            author: session.username || session.email,
            role: session.role,
            createdAt: new Date()
        };

        await db.collection('transactions').updateOne(
            { _id: transaction._id },
            {
                $push: { investigationNotes: noteObj },
                $set: { updatedAt: new Date() }
            }
        );

        await db.collection('auditLogs').insertOne({
            actor: session.username || session.email,
            role: session.role,
            action: 'TRANSACTION_NOTE_ADDED',
            event: `Added investigation note to ${transaction.transactionId}`,
            recordRef: transaction.transactionId,
            severity: 'Info',
            createdAt: new Date()
        });

        return NextResponse.json({
            success: true,
            message: 'Investigation note appended successfully.',
            note: noteObj
        });
    } catch (err) {
        console.error('Add note error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
