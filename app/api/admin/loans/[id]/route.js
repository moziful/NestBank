import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, context) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await context.params;
        const db = await getDb();

        const query = ObjectId.isValid(id) ? { $or: [{ _id: new ObjectId(id) }, { loanId: id }, { applicationId: id }] } : { loanId: id };
        const loan = await db.collection('loans').findOne(query);

        if (!loan) {
            return NextResponse.json({ success: false, message: 'Loan not found' }, { status: 404 });
        }

        // Repayment schedules
        const schedules = await db.collection('repaymentSchedules')
            .find({ loanId: loan.loanId || loan.applicationId })
            .sort({ installmentNumber: 1 })
            .toArray();

        // Repayments history
        const repayments = await db.collection('repayments')
            .find({ loanId: loan.loanId || loan.applicationId })
            .sort({ paymentDate: -1 })
            .toArray();

        // Audit events for this loan
        const activity = await db.collection('auditLogs')
            .find({ targetId: loan.loanId || loan.applicationId })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({
            success: true,
            loan,
            schedules,
            repayments,
            activity
        });
    } catch (err) {
        console.error('Get loan detail error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
