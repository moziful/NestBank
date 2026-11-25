import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

async function seedAuditLogs() {
    try {
        console.log('Connecting to MongoDB for auditLogs enrichment...');
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('nestbank');

        const now = new Date();
        const baseTime = now.getTime();

        const seedEvents = [
            {
                eventId: 'EVT-20261125-000124',
                actorId: 'ADM-1001',
                actorName: 'MD Administrator',
                actorRole: 'ADMIN',
                action: 'CUSTOMER_BLOCKED',
                category: 'CUSTOMER',
                targetType: 'Customer',
                targetId: 'CUS-1003',
                description: 'Customer blocked under Anti-Money Laundering (AML) suspicious structuring protocol.',
                severity: 'CRITICAL',
                outcome: 'SUCCESS',
                changes: {
                    before: { status: 'Active', isRestricted: false },
                    after: { status: 'Blocked', isRestricted: true }
                },
                metadata: {
                    ipAddress: '192.168.10.45',
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NestBank Secure Admin',
                    requestId: 'REQ-AML-991',
                    correlationId: 'CORR-10024'
                },
                createdAt: new Date(baseTime - 3600000 * 2)
            },
            {
                eventId: 'EVT-20261125-000125',
                actorId: 'STF-1001',
                actorName: 'Rahim Ahmed',
                actorRole: 'BANK_STAFF',
                action: 'DEPOSIT_APPROVED',
                category: 'APPROVAL',
                targetType: 'Request',
                targetId: 'DEP-20261125-001',
                description: 'Approved counter deposit request for customer Rahim Ahmed (৳15,000).',
                severity: 'WARNING',
                outcome: 'SUCCESS',
                changes: {
                    before: { balance: 42000, requestStatus: 'Pending' },
                    after: { balance: 57000, requestStatus: 'Approved' }
                },
                metadata: {
                    ipAddress: '192.168.10.82',
                    userAgent: 'Mozilla/5.0 Staff Terminal Branch-01',
                    requestId: 'DEP-20261125-001'
                },
                createdAt: new Date(baseTime - 3600000 * 3)
            },
            {
                eventId: 'EVT-20261125-000126',
                actorId: 'ANONYMOUS',
                actorName: 'Unknown IP',
                actorRole: 'SYSTEM',
                action: 'LOGIN_FAILED',
                category: 'AUTHENTICATION',
                targetType: 'Authentication',
                targetId: 'admin_portal',
                description: 'Failed login attempt with invalid credentials (IP throttled after 5 attempts).',
                severity: 'WARNING',
                outcome: 'FAILED',
                metadata: {
                    ipAddress: '203.112.54.12',
                    userAgent: 'curl/7.88.1'
                },
                createdAt: new Date(baseTime - 3600000 * 4)
            },
            {
                eventId: 'EVT-20261125-000127',
                actorId: 'ADM-1001',
                actorName: 'MD Administrator',
                actorRole: 'ADMIN',
                action: 'ACCOUNT_FROZEN',
                category: 'ACCOUNT',
                targetType: 'Account',
                targetId: 'NB1002938474',
                description: 'Temporarily froze account NB1002938474 following unusual velocity alert.',
                severity: 'CRITICAL',
                outcome: 'SUCCESS',
                changes: {
                    before: { status: 'Active' },
                    after: { status: 'Frozen' }
                },
                metadata: {
                    ipAddress: '192.168.10.45',
                    userAgent: 'NestBank Admin Console'
                },
                createdAt: new Date(baseTime - 3600000 * 5)
            },
            {
                eventId: 'EVT-20261125-000128',
                actorId: 'CUS-1001',
                actorName: 'Alice Customer',
                actorRole: 'CUSTOMER',
                action: 'PIN_UPDATED',
                category: 'SECURITY',
                targetType: 'User',
                targetId: 'CUS-1001',
                description: 'Customer updated 4-digit transaction authorization PIN.',
                severity: 'INFO',
                outcome: 'SUCCESS',
                changes: {
                    before: { pinSet: true },
                    after: { pinSet: true }
                },
                metadata: {
                    ipAddress: '103.22.18.5',
                    userAgent: 'Mobile Web Banking'
                },
                createdAt: new Date(baseTime - 3600000 * 8)
            },
            {
                eventId: 'EVT-20261125-000129',
                actorId: 'SYSTEM',
                actorName: 'Automated Job Engine',
                actorRole: 'SYSTEM',
                action: 'LOAN_REVIEW_REMINDER',
                category: 'SYSTEM',
                targetType: 'Loan',
                targetId: 'LN-2026-002',
                description: 'Automated notification sent to Admin queue regarding pending loan review.',
                severity: 'INFO',
                outcome: 'SUCCESS',
                createdAt: new Date(baseTime - 3600000 * 12)
            },
            {
                eventId: 'EVT-20261125-000130',
                actorId: 'STF-1002',
                actorName: 'Nusrat Jahan',
                actorRole: 'BANK_STAFF',
                action: 'CUSTOMER_CREATED',
                category: 'CUSTOMER',
                targetType: 'Customer',
                targetId: 'CUS-1005',
                description: 'Enrolled new customer Tariqul Islam via assisted KYC desk.',
                severity: 'INFO',
                outcome: 'SUCCESS',
                createdAt: new Date(baseTime - 86400000)
            },
            {
                eventId: 'EVT-20261125-000131',
                actorId: 'ANONYMOUS',
                actorName: 'Untrusted Caller',
                actorRole: 'CUSTOMER',
                action: 'UNAUTHORIZED_ACCESS_DENIED',
                category: 'SECURITY',
                targetType: 'API',
                targetId: '/api/admin/staff',
                description: 'Cross-role boundary enforcement: Customer session attempted unauthorized access to admin staff endpoint.',
                severity: 'CRITICAL',
                outcome: 'DENIED',
                metadata: {
                    ipAddress: '103.22.18.5',
                    userAgent: 'PostmanRuntime/7.32'
                },
                createdAt: new Date(baseTime - 86400000 * 2)
            }
        ];

        for (const evt of seedEvents) {
            await db.collection('auditLogs').updateOne(
                { eventId: evt.eventId },
                { $set: evt },
                { upsert: true }
            );
        }

        // Add 20 historical events across the last 30 days
        for (let i = 1; i <= 20; i++) {
            const eventId = `EVT-202611${(24 - (i % 20)).toString().padStart(2, '0')}-${(500 + i).toString()}`;
            const date = new Date(baseTime - (i * 86400000 * 1.3));
            await db.collection('auditLogs').updateOne(
                { eventId },
                {
                    $set: {
                        eventId,
                        actorId: i % 2 === 0 ? 'ADM-1001' : 'STF-1001',
                        actorName: i % 2 === 0 ? 'MD Administrator' : 'Staff Officer',
                        actorRole: i % 2 === 0 ? 'ADMIN' : 'BANK_STAFF',
                        action: i % 3 === 0 ? 'LIMITS_UPDATED' : (i % 2 === 0 ? 'PASSWORD_RESET' : 'TRANSACTION_SETTLED'),
                        category: i % 3 === 0 ? 'ACCOUNT' : (i % 2 === 0 ? 'AUTHENTICATION' : 'TRANSACTION'),
                        targetType: 'Account',
                        targetId: `ACC-100${i}`,
                        description: `Operational event log record #${i}`,
                        severity: i === 7 ? 'CRITICAL' : (i % 4 === 0 ? 'WARNING' : 'INFO'),
                        outcome: i === 11 ? 'FAILED' : 'SUCCESS',
                        createdAt: date
                    }
                },
                { upsert: true }
            );
        }

        console.log('Seeded comprehensive audit events.');
        await client.close();
        process.exit(0);
    } catch (err) {
        console.error('Seed audit logs error:', err);
        process.exit(1);
    }
}

seedAuditLogs();
