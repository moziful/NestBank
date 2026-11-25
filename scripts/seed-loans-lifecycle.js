import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

async function seedLoansLifecycle() {
    try {
        console.log('Connecting to MongoDB for loans and repayment schedules enrichment...');
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('nestbank');

        const accounts = await db.collection('accounts').find({}).toArray();
        const users = await db.collection('users').find({ role: 'Customer' }).toArray();

        if (accounts.length === 0 || users.length === 0) {
            console.error('No accounts or customers found.');
            await client.close();
            return;
        }

        const now = new Date();
        const baseTime = now.getTime();

        // 1. Pending Disbursement Loan
        await db.collection('loans').updateOne(
            { loanId: 'LN-2026-003' },
            {
                $set: {
                    loanId: 'LN-2026-003',
                    applicationId: 'APP-LN-003',
                    customerId: users[0]._id.toString(),
                    customerName: users[0].name || 'Rahim Ahmed',
                    accountNumber: accounts[0].accountNumber,
                    loanType: 'Auto Loan',
                    approvedAmount: 800000,
                    disbursedAmount: 0,
                    outstandingPrincipal: 800000,
                    annualInterestRate: 8.5,
                    durationMonths: 48,
                    status: 'Approved',
                    disbursementStatus: 'PENDING',
                    approvedAt: new Date(baseTime - 86400000 * 2),
                    approvedBy: 'admin',
                    createdAt: new Date(baseTime - 86400000 * 5)
                }
            },
            { upsert: true }
        );

        // 2. Active Disbursed Loan with Repayments
        const activeLoanId = 'LN-2026-004';
        const principal = 300000;
        const repaid = 50000;
        await db.collection('loans').updateOne(
            { loanId: activeLoanId },
            {
                $set: {
                    loanId: activeLoanId,
                    applicationId: 'APP-LN-004',
                    customerId: users[1] ? users[1]._id.toString() : users[0]._id.toString(),
                    customerName: users[1] ? users[1].name : 'Sadia Islam',
                    accountNumber: accounts[1] ? accounts[1].accountNumber : accounts[0].accountNumber,
                    loanType: 'Personal Loan',
                    approvedAmount: principal,
                    disbursedAmount: principal,
                    totalPrincipalRepaid: repaid,
                    totalInterestPaid: 12000,
                    outstandingPrincipal: principal - repaid,
                    annualInterestRate: 12.0,
                    interestMethod: 'REDUCING_BALANCE',
                    durationMonths: 24,
                    status: 'Active',
                    disbursementStatus: 'DISBURSED',
                    destinationAccountNumber: accounts[1] ? accounts[1].accountNumber : accounts[0].accountNumber,
                    disbursedAt: new Date(baseTime - 86400000 * 60),
                    disbursedBy: 'admin',
                    createdAt: new Date(baseTime - 86400000 * 65)
                }
            },
            { upsert: true }
        );

        // Seed schedules for LN-2026-004
        for (let i = 1; i <= 6; i++) {
            await db.collection('repaymentSchedules').updateOne(
                { scheduleId: `SCH-${activeLoanId}-${i}` },
                {
                    $set: {
                        scheduleId: `SCH-${activeLoanId}-${i}`,
                        loanId: activeLoanId,
                        installmentNumber: i,
                        dueDate: new Date(baseTime + (i * 86400000 * 30)),
                        principalDue: 12500,
                        interestDue: 2500,
                        totalDue: 15000,
                        principalPaid: i <= 2 ? 12500 : 0,
                        interestPaid: i <= 2 ? 2500 : 0,
                        status: i <= 2 ? 'PAID' : (i === 3 ? 'DUE' : 'UPCOMING'),
                        createdAt: new Date(baseTime - 86400000 * 60)
                    }
                },
                { upsert: true }
            );
        }

        // 3. Overdue Loan
        const overdueLoanId = 'LN-2026-005';
        await db.collection('loans').updateOne(
            { loanId: overdueLoanId },
            {
                $set: {
                    loanId: overdueLoanId,
                    applicationId: 'APP-LN-005',
                    customerId: users[0]._id.toString(),
                    customerName: users[0].name,
                    accountNumber: accounts[0].accountNumber,
                    loanType: 'Business Loan',
                    approvedAmount: 1000000,
                    disbursedAmount: 1000000,
                    totalPrincipalRepaid: 150000,
                    totalInterestPaid: 35000,
                    outstandingPrincipal: 850000,
                    annualInterestRate: 14.0,
                    durationMonths: 36,
                    status: 'Overdue',
                    isOverdue: true,
                    disbursementStatus: 'DISBURSED',
                    disbursedAt: new Date(baseTime - 86400000 * 120),
                    createdAt: new Date(baseTime - 86400000 * 125)
                }
            },
            { upsert: true }
        );

        // 4. Completed Loan
        const completedLoanId = 'LN-2026-006';
        await db.collection('loans').updateOne(
            { loanId: completedLoanId },
            {
                $set: {
                    loanId: completedLoanId,
                    applicationId: 'APP-LN-006',
                    customerId: users[0]._id.toString(),
                    customerName: users[0].name,
                    accountNumber: accounts[0].accountNumber,
                    loanType: 'Personal Loan',
                    approvedAmount: 150000,
                    disbursedAmount: 150000,
                    totalPrincipalRepaid: 150000,
                    totalInterestPaid: 18000,
                    outstandingPrincipal: 0,
                    annualInterestRate: 10.0,
                    durationMonths: 12,
                    status: 'Completed',
                    disbursementStatus: 'DISBURSED',
                    disbursedAt: new Date(baseTime - 86400000 * 400),
                    completedAt: new Date(baseTime - 86400000 * 35),
                    createdAt: new Date(baseTime - 86400000 * 405)
                }
            },
            { upsert: true }
        );

        console.log('Seeded comprehensive loan records across all lifecycle stages.');
        await client.close();
        process.exit(0);
    } catch (err) {
        console.error('Seed loans error:', err);
        process.exit(1);
    }
}

seedLoansLifecycle();
