import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { notifyUser } from '@/lib/notifications';

export async function POST(request, context) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await context.params;
        const body = await request.json().catch(() => ({}));
        const { action, approvedAmount, durationMonths, interestRate, rejectionReason, decisionNote } = body;

        const db = await getDb();
        const query = ObjectId.isValid(id) ? { $or: [{ _id: new ObjectId(id) }, { loanId: id }, { applicationId: id }] } : { loanId: id };

        const loan = await db.collection('loans').findOne(query);
        if (!loan) {
            return NextResponse.json({ success: false, message: 'Loan application not found.' }, { status: 404 });
        }

        const now = new Date();

        if (action === 'REVIEW') {
            await db.collection('loans').updateOne(
                { _id: loan._id },
                {
                    $set: {
                        status: 'Under Review',
                        underReviewAt: now,
                        underReviewBy: session.username || session.email,
                        updatedAt: now
                    }
                }
            );
            return NextResponse.json({ success: true, message: 'Loan application placed under active credit review.' });
        }

        if (action === 'REJECT') {
            if (!rejectionReason || rejectionReason.trim().length < 3) {
                return NextResponse.json({ success: false, message: 'Mandatory rejection reason required.' }, { status: 400 });
            }

            await db.collection('loans').updateOne(
                { _id: loan._id },
                {
                    $set: {
                        status: 'Rejected',
                        reviewedAt: now,
                        reviewedBy: session.username || session.email,
                        rejectionReason: rejectionReason.trim(),
                        decisionNote: decisionNote || '',
                        updatedAt: now
                    }
                }
            );

            await db.collection('auditLogs').insertOne({
                actor: session.username || session.email,
                role: session.role,
                action: 'LOAN_APPLICATION_REJECTED',
                event: `Rejected loan application ${loan.loanId || loan.applicationId}: ${rejectionReason}`,
                recordRef: loan.loanId || loan.applicationId,
                severity: 'Info',
                createdAt: now
            });

            await notifyUser({
                userId: loan.userId,
                title: 'Loan Application Rejected',
                message: `Your loan application (${loan.loanId || loan.applicationId}) was not approved. Reason: ${rejectionReason.trim()}`,
                category: 'LOAN',
                href: `/customer/loans/${loan.loanId || loan._id.toString()}`,
            });

            return NextResponse.json({ success: true, message: 'Loan application rejected.' });
        }

        if (action === 'APPROVE') {
            const finalApprovedAmount = Number(approvedAmount || loan.amount || loan.requestedAmount || 100000);
            const finalDuration = Number(durationMonths || loan.durationMonths || 12);
            const rate = Number(interestRate || loan.interestRate || 9.5);

            await db.collection('loans').updateOne(
                { _id: loan._id },
                {
                    $set: {
                        status: 'Approved',
                        approvedAmount: finalApprovedAmount,
                        durationMonths: finalDuration,
                        interestRate: rate,
                        reviewedAt: now,
                        reviewedBy: session.username || session.email,
                        decisionNote: decisionNote || 'Credit terms verified and approved.',
                        disbursementStatus: 'Pending Disbursement',
                        updatedAt: now
                    }
                }
            );

            await db.collection('auditLogs').insertOne({
                actor: session.username || session.email,
                role: session.role,
                action: 'LOAN_APPLICATION_APPROVED',
                event: `Approved credit application ${loan.loanId || loan.applicationId} for ৳${finalApprovedAmount.toLocaleString()}`,
                recordRef: loan.loanId || loan.applicationId,
                severity: 'Info',
                createdAt: now
            });

            await notifyUser({
                userId: loan.userId,
                title: 'Loan Application Approved',
                message: `Your loan application (${loan.loanId || loan.applicationId}) for ৳${finalApprovedAmount.toLocaleString()} has been approved and is queued for disbursement.`,
                category: 'LOAN',
                href: `/customer/loans/${loan.loanId || loan._id.toString()}`,
            });

            return NextResponse.json({
                success: true,
                message: 'Loan approved successfully. Created approved loan record.'
            });
        }

        return NextResponse.json({ success: false, message: 'Invalid decision action.' }, { status: 400 });
    } catch (err) {
        console.error('Loan decision error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
