import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;

async function seedApprovals() {
    try {
        console.log('Connecting to MongoDB for bankingRequests and loan applications enrichment...');
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('nestbank');

        const accounts = await db.collection('accounts').find({}).toArray();
        const users = await db.collection('users').find({ role: 'Customer' }).toArray();

        if (accounts.length === 0 || users.length === 0) {
            console.error('No accounts or users found.');
            await client.close();
            return;
        }

        const now = new Date();

        // 1. Seed Diverse Banking Requests (Deposits & Withdrawals)
        const requests = [
            {
                requestId: 'DEP-20261125-001',
                type: 'Deposit',
                category: 'Deposit',
                customerId: users[0]._id,
                customerName: users[0].name || 'Rahim Ahmed',
                accountId: accounts[0]._id,
                accountNumber: accounts[0].accountNumber,
                amount: 15000,
                currency: 'BDT',
                description: 'Cash deposit via branch counter deposit slip',
                status: 'Pending',
                priority: 'Normal',
                submittedAt: new Date(now.getTime() - 3600000 * 2),
                createdAt: new Date(now.getTime() - 3600000 * 2)
            },
            {
                requestId: 'DEP-20261125-002',
                type: 'Deposit',
                category: 'Deposit',
                customerId: users[1] ? users[1]._id : users[0]._id,
                customerName: users[1] ? users[1].name : 'Sadia Islam',
                accountId: accounts[1] ? accounts[1]._id : accounts[0]._id,
                accountNumber: accounts[1] ? accounts[1].accountNumber : accounts[0].accountNumber,
                amount: 50000,
                currency: 'BDT',
                description: 'Corporate client payroll top-up deposit',
                status: 'Pending',
                priority: 'High',
                submittedAt: new Date(now.getTime() - 3600000 * 4),
                createdAt: new Date(now.getTime() - 3600000 * 4)
            },
            {
                requestId: 'WDR-20261125-004',
                type: 'Withdrawal',
                category: 'Withdrawal',
                customerId: users[0]._id,
                customerName: users[0].name || 'Rahim Ahmed',
                accountId: accounts[0]._id,
                accountNumber: accounts[0].accountNumber,
                amount: 8000,
                currency: 'BDT',
                description: 'Counter cash cheque withdrawal requisition',
                status: 'Pending',
                priority: 'Normal',
                submittedAt: new Date(now.getTime() - 3600000 * 3),
                createdAt: new Date(now.getTime() - 3600000 * 3)
            },
            {
                requestId: 'WDR-20261125-005',
                type: 'Withdrawal',
                category: 'Withdrawal',
                customerId: users[1] ? users[1]._id : users[0]._id,
                customerName: users[1] ? users[1].name : 'Sadia Islam',
                accountId: accounts[1] ? accounts[1]._id : accounts[0]._id,
                accountNumber: accounts[1] ? accounts[1].accountNumber : accounts[0].accountNumber,
                amount: 25000,
                currency: 'BDT',
                description: 'Supplier bulk invoice liquidation',
                status: 'Pending',
                priority: 'Urgent',
                submittedAt: new Date(now.getTime() - 3600000 * 5),
                createdAt: new Date(now.getTime() - 3600000 * 5)
            },
            {
                requestId: 'DEP-20261124-089',
                type: 'Deposit',
                category: 'Deposit',
                customerId: users[0]._id,
                customerName: users[0].name,
                accountId: accounts[0]._id,
                accountNumber: accounts[0].accountNumber,
                amount: 40000,
                currency: 'BDT',
                description: 'Customer savings remittance transfer',
                status: 'Approved',
                priority: 'Normal',
                reviewedAt: new Date(now.getTime() - 86400000),
                reviewedBy: 'admin',
                decisionNote: 'Verified slip and counter stamp.',
                submittedAt: new Date(now.getTime() - 86400000 * 2),
                createdAt: new Date(now.getTime() - 86400000 * 2)
            },
            {
                requestId: 'WDR-20261124-042',
                type: 'Withdrawal',
                category: 'Withdrawal',
                customerId: users[0]._id,
                customerName: users[0].name,
                accountId: accounts[0]._id,
                accountNumber: accounts[0].accountNumber,
                amount: 120000,
                currency: 'BDT',
                description: 'Branch express cash request',
                status: 'Rejected',
                priority: 'Normal',
                reviewedAt: new Date(now.getTime() - 86400000),
                reviewedBy: 'admin',
                rejectionReason: 'Exceeds daily counter cash threshold without advance notice.',
                decisionNote: 'Advised customer to file structured schedule.',
                submittedAt: new Date(now.getTime() - 86400000 * 2),
                createdAt: new Date(now.getTime() - 86400000 * 2)
            }
        ];

        for (const req of requests) {
            await db.collection('bankingRequests').updateOne(
                { requestId: req.requestId },
                { $set: req },
                { upsert: true }
            );
        }

        // 2. Seed Structured Loan Applications
        const loanApps = [
            {
                loanId: 'LN-2026-001',
                applicationId: 'LN-2026-001',
                customerId: users[0]._id,
                customerName: users[0].name || 'Rahim Ahmed',
                accountNumber: accounts[0].accountNumber,
                loanType: 'Personal',
                amount: 500000,
                requestedAmount: 500000,
                durationMonths: 24,
                monthlyIncome: 65000,
                employmentStatus: 'Full-time Private Sector',
                purpose: 'Home Renovation and Family Extension',
                status: 'Pending',
                riskRating: 'Low',
                submittedAt: new Date(now.getTime() - 86400000 * 2),
                createdAt: new Date(now.getTime() - 86400000 * 2)
            },
            {
                loanId: 'LN-2026-002',
                applicationId: 'LN-2026-002',
                customerId: users[1] ? users[1]._id : users[0]._id,
                customerName: users[1] ? users[1].name : 'Sadia Islam',
                accountNumber: accounts[1] ? accounts[1].accountNumber : accounts[0].accountNumber,
                loanType: 'Business',
                amount: 1500000,
                requestedAmount: 1500000,
                durationMonths: 36,
                monthlyIncome: 180000,
                employmentStatus: 'Business Owner / Partner',
                purpose: 'Inventory Capital & Warehouse Lease',
                status: 'Under Review',
                riskRating: 'Medium',
                submittedAt: new Date(now.getTime() - 86400000 * 4),
                createdAt: new Date(now.getTime() - 86400000 * 4)
            },
            {
                loanId: 'LN-2026-003',
                applicationId: 'LN-2026-003',
                customerId: users[0]._id,
                customerName: users[0].name,
                accountNumber: accounts[0].accountNumber,
                loanType: 'Auto Loan',
                amount: 800000,
                requestedAmount: 800000,
                durationMonths: 48,
                monthlyIncome: 75000,
                employmentStatus: 'Government Employee',
                purpose: 'Sedan vehicle acquisition',
                status: 'Approved',
                approvedAmount: 800000,
                interestRate: 8.5,
                riskRating: 'Low',
                submittedAt: new Date(now.getTime() - 86400000 * 7),
                reviewedAt: new Date(now.getTime() - 86400000 * 3),
                reviewedBy: 'admin',
                decisionNote: 'Government salary slip verified. Approved.',
                createdAt: new Date(now.getTime() - 86400000 * 7)
            }
        ];

        for (const loan of loanApps) {
            await db.collection('loans').updateOne(
                { loanId: loan.loanId },
                { $set: loan },
                { upsert: true }
            );
        }

        console.log(`Seeded banking requests and loan applications successfully.`);
        await client.close();
        process.exit(0);
    } catch (err) {
        console.error('Seed approvals error:', err);
        process.exit(1);
    }
}

seedApprovals();
