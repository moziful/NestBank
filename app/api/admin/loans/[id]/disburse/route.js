import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { createAuditLog } from '@/lib/audit';

export async function POST(request, context) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await context.params;
        const body = await request.json().catch(() => ({}));
        const { destinationAccountNumber, adminNote } = body;

        const db = await getDb();
        const query = ObjectId.isValid(id) ? { $or: [{ _id: new ObjectId(id) }, { loanId: id }] } : { loanId: id };

        const loan = await db.collection('loans').findOne(query);
        if (!loan) {
            return NextResponse.json({ success: false, message: 'Loan record not found.' }, { status: 404 });
        }

        if (loan.disbursementStatus === 'DISBURSED' || loan.status === 'Active') {
            return NextResponse.json({ success: false, message: 'This loan has already been disbursed.' }, { status: 400 });
        }

        const accNum = destinationAccountNumber || loan.accountNumber;
        const account = await db.collection('accounts').findOne({ accountNumber: accNum });
        if (!account) {
            return NextResponse.json({ success: false, message: `Destination account ${accNum} not found.` }, { status: 404 });
        }

        if (account.status === 'Frozen' || account.status === 'Closed') {
            return NextResponse.json({ success: false, message: `Cannot disburse: Destination account is ${account.status}.` }, { status: 400 });
        }

        const principal = Number(loan.approvedAmount || loan.amount || loan.requestedAmount || 100000);
        const durationMonths = Number(loan.durationMonths || 12);
        const annualRate = Number(loan.annualInterestRate || loan.interestRate || 10);
        const now = new Date();
        const txId = `TXN-DISB-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

        // 1. Credit destination account
        await db.collection('accounts').updateOne(
            { _id: account._id },
            {
                $inc: { balance: principal, ledgerBalance: principal },
                $set: { updatedAt: now }
            }
        );

        // 2. Insert LOAN_DISBURSEMENT financial transaction
        await db.collection('transactions').insertOne({
            transactionId: txId,
            type: 'Loan Disbursement',
            sourceAccountId: null,
            destinationAccountId: account._id,
            destinationAccountNumber: account.accountNumber,
            accountNumber: account.accountNumber,
            customerName: loan.customerName,
            customerId: loan.customerId,
            amount: principal,
            fee: 0,
            currency: 'BDT',
            status: 'Successful',
            riskStatus: 'NORMAL',
            initiatedByType: 'Admin',
            description: `Loan disbursement for ${loan.loanId || loan.applicationId}`,
            reference: loan.loanId || loan.applicationId,
            approvedBy: session.username || session.email,
            createdAt: now,
            completedAt: now
        });

        // 3. Balanced Ledger Entry
        await db.collection('ledgerEntries').insertOne({
            ledgerId: `LED-${txId}-C`,
            transactionId: txId,
            accountId: account._id,
            accountNumber: account.accountNumber,
            entryType: 'CREDIT',
            amount: principal,
            currency: 'BDT',
            description: `Principal loan disbursement: ${loan.loanId}`,
            createdAt: now
        });

        // 4. Generate Repayment Schedule
        const monthlyInterestRate = (annualRate / 100) / 12;
        const totalInstallments = durationMonths;
        const monthlyPrincipal = Math.round(principal / totalInstallments);
        const schedules = [];

        for (let i = 1; i <= totalInstallments; i++) {
            const dueDate = new Date(now);
            dueDate.setMonth(dueDate.getMonth() + i);
            const remainingBalance = principal - (monthlyPrincipal * (i - 1));
            const interest = Math.round(remainingBalance * monthlyInterestRate);

            schedules.push({
                scheduleId: `SCH-${loan.loanId || 'LN'}-${i}`,
                loanId: loan.loanId || loan.applicationId,
                installmentNumber: i,
                dueDate,
                principalDue: i === totalInstallments ? (principal - (monthlyPrincipal * (totalInstallments - 1))) : monthlyPrincipal,
                interestDue: interest,
                totalDue: (i === totalInstallments ? (principal - (monthlyPrincipal * (totalInstallments - 1))) : monthlyPrincipal) + interest,
                principalPaid: 0,
                interestPaid: 0,
                status: i === 1 ? 'UPCOMING' : 'UPCOMING',
                createdAt: now
            });
        }

        await db.collection('repaymentSchedules').insertMany(schedules);

        // 5. Update Loan to Active & Disbursed
        await db.collection('loans').updateOne(
            { _id: loan._id },
            {
                $set: {
                    status: 'Active',
                    disbursementStatus: 'DISBURSED',
                    disbursedAmount: principal,
                    outstandingPrincipal: principal,
                    totalPrincipalRepaid: 0,
                    totalInterestPaid: 0,
                    disbursedAt: now,
                    disbursedBy: session.username || session.email,
                    disbursementTransactionId: txId,
                    destinationAccountNumber: account.accountNumber,
                    startDate: now,
                    maturityDate: schedules[schedules.length - 1].dueDate,
                    updatedAt: now
                }
            }
        );

        // 6. Audit Log
        await createAuditLog({
            actorName: session.username || session.email,
            actorRole: 'ADMIN',
            action: 'LOAN_DISBURSED',
            category: 'LOAN',
            targetType: 'Loan',
            targetId: loan.loanId || loan.applicationId,
            description: `Disbursed ৳${principal.toLocaleString()} into account ${account.accountNumber} for loan ${loan.loanId}`,
            severity: 'WARNING',
            outcome: 'SUCCESS'
        });

        return NextResponse.json({
            success: true,
            message: `Loan successfully disbursed! ৳${principal.toLocaleString()} credited to ${account.accountNumber}.`,
            transactionId: txId
        });
    } catch (err) {
        console.error('Loan disbursement error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
