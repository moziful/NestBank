import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;

async function seedCustomerData() {
    try {
        console.log('Connecting to MongoDB to seed customer management data...');
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('nestbank');

        const salt = await bcrypt.genSalt(10);
        const defaultHash = await bcrypt.hash('CustPass123!', salt);
        const defaultPin = await bcrypt.hash('1234', salt);

        const customers = [
            {
                name: 'Arif Hossain',
                username: 'arif.hossain',
                email: 'arif@example.com',
                phone: '+880 1712 345678',
                customerId: 'CUS-1001',
                role: 'Customer',
                status: 'Active',
                password: defaultHash,
                transactionPin: defaultPin,
                hasTransactionPin: true,
                address: 'Rajshahi, Bangladesh',
                dateOfBirth: new Date('1992-05-14'),
                identityVerificationStatus: 'VERIFIED',
                createdAt: new Date('2024-01-12'),
                updatedAt: new Date(),
            },
            {
                name: 'Sadia Rahman',
                username: 'sadia.rahman',
                email: 'sadia@example.com',
                phone: '+880 1812 345678',
                customerId: 'CUS-1002',
                role: 'Customer',
                status: 'Active',
                password: defaultHash,
                transactionPin: defaultPin,
                hasTransactionPin: true,
                address: 'Dhanmondi, Dhaka, Bangladesh',
                dateOfBirth: new Date('1995-10-22'),
                identityVerificationStatus: 'VERIFIED',
                createdAt: new Date('2024-02-18'),
                updatedAt: new Date(),
            },
            {
                name: 'Tanvir Ahmed',
                username: 'tanvir.ahmed',
                email: 'tanvir@example.com',
                phone: '+880 1912 345678',
                customerId: 'CUS-1003',
                role: 'Customer',
                status: 'Blocked',
                blockReason: 'Suspicious rapid cross-border fund movements flagged by AML automated rule',
                password: defaultHash,
                transactionPin: defaultPin,
                hasTransactionPin: true,
                address: 'Agrabad, Chattogram, Bangladesh',
                dateOfBirth: new Date('1988-08-30'),
                identityVerificationStatus: 'REJECTED',
                createdAt: new Date('2024-03-05'),
                updatedAt: new Date(),
            },
            {
                name: 'Farzana Parvin',
                username: 'farzana.p',
                email: 'farzana@example.com',
                phone: '+880 1612 345678',
                customerId: 'CUS-1004',
                role: 'Customer',
                status: 'Active',
                password: defaultHash,
                transactionPin: defaultPin,
                hasTransactionPin: true,
                address: 'Uttara, Dhaka, Bangladesh',
                dateOfBirth: new Date('1998-12-05'),
                identityVerificationStatus: 'VERIFIED',
                createdAt: new Date('2024-04-10'),
                updatedAt: new Date(),
            },
            {
                name: 'Mehedi Hasan',
                username: 'mehedi.h',
                email: 'mehedi@example.com',
                phone: '+880 1512 345678',
                customerId: 'CUS-1005',
                role: 'Customer',
                status: 'Inactive',
                password: defaultHash,
                transactionPin: defaultPin,
                hasTransactionPin: true,
                address: 'Sylhet, Bangladesh',
                dateOfBirth: new Date('1990-03-19'),
                identityVerificationStatus: 'PENDING',
                createdAt: new Date('2024-05-15'),
                updatedAt: new Date(),
            },
        ];

        for (const cust of customers) {
            let user = await db.collection('users').findOne({ email: cust.email });
            let userId;
            if (!user) {
                const res = await db.collection('users').insertOne(cust);
                userId = res.insertedId.toString();
                console.log(`Created customer: ${cust.name} (${cust.customerId})`);
            } else {
                userId = user._id.toString();
                await db.collection('users').updateOne(
                    { _id: user._id },
                    {
                        $set: {
                            customerId: user.customerId || cust.customerId,
                            address: user.address || cust.address,
                            dateOfBirth: user.dateOfBirth || cust.dateOfBirth,
                            identityVerificationStatus: user.identityVerificationStatus || cust.identityVerificationStatus,
                            status: cust.status,
                            blockReason: cust.blockReason || user.blockReason,
                        }
                    }
                );
            }

            // Create bank accounts for customer if not existing
            const userAccounts = await db.collection('accounts').find({ userId }).toArray();
            if (!userAccounts.length) {
                const accountsToInsert = [
                    {
                        userId,
                        accountNumber: `NB${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                        accountType: 'Savings',
                        balance: cust.name === 'Tanvir Ahmed' ? 12000.00 : (cust.name === 'Sadia Rahman' ? 42500.00 : 85000.00),
                        currency: 'BDT',
                        status: cust.status === 'Blocked' ? 'Frozen' : 'Active',
                        createdAt: new Date(),
                    },
                ];

                if (cust.name === 'Arif Hossain' || cust.name === 'Tanvir Ahmed') {
                    accountsToInsert.push({
                        userId,
                        accountNumber: `NB${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                        accountType: 'Current',
                        balance: cust.name === 'Arif Hossain' ? 35000.00 : 5000.00,
                        currency: 'BDT',
                        status: cust.status === 'Blocked' ? 'Frozen' : 'Active',
                        createdAt: new Date(),
                    });
                }

                await db.collection('accounts').insertMany(accountsToInsert);
                console.log(`Created ${accountsToInsert.length} accounts for ${cust.name}`);

                // Also seed transactions for this customer
                for (const acc of accountsToInsert) {
                    await db.collection('transactions').insertMany([
                        {
                            transactionId: `TXN${Date.now() - Math.floor(Math.random() * 100000000)}`,
                            userId,
                            accountNumber: acc.accountNumber,
                            customerName: cust.name,
                            type: 'Deposit',
                            amount: 50000.00,
                            currency: 'BDT',
                            status: 'Completed',
                            reference: 'Initial branch cash deposit',
                            createdAt: new Date(Date.now() - 86400000 * 20),
                        },
                        {
                            transactionId: `TXN${Date.now() - Math.floor(Math.random() * 100000000)}`,
                            userId,
                            accountNumber: acc.accountNumber,
                            customerName: cust.name,
                            type: 'Withdrawal',
                            amount: 15000.00,
                            currency: 'BDT',
                            status: 'Completed',
                            reference: 'ATM cash withdrawal',
                            createdAt: new Date(Date.now() - 86400000 * 10),
                        },
                    ]);
                }
            }

            // Seed loan records if needed
            const existingLoans = await db.collection('loans').find({ customerName: cust.name }).toArray();
            if (!existingLoans.length) {
                await db.collection('loans').insertOne({
                    loanId: `LN-${cust.customerId}-01`,
                    userId,
                    customerName: cust.name,
                    accountNumber: `NB-${cust.customerId}`,
                    loanType: 'Personal / SME Loan',
                    amount: 250000,
                    approvedAmount: 200000,
                    outstandingAmount: 185000,
                    purpose: 'Business expansion & inventory purchase',
                    status: cust.status === 'Blocked' ? 'Rejected' : 'Active',
                    riskRating: cust.status === 'Blocked' ? 'High' : 'Low',
                    createdAt: new Date(Date.now() - 86400000 * 45),
                });
            }
        }

        // Seed audit logs
        const customerActivities = [
            { actor: 'System Admin', action: 'CUSTOMER_CREATED', event: 'Registered new customer Arif Hossain (CUS-1001)', recordRef: 'CUS-1001', severity: 'Info', createdAt: new Date(Date.now() - 86400000 * 3) },
            { actor: 'Arif Hossain', action: 'NEW_SAVINGS_ACCOUNT', event: 'New savings account opened with initial deposit', recordRef: 'CUS-1001', severity: 'Info', createdAt: new Date(Date.now() - 3600000 * 4) },
            { actor: 'Sadia Rahman', action: 'PROFILE_UPDATED', event: 'Customer updated residential contact information', recordRef: 'CUS-1002', severity: 'Info', createdAt: new Date(Date.now() - 3600000 * 6) },
            { actor: 'Automated AML Monitor', action: 'SUSPICIOUS_FLAGGED', event: 'Account flagged for review: rapid consecutive transactions', recordRef: 'CUS-1003', severity: 'Warning', createdAt: new Date(Date.now() - 86400000 * 1) },
            { actor: 'System Admin', action: 'CUSTOMER_BLOCKED', event: 'Blocked customer Tanvir Ahmed due to high-risk transactions', recordRef: 'CUS-1003', severity: 'Security', createdAt: new Date(Date.now() - 3600000 * 12) },
        ];

        for (const act of customerActivities) {
            await db.collection('auditLogs').insertOne(act);
        }

        console.log('Customer data seeded successfully!');
        await client.close();
        process.exit(0);
    } catch (err) {
        console.error('Error seeding customer data:', err);
        process.exit(1);
    }
}

seedCustomerData();
