import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

async function verifySettings() {
    try {
        console.log('--- STARTING BANKING SETTINGS VERIFICATION ---');
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('nestbank');

        const active = await db.collection('bankSettings').findOne({ _id: 'active_config' });
        if (!active) throw new Error('Active bankSettings document not found.');

        console.log(`[Test 1] Bank Name: ${active.general?.bankName}, Version: ${active.version}`);
        console.log(`[Test 2] Transfer Daily Limit: ৳${active.transactionRules?.transfer?.dailyLimit}`);
        console.log(`[Test 3] Loan Policies Configured: ${active.loanPolicies?.length}`);
        console.log(`[Test 4] Service Fee Types: ${Object.keys(active.fees || {}).join(', ')}`);

        if (!active.transactionRules?.transfer?.dailyLimit || !active.loanPolicies?.length) {
            throw new Error('Incomplete banking settings configuration.');
        }

        console.log('✓ PASS: Bank configuration structure validated.');
        await client.close();
        console.log('==================================================');
        console.log('🎉 ALL BANKING SETTINGS VERIFICATION TESTS PASSED!');
        console.log('==================================================');
        process.exit(0);
    } catch (err) {
        console.error('Settings verification failed:', err);
        process.exit(1);
    }
}

verifySettings();
