import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { createAuditLog } from '@/lib/audit';

export async function POST(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Bank Staff', 'Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { loanId, notes, verificationDetails } = body;
        if (!loanId) {
            return NextResponse.json({ success: false, message: 'Missing loanId' }, { status: 400 });
        }

        const db = await getDb();
        const query = ObjectId.isValid(loanId) ? { _id: new ObjectId(loanId) } : { loanId };
        const loan = await db.collection('loans').findOne(query);

        if (!loan) {
            return NextResponse.json({ success: false, message: 'Loan application not found' }, { status: 404 });
        }

        await db.collection('loans').updateOne(query, {
            $set: {
                reviewStatus: 'StaffVerified_ForwardedToAdmin',
                forwardedToAdminAt: new Date(),
                verifiedByStaff: session.username,
                staffVerificationNotes: notes || 'Documents and identity verified by staff'
            },
            $push: {
                timeline: {
                    action: 'STAFF_VERIFIED_FORWARDED',
                    actor: session.username,
                    actorRole: session.role,
                    note: notes || 'Verified and forwarded to Admin for underwriting decision',
                    timestamp: new Date()
                }
            }
        });

        await createAuditLog({
            actorName: session.username,
            actorRole: session.role,
            action: 'LOAN_FORWARDED_TO_ADMIN',
            targetType: 'Loan',
            targetId: String(loan._id),
            description: notes || 'Loan verified and forwarded to Admin',
        });

        return NextResponse.json({ success: true, message: 'Loan application verified and forwarded to Admin' });
    } catch (err) {
        console.error('Forward loan error:', err);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
