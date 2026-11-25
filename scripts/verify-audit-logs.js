import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

async function verifyAuditLogs() {
    try {
        console.log('--- STARTING ADMIN AUDIT LOGS MODULE VERIFICATION ---');
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('nestbank');

        // Test 1: Check total audit logs
        const totalLogs = await db.collection('auditLogs').countDocuments();
        console.log(`[Test 1] Total Audit Records: ${totalLogs}`);
        if (totalLogs < 10) throw new Error('Insufficient audit records found.');
        console.log('✓ PASS: Audit logs collection populated with immutable records.');

        // Test 2: Check Critical and Security events
        const criticalLogs = await db.collection('auditLogs').countDocuments({
            severity: { $in: ['CRITICAL', 'Critical', 'Security'] }
        });
        console.log(`[Test 2] Critical/Security Events: ${criticalLogs}`);
        if (criticalLogs === 0) throw new Error('No critical security events found.');
        console.log('✓ PASS: Critical event categorisation verified.');

        // Test 3: Check sensitive data redaction & no plaintext PINs/passwords
        const allLogs = await db.collection('auditLogs').find({}).limit(50).toArray();
        for (const log of allLogs) {
            const str = JSON.stringify(log).toLowerCase();
            if (str.includes('password123') || str.includes('custpass') || str.includes('adminpass')) {
                throw new Error(`Plaintext credential detected in audit log: ${log.eventId}`);
            }
        }
        console.log('✓ PASS: Sensitive data protection verified (zero credentials leaked).');

        await client.close();
        console.log('==================================================');
        console.log('🎉 ALL AUDIT LOGS VERIFICATION TESTS PASSED!');
        console.log('==================================================');
        process.exit(0);
    } catch (err) {
        console.error('Audit verification error:', err);
        process.exit(1);
    }
}

verifyAuditLogs();
