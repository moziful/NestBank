import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, context) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const { id } = await context.params;
        const db = await getDb();

        let query = {};
        if (ObjectId.isValid(id)) {
            query = { $or: [{ _id: new ObjectId(id) }, { transactionId: id }] };
        } else {
            query = { transactionId: id };
        }

        const transaction = await db.collection('transactions').findOne(query);
        if (!transaction) {
            return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
        }

        // Ledger entries
        const ledgerEntries = await db.collection('ledgerEntries').find({
            $or: [
                { transactionId: transaction.transactionId },
                { transactionRef: transaction._id }
            ]
        }).toArray();

        // Audit & Flag History
        const auditLogs = await db.collection('auditLogs').find({
            $or: [
                { recordRef: transaction.transactionId },
                { recordRef: transaction._id.toString() }
            ]
        }).sort({ createdAt: -1 }).toArray();

        return NextResponse.json({
            success: true,
            transaction,
            ledgerEntries,
            auditLogs
        });
    } catch (err) {
        console.error('Get transaction detail error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
