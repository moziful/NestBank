import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

async function verifyApprovals() {
    try {
        console.log('--- STARTING ADMIN APPROVALS VERIFICATION ---');
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('nestbank');

        // Check pending bankingRequests
        const deposits = await db.collection('bankingRequests').countDocuments({ type: 'Deposit', status: 'Pending' });
        const withdrawals = await db.collection('bankingRequests').countDocuments({ type: 'Withdrawal', status: 'Pending' });
        console.log(`[Test 1] Pending Deposits: ${deposits}, Pending Withdrawals: ${withdrawals}`);
        if (deposits === 0 || withdrawals === 0) {
            throw new Error('Missing pending deposit or withdrawal test requests.');
        }
        console.log('✓ PASS: Pending banking requests ready for decision workflow.');

        // Check loans
        const loans = await db.collection('loans').countDocuments({ status: { $in: ['Pending', 'Under Review'] } });
        console.log(`[Test 2] Pending/Under Review Loans: ${loans}`);
        if (loans === 0) {
            throw new Error('Missing pending loan applications.');
        }
        console.log('✓ PASS: Credit underwriting applications populated.');

        await client.close();
        console.log('==================================================');
        console.log('🎉 ADMIN APPROVALS VERIFICATION TESTS PASSED!');
        console.log('==================================================');
        process.exit(0);
    } catch (err) {
        console.error('Approvals verification error:', err);
        process.exit(1);
    }
}

verifyApprovals();
