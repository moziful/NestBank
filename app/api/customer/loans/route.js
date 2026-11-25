import { NextResponse } from 'next/server';
import { getSession, hasRole, isAccountActive } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { createAuditLog } from '@/lib/audit';

const LOAN_RATES = {
    'Personal Loan': 11.5,
    'Home Loan': 8.5,
    'Business Loan': 10.0,
    'Auto Loan': 9.5,
    'Education Loan': 7.5,
};

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Customer'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const db = await getDb();
        const loans = await db.collection('loans')
            .find({ userId: session.userId })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({
            success: true,
            loans: loans.map((l) => ({ ...l, _id: String(l._id) })),
            products: Object.entries(LOAN_RATES).map(([name, rate]) => ({ name, interestRate: rate })),
        });
    } catch (error) {
        console.error('Customer loans GET error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Customer'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }
        if (!isAccountActive(session)) {
            return NextResponse.json({ success: false, message: 'Account is suspended or inactive' }, { status: 403 });
        }

        const body = await request.json();
        const {
            loanType = 'Personal Loan',
            amount,
            durationMonths,
            accountNumber,
            purpose = '',
            monthlyIncome,
        } = body;

        const principal = Number(amount);
        const months = Number(durationMonths);
        if (!principal || principal < 10000 || !months || months < 6 || !accountNumber) {
            return NextResponse.json(
                { success: false, message: 'Valid loan amount (>= ৳10,000), tenor (>= 6 months), and account are required.' },
                { status: 400 }
            );
        }

        const db = await getDb();
        const account = await db.collection('accounts').findOne({
            accountNumber: accountNumber.trim(),
            userId: session.userId,
        });
        if (!account) {
            return NextResponse.json({ success: false, message: 'Selected account not found or unauthorized.' }, { status: 403 });
        }

        const interestRate = LOAN_RATES[loanType] || 11.5;
        const monthlyRate = interestRate / 12 / 100;
        const emi = Math.round(
            (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1)
        );

        const now = new Date();
        const loanId = `LN-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const newLoan = {
            loanId,
            userId: session.userId,
            applicantName: session.name || session.username,
            accountNumber: account.accountNumber,
            loanType,
            amount: principal,
            principalAmount: principal,
            outstandingPrincipal: principal,
            interestRate,
            durationMonths: months,
            monthlyInstallment: emi,
            purpose: (purpose || '').trim(),
            monthlyIncome: Number(monthlyIncome) || 0,
            status: 'Pending',
            disbursementStatus: 'Not Disbursed',
            totalPaid: 0,
            timeline: [
                {
                    action: 'APPLICATION_SUBMITTED',
                    actor: session.username,
                    actorRole: 'Customer',
                    note: `Applied for ${loanType} of ৳${principal.toLocaleString()}`,
                    timestamp: now,
                },
            ],
            createdAt: now,
            updatedAt: now,
        };

        const res = await db.collection('loans').insertOne(newLoan);

        await db.collection('notifications').insertOne({
            userId: session.userId,
            title: 'Loan Application Submitted',
            message: `Your ${loanType} application (${loanId}) for ৳${principal.toLocaleString()} has been received.`,
            category: 'LOAN',
            read: false,
            createdAt: now,
        });

        await createAuditLog({
            actorId: session.userId,
            actorName: session.name || session.username,
            actorRole: 'CUSTOMER',
            action: 'CUSTOMER_LOAN_APPLIED',
            category: 'LOAN',
            targetType: 'Loan',
            targetId: loanId,
            description: `Customer applied for ${loanType} (${loanId}) of ৳${principal}`,
        });

        return NextResponse.json({
            success: true,
            message: 'Loan application submitted successfully.',
            loan: { ...newLoan, _id: String(res.insertedId) },
        }, { status: 201 });
    } catch (error) {
        console.error('Customer loan POST error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
