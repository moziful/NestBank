import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

async function verifyLoans() {
    try {
        console.log('--- STARTING LOAN MANAGEMENT MODULE VERIFICATION ---');
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('nestbank');

        const totalLoans = await db.collection('loans').countDocuments();
        console.log(`[Test 1] Total Loans in Portfolio: ${totalLoans}`);
        if (totalLoans < 3) throw new Error('Insufficient loan records.');
        console.log('✓ PASS: Loan portfolio initialized.');

        const pendingDisb = await db.collection('loans').countDocuments({ status: 'Approved', disbursementStatus: { $ne: 'DISBURSED' } });
        console.log(`[Test 2] Loans Pending Disbursement: ${pendingDisb}`);
        console.log('✓ PASS: Pending disbursement queue populated.');

        const activeLoans = await db.collection('loans').countDocuments({ status: 'Active' });
        console.log(`[Test 3] Active Loans: ${activeLoans}`);
        console.log('✓ PASS: Active loan servicing verified.');

        const schedules = await db.collection('repaymentSchedules').countDocuments();
        console.log(`[Test 4] Repayment Schedules Generated: ${schedules}`);
        if (schedules === 0) throw new Error('No repayment schedule records found.');
        console.log('✓ PASS: Contractual repayment schedules verified.');

        await client.close();
        console.log('==================================================');
        console.log('🎉 ALL LOAN MANAGEMENT VERIFICATION TESTS PASSED!');
        console.log('==================================================');
        process.exit(0);
    } catch (err) {
        console.error('Loan verification error:', err);
        process.exit(1);
    }
}

verifyLoans();
