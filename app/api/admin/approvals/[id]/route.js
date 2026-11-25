import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, context) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await context.params;
        const db = await getDb();

        const query = ObjectId.isValid(id) ? { $or: [{ _id: new ObjectId(id) }, { requestId: id }] } : { requestId: id };
        const reqDoc = await db.collection('bankingRequests').findOne(query);

        if (!reqDoc) {
            return NextResponse.json({ success: false, message: 'Request not found' }, { status: 404 });
        }

        // Fetch current live account details to verify ledger balance & holds
        let account = null;
        if (reqDoc.accountId) {
            account = await db.collection('accounts').findOne({ _id: new ObjectId(reqDoc.accountId) });
        } else if (reqDoc.accountNumber) {
            account = await db.collection('accounts').findOne({ accountNumber: reqDoc.accountNumber });
        }

        return NextResponse.json({
            success: true,
            request: reqDoc,
            account
        });
    } catch (err) {
        console.error('Request detail error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
