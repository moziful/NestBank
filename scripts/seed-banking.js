import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;

async function seedBankingData() {
    try {
        console.log('Connecting to MongoDB to seed comprehensive banking data...');
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('nestbank');

        // Find existing users
        const users = await db.collection('users').find({}).toArray();
        const customer = users.find(u => u.role === 'Customer') || users[0];
        const admin = users.find(u => u.role === 'Admin') || users[0];

        // 1. Ensure a variety of accounts (Savings, Current, Business)
        const accountTypes = ['Savings', 'Current', 'Business'];
        const existingAccounts = await db.collection('accounts').countDocuments();
        if (existingAccounts < 10) {
            console.log('Seeding diverse accounts...');
            const sampleAccounts = [
                { accountNumber: 'NB1002938471', userId: customer._id.toString(), customerName: 'Alice Customer', accountType: 'Savings', balance: 450000.00, currency: 'BDT', status: 'Active', createdAt: new Date(Date.now() - 60 * 86400000) },
                { accountNumber: 'NB1002938472', userId: customer._id.toString(), customerName: 'Alice Customer', accountType: 'Current', balance: 1250000.00, currency: 'BDT', status: 'Active', createdAt: new Date(Date.now() - 45 * 86400000) },
                { accountNumber: 'NB1002938473', userId: customer._id.toString(), customerName: 'Apex Trade Corp', accountType: 'Business', balance: 8400000.00, currency: 'BDT', status: 'Active', createdAt: new Date(Date.now() - 30 * 86400000) },
                { accountNumber: 'NB1002938474', userId: customer._id.toString(), customerName: 'Rahim Chowdhury', accountType: 'Savings', balance: 320000.00, currency: 'BDT', status: 'Active', createdAt: new Date(Date.now() - 25 * 86400000) },
                { accountNumber: 'NB1002938475', userId: customer._id.toString(), customerName: 'Dhaka Logistics Ltd', accountType: 'Business', balance: 14200000.00, currency: 'BDT', status: 'Active', createdAt: new Date(Date.now() - 20 * 86400000) },
                { accountNumber: 'NB1002938476', userId: customer._id.toString(), customerName: 'Karim Ullah', accountType: 'Current', balance: 780000.00, currency: 'BDT', status: 'Active', createdAt: new Date(Date.now() - 15 * 86400000) },
                { accountNumber: 'NB1002938477', userId: customer._id.toString(), customerName: 'Farhana Ahmed', accountType: 'Savings', balance: 950000.00, currency: 'BDT', status: 'Active', createdAt: new Date(Date.now() - 10 * 86400000) },
                { accountNumber: 'NB1002938478', userId: customer._id.toString(), customerName: 'Bengal Tech Solutions', accountType: 'Business', balance: 25000000.00, currency: 'BDT', status: 'Active', createdAt: new Date(Date.now() - 5 * 86400000) },
            ];
            await db.collection('accounts').insertMany(sampleAccounts);
        }

        // 2. Transactions across months
        const existingTx = await db.collection('transactions').countDocuments();
        if (existingTx < 20) {
            console.log('Seeding monthly transactions...');
            const sampleTransactions = [];
            const types = ['Deposit', 'Withdrawal', 'Transfer'];
            const names = ['Alice Customer', 'Apex Trade Corp', 'Rahim Chowdhury', 'Dhaka Logistics', 'Karim Ullah', 'Farhana Ahmed'];

            // Last 6 months data
            for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
                const dateBase = new Date();
                dateBase.setMonth(dateBase.getMonth() - monthOffset);

                for (let i = 0; i < 15; i++) {
                    const txDate = new Date(dateBase);
                    txDate.setDate(Math.floor(Math.random() * 26) + 1);
                    const type = types[Math.floor(Math.random() * types.length)];
                    const amount = Math.floor(Math.random() * 80000) + 5000;
                    sampleTransactions.push({
                        transactionId: `TXN${Date.now() - monthOffset * 1000000000 - i * 10000}`,
                        accountNumber: `NB100293847${(i % 8) + 1}`,
                        customerName: names[i % names.length],
                        type,
                        amount,
                        currency: 'BDT',
                        status: i % 10 === 0 ? 'Pending' : (i % 15 === 0 ? 'Failed' : 'Completed'),
                        reference: `${type} settlement #${1000 + i}`,
                        createdAt: txDate,
                    });
                }
            }
            await db.collection('transactions').insertMany(sampleTransactions);
        }

        // 3. Loans collection
        const existingLoans = await db.collection('loans').countDocuments();
        if (existingLoans < 10) {
            console.log('Seeding loans...');
            const sampleLoans = [
                { loanId: 'LN-2026-001', customerName: 'Alice Customer', amount: 500000, purpose: 'Home Renovation', status: 'Pending', riskRating: 'Low', createdAt: new Date(Date.now() - 2 * 86400000) },
                { loanId: 'LN-2026-002', customerName: 'Apex Trade Corp', amount: 3500000, purpose: 'Working Capital', status: 'Under Review', riskRating: 'Medium', createdAt: new Date(Date.now() - 3 * 86400000) },
                { loanId: 'LN-2026-003', customerName: 'Rahim Chowdhury', amount: 1200000, purpose: 'Car Loan', status: 'Approved', riskRating: 'Low', createdAt: new Date(Date.now() - 7 * 86400000) },
                { loanId: 'LN-2026-004', customerName: 'Dhaka Logistics', amount: 7500000, purpose: 'Fleet Expansion', status: 'Active', riskRating: 'Low', createdAt: new Date(Date.now() - 14 * 86400000) },
                { loanId: 'LN-2026-005', customerName: 'Karim Ullah', amount: 300000, purpose: 'Personal Expense', status: 'Rejected', riskRating: 'High', createdAt: new Date(Date.now() - 20 * 86400000) },
                { loanId: 'LN-2026-006', customerName: 'Farhana Ahmed', amount: 800000, purpose: 'Education Loan', status: 'Completed', riskRating: 'Low', createdAt: new Date(Date.now() - 60 * 86400000) },
                { loanId: 'LN-2026-007', customerName: 'Sultana Begum', amount: 450000, purpose: 'SME Microloan', status: 'Pending', riskRating: 'Low', createdAt: new Date(Date.now() - 1 * 86400000) },
                { loanId: 'LN-2026-008', customerName: 'Tanvir Hasan', amount: 1500000, purpose: 'Business Asset', status: 'Under Review', riskRating: 'Medium', createdAt: new Date(Date.now() - 4 * 86400000) },
            ];
            await db.collection('loans').insertMany(sampleLoans);
        }

        // 4. Pending Approvals & Requests
        const existingApprovals = await db.collection('bankingRequests').countDocuments();
        if (existingApprovals < 5) {
            console.log('Seeding pending banking requests...');
            const sampleRequests = [
                { requestId: 'REQ-01', category: 'Deposit', amount: 250000, customerName: 'Alice Customer', status: 'Pending', priority: 'Normal', createdAt: new Date(Date.now() - 3600000 * 4) },
                { requestId: 'REQ-02', category: 'Withdrawal', amount: 500000, customerName: 'Rahim Chowdhury', status: 'Pending', priority: 'High', createdAt: new Date(Date.now() - 3600000 * 7) },
                { requestId: 'REQ-03', category: 'Deposit', amount: 150000, customerName: 'Karim Ullah', status: 'Pending', priority: 'Normal', createdAt: new Date(Date.now() - 3600000 * 12) },
                { requestId: 'REQ-04', category: 'Suspicious Activity', amount: 1200000, customerName: 'Anonymous Transfer', status: 'Flagged', priority: 'Critical', createdAt: new Date(Date.now() - 3600000 * 2) },
                { requestId: 'REQ-05', category: 'Withdrawal', amount: 350000, customerName: 'Dhaka Logistics', status: 'Pending', priority: 'High', createdAt: new Date(Date.now() - 3600000 * 9) },
            ];
            await db.collection('bankingRequests').insertMany(sampleRequests);
        }

        // 5. System Activity & Audit Logs
        const existingLogs = await db.collection('auditLogs').countDocuments();
        if (existingLogs < 5) {
            console.log('Seeding audit logs...');
            const sampleLogs = [
                { action: 'LOAN_APPLICATION_REVIEW', actor: 'System Admin', event: 'Approved vehicle loan application LN-2026-003', recordRef: 'LN-2026-003', severity: 'Info', createdAt: new Date(Date.now() - 1000 * 60 * 15) },
                { action: 'CUSTOMER_REGISTERED', actor: 'Bank Staff Officer', event: 'Registered new customer Farhana Ahmed and opened Savings account', recordRef: 'NB1002938477', severity: 'Info', createdAt: new Date(Date.now() - 1000 * 60 * 45) },
                { action: 'SUSPICIOUS_TXN_FLAGGED', actor: 'Automated Fraud Monitor', event: 'Flagged rapid high-volume transfer request REQ-04 for manual admin audit', recordRef: 'REQ-04', severity: 'Warning', createdAt: new Date(Date.now() - 1000 * 60 * 120) },
                { action: 'ACCOUNT_PROVISIONED', actor: 'System Admin', event: 'Provisioned enterprise business account for Bengal Tech Solutions', recordRef: 'NB1002938478', severity: 'Info', createdAt: new Date(Date.now() - 1000 * 60 * 240) },
                { action: 'USER_SECURITY_CHANGE', actor: 'Alice Customer', event: 'Successfully configured cryptographic transaction PIN', recordRef: 'SEC-PIN', severity: 'Security', createdAt: new Date(Date.now() - 1000 * 60 * 360) },
            ];
            await db.collection('auditLogs').insertMany(sampleLogs);
        }

        console.log('Banking data seeded successfully!');
        await client.close();
        process.exit(0);
    } catch (err) {
        console.error('Error seeding banking data:', err);
        process.exit(1);
    }
}

seedBankingData();
