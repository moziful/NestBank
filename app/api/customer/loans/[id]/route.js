import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Customer'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const db = await getDb();

        const query = ObjectId.isValid(id)
            ? { _id: new ObjectId(id), userId: session.userId }
            : { loanId: id, userId: session.userId };

        const loan = await db.collection('loans').findOne(query);
        if (!loan) {
            return NextResponse.json({ success: false, message: 'Loan not found or access denied' }, { status: 404 });
        }

        const schedules = await db.collection('repaymentSchedules')
            .find({ loanId: loan.loanId })
            .sort({ installmentNumber: 1 })
            .toArray();

        const repayments = await db.collection('repayments')
            .find({ loanId: loan.loanId })
            .sort({ paidAt: -1 })
            .toArray();

        return NextResponse.json({
            success: true,
            loan: { ...loan, _id: String(loan._id) },
            schedules,
            repayments,
        });
    } catch (error) {
        console.error('Customer loan detail GET error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
