import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;

async function seedAccountsData() {
    try {
        console.log('Connecting to MongoDB to update and seed bank accounts...');
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('nestbank');

        // Update existing accounts with default limits and held amounts if missing
        const accounts = await db.collection('accounts').find({}).toArray();

        for (const acc of accounts) {
            const customer = await db.collection('users').findOne({ _id: new ObjectId(acc.userId) });
            const balance = typeof acc.balance === 'number' ? acc.balance : 50000;
            const heldAmount = acc.heldAmount !== undefined ? acc.heldAmount : (acc.accountType === 'Business' ? 10000 : 2500);

            const limits = acc.limits || {
                maxSingleTransfer: acc.accountType === 'Business' ? 250000 : 50000,
                dailyTransferLimit: acc.accountType === 'Business' ? 1000000 : 100000,
                dailyWithdrawalLimit: acc.accountType === 'Business' ? 200000 : 40000,
                minimumBalance: acc.accountType === 'Business' ? 5000 : 500,
                dailyTransactionCount: acc.accountType === 'Business' ? 50 : 20,
            };

            await db.collection('accounts').updateOne(
                { _id: acc._id },
                {
                    $set: {
                        customerName: customer ? customer.name : (acc.customerName || 'Registered Customer'),
                        customerId: customer ? (customer.customerId || `CUS-${customer._id.toString().slice(-4)}`) : (acc.customerId || 'CUS-1001'),
                        currency: 'BDT',
                        ledgerBalance: balance,
                        balance: balance,
                        heldAmount: heldAmount,
                        status: acc.status || 'Active', // Active, Frozen, Closed, Pending Verification
                        limits,
                        branch: acc.branch || 'Principal Corporate Branch, Dhaka',
                        updatedAt: new Date(),
                    }
                }
            );
        }

        console.log(`Updated ${accounts.length} bank accounts with transaction limits, customer references, and held balances.`);

        // Add account audit logs
        const sampleAccountLogs = [
            { actor: 'System Admin', action: 'ACCOUNT_LIMITS_UPDATED', event: 'Updated daily transfer limit for account NB1002938473 to ৳1,000,000', recordRef: 'NB1002938473', severity: 'Info', createdAt: new Date(Date.now() - 3600000 * 5) },
            { actor: 'System Admin', action: 'ACCOUNT_FROZEN', event: 'Temporarily froze account NB1002938474 due to suspicious debit spike', recordRef: 'NB1002938474', severity: 'Security', createdAt: new Date(Date.now() - 3600000 * 18) },
            { actor: 'Bank Staff Officer', action: 'ACCOUNT_CREATED', event: 'Opened new Savings account for Arif Hossain (CUS-1001)', recordRef: 'NB1002938471', severity: 'Info', createdAt: new Date(Date.now() - 86400000 * 2) },
        ];

        for (const log of sampleAccountLogs) {
            await db.collection('auditLogs').insertOne(log);
        }

        console.log('Account seeding completed successfully!');
        await client.close();
        process.exit(0);
    } catch (err) {
        console.error('Error seeding account data:', err);
        process.exit(1);
    }
}

seedAccountsData();
