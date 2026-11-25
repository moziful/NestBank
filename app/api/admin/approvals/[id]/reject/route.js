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
        const body = await request.json().catch(() => ({}));
        const { rejectionReason, decisionNote } = body;

        if (!rejectionReason || rejectionReason.trim().length < 3) {
            return NextResponse.json({ success: false, message: 'A mandatory rejection reason must be provided.' }, { status: 400 });
        }

        const db = await getDb();
        const query = ObjectId.isValid(id) ? { $or: [{ _id: new ObjectId(id) }, { requestId: id }] } : { requestId: id };
        
        const reqDoc = await db.collection('bankingRequests').findOne(query);
        if (!reqDoc) {
            return NextResponse.json({ success: false, message: 'Banking request not found.' }, { status: 404 });
        }

        if (reqDoc.status !== 'Pending' && reqDoc.status !== 'PENDING') {
            return NextResponse.json({ success: false, message: `Request is already ${reqDoc.status}.` }, { status: 400 });
        }

        const now = new Date();

        await db.collection('bankingRequests').updateOne(
            { _id: reqDoc._id },
            {
                $set: {
                    status: 'Rejected',
                    reviewedAt: now,
                    reviewedBy: session.username || session.email,
                    reviewedByRole: session.role,
                    rejectionReason: rejectionReason.trim(),
                    decisionNote: decisionNote ? decisionNote.trim() : '',
                    updatedAt: now
                }
            }
        );

        // Audit Log
        await db.collection('auditLogs').insertOne({
            actor: session.username || session.email,
            role: session.role,
            action: 'BANKING_REQUEST_REJECTED',
            event: `Rejected request ${reqDoc.requestId}: ${rejectionReason}`,
            recordRef: reqDoc.requestId,
            severity: 'Security',
            createdAt: now
        });

        return NextResponse.json({
            success: true,
            message: 'Request rejected. Customer status updated.'
        });
    } catch (err) {
        console.error('Reject request error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
