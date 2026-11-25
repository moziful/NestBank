import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;

async function seedTransactions() {
    try {
        console.log('Connecting to MongoDB for transactions and ledger enrichment...');
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('nestbank');

        const accounts = await db.collection('accounts').find({}).toArray();
        const users = await db.collection('users').find({ role: 'Customer' }).toArray();

        if (accounts.length === 0 || users.length === 0) {
            console.error('No accounts or users found. Seed accounts first!');
            await client.close();
            return;
        }

        console.log(`Found ${accounts.length} accounts and ${users.length} customers.`);

        // Build 40+ realistic canonical transactions with ledger entries
        const txDocs = [];
        const ledgerDocs = [];

        const types = ['Transfer', 'Deposit', 'Withdrawal', 'Loan Disbursement', 'Loan Repayment'];
        const riskStatuses = ['NORMAL', 'NORMAL', 'NORMAL', 'FLAGGED', 'NORMAL', 'UNDER_REVIEW', 'CLEARED'];
        const statuses = ['Successful', 'Successful', 'Successful', 'Pending', 'Failed', 'Successful'];

        const riskRules = [
            'Unusually large transfer compared with normal history',
            'Multiple transfers initiated within 10 minutes',
            'Transaction attempt against frozen account',
            'Daily transfer limit threshold reached',
            'Rapid velocity withdrawal alert'
        ];

        const baseTime = Date.now();

        // 1. Explicit flagged transactions for the assessment scenarios
        const flaggedTx1Id = 'TXN-20261125-004';
        const flaggedTx2Id = 'TXN-20261125-018';
        const flaggedTx3Id = 'TXN-20261125-029';

        const sourceAcc = accounts[0];
        const destAcc = accounts[1] || accounts[0];

        const explicitTransactions = [
            {
                transactionId: flaggedTx1Id,
                type: 'Transfer',
                sourceAccountId: sourceAcc._id,
                sourceAccountNumber: sourceAcc.accountNumber,
                destinationAccountId: destAcc._id,
                destinationAccountNumber: destAcc.accountNumber,
                customerName: sourceAcc.customerName || 'Sadia Islam',
                customerId: sourceAcc.customerId || 'CUS-1002',
                amount: 450000,
                fee: 0,
                currency: 'BDT',
                status: 'Successful',
                riskStatus: 'FLAGGED',
                initiatedByType: 'Customer',
                description: 'High volume inter-bank business transfer',
                reference: 'REF-TX-450000',
                riskFlags: [
                    {
                        flaggedAt: new Date(baseTime - 3600000 * 2),
                        flaggedBy: 'Automated Rule Engine',
                        flaggedByRole: 'System',
                        reason: 'Unusually large transfer exceeding standard threshold (> ৳200,000)',
                        rule: 'High Value Velocity Rule',
                        status: 'FLAGGED'
                    }
                ],
                investigationNotes: [
                    {
                        note: 'Account manager contacted customer to confirm commercial purpose.',
                        author: 'admin',
                        role: 'Admin',
                        createdAt: new Date(baseTime - 3600000)
                    }
                ],
                createdAt: new Date(baseTime - 3600000 * 3),
                completedAt: new Date(baseTime - 3600000 * 3)
            },
            {
                transactionId: flaggedTx2Id,
                type: 'Transfer',
                sourceAccountId: destAcc._id,
                sourceAccountNumber: destAcc.accountNumber,
                destinationAccountId: sourceAcc._id,
                destinationAccountNumber: sourceAcc.accountNumber,
                customerName: destAcc.customerName || 'Arif Hossain',
                customerId: destAcc.customerId || 'CUS-1001',
                amount: 85000,
                fee: 15,
                currency: 'BDT',
                status: 'Pending',
                riskStatus: 'UNDER_REVIEW',
                initiatedByType: 'Customer',
                description: 'Urgent weekend supplier transfer',
                reference: 'REF-TX-85000',
                riskFlags: [
                    {
                        flaggedAt: new Date(baseTime - 3600000 * 6),
                        flaggedBy: 'Staff Officer Rahim',
                        flaggedByRole: 'Bank Staff',
                        reason: 'Multiple rapid transfer attempts in under 5 minutes',
                        rule: 'Rapid Velocity Rule',
                        status: 'UNDER_REVIEW'
                    }
                ],
                investigationNotes: [],
                createdAt: new Date(baseTime - 3600000 * 7)
            },
            {
                transactionId: flaggedTx3Id,
                type: 'Withdrawal',
                sourceAccountId: sourceAcc._id,
                sourceAccountNumber: sourceAcc.accountNumber,
                accountNumber: sourceAcc.accountNumber,
                customerName: sourceAcc.customerName || 'Sadia Islam',
                customerId: sourceAcc.customerId || 'CUS-1002',
                amount: 150000,
                fee: 25,
                currency: 'BDT',
                status: 'Successful',
                riskStatus: 'CLEARED',
                initiatedByType: 'Customer',
                description: 'ATM / POS cash bulk withdrawal',
                reference: 'REF-TX-150000',
                riskFlags: [
                    {
                        flaggedAt: new Date(baseTime - 86400000 * 2),
                        flaggedBy: 'Automated Rule Engine',
                        flaggedByRole: 'System',
                        reason: 'Daily withdrawal ceiling exceeded',
                        rule: 'Ceiling Exceeded',
                        status: 'CLEARED'
                    }
                ],
                clearedDetails: {
                    clearedAt: new Date(baseTime - 86400000 * 1),
                    clearedBy: 'admin',
                    resolutionNote: 'Customer verified in person with National ID at Dhanmondi Branch.'
                },
                investigationNotes: [
                    {
                        note: 'Risk Flag Cleared: Customer verified in person with National ID at Dhanmondi Branch.',
                        author: 'admin',
                        role: 'Admin',
                        createdAt: new Date(baseTime - 86400000 * 1)
                    }
                ],
                createdAt: new Date(baseTime - 86400000 * 2)
            }
        ];

        txDocs.push(...explicitTransactions);

        // Generate 35 diverse transactions spanning the last 30 days
        for (let i = 1; i <= 35; i++) {
            const accFrom = accounts[i % accounts.length];
            const accTo = accounts[(i + 1) % accounts.length];
            const type = types[i % types.length];
            const status = statuses[i % statuses.length];
            const risk = (i === 5 || i === 12) ? 'FLAGGED' : riskStatuses[i % riskStatuses.length];
            const daysAgo = Math.floor(i / 1.5);
            const txDate = new Date(baseTime - daysAgo * 86400000 - (i * 3700000));
            const txId = `TXN-202611${(25 - (i % 20)).toString().padStart(2, '0')}-${(100 + i).toString()}`;
            const amount = 1000 * (i % 2 === 0 ? 5 : 12) + (i * 350);

            const txDoc = {
                transactionId: txId,
                type,
                sourceAccountId: accFrom._id,
                sourceAccountNumber: accFrom.accountNumber,
                destinationAccountId: type === 'Transfer' ? accTo._id : undefined,
                destinationAccountNumber: type === 'Transfer' ? accTo.accountNumber : undefined,
                accountNumber: accFrom.accountNumber,
                customerName: accFrom.customerName || 'Valued Customer',
                customerId: accFrom.customerId || `CUS-${1000 + (i % 10)}`,
                amount,
                fee: type === 'Transfer' ? 10 : 0,
                currency: 'BDT',
                status,
                riskStatus: risk,
                initiatedByType: i % 7 === 0 ? 'Bank Staff' : (i % 11 === 0 ? 'Admin' : 'Customer'),
                description: `${type} settlement for ${accFrom.customerName}`,
                reference: `REF-${txId}`,
                riskFlags: risk === 'FLAGGED' ? [
                    {
                        flaggedAt: txDate,
                        flaggedBy: 'Automated Rule Engine',
                        flaggedByRole: 'System',
                        reason: riskRules[i % riskRules.length],
                        rule: riskRules[i % riskRules.length],
                        status: 'FLAGGED'
                    }
                ] : [],
                investigationNotes: [],
                createdAt: txDate,
                completedAt: status === 'Successful' ? txDate : undefined,
                failureReason: status === 'Failed' ? 'Insufficient available balance or daily limit hit.' : undefined
            };

            txDocs.push(txDoc);

            // Double-entry balanced ledger entries for successful transactions
            if (status === 'Successful') {
                if (type === 'Transfer') {
                    ledgerDocs.push({
                        ledgerId: `LED-${txId}-D`,
                        transactionId: txId,
                        accountId: accFrom._id,
                        accountNumber: accFrom.accountNumber,
                        customerName: accFrom.customerName,
                        entryType: 'DEBIT',
                        amount: amount + txDoc.fee,
                        currency: 'BDT',
                        description: `Transfer debit to ${accTo.accountNumber}`,
                        createdAt: txDate
                    });
                    ledgerDocs.push({
                        ledgerId: `LED-${txId}-C`,
                        transactionId: txId,
                        accountId: accTo._id,
                        accountNumber: accTo.accountNumber,
                        customerName: accTo.customerName,
                        entryType: 'CREDIT',
                        amount: amount,
                        currency: 'BDT',
                        description: `Transfer credit from ${accFrom.accountNumber}`,
                        createdAt: txDate
                    });
                } else if (type === 'Deposit') {
                    ledgerDocs.push({
                        ledgerId: `LED-${txId}-C`,
                        transactionId: txId,
                        accountId: accFrom._id,
                        accountNumber: accFrom.accountNumber,
                        customerName: accFrom.customerName,
                        entryType: 'CREDIT',
                        amount: amount,
                        currency: 'BDT',
                        description: `Cash deposit credited`,
                        createdAt: txDate
                    });
                } else if (type === 'Withdrawal') {
                    ledgerDocs.push({
                        ledgerId: `LED-${txId}-D`,
                        transactionId: txId,
                        accountId: accFrom._id,
                        accountNumber: accFrom.accountNumber,
                        customerName: accFrom.customerName,
                        entryType: 'DEBIT',
                        amount: amount + txDoc.fee,
                        currency: 'BDT',
                        description: `Cash withdrawal debited`,
                        createdAt: txDate
                    });
                }
            }
        }

        // Insert or update
        for (const doc of txDocs) {
            await db.collection('transactions').updateOne(
                { transactionId: doc.transactionId },
                { $set: doc },
                { upsert: true }
            );
        }

        if (ledgerDocs.length > 0) {
            for (const l of ledgerDocs) {
                await db.collection('ledgerEntries').updateOne(
                    { ledgerId: l.ledgerId },
                    { $set: l },
                    { upsert: true }
                );
            }
        }

        console.log(`Seeded ${txDocs.length} transactions and ${ledgerDocs.length} balanced ledger records.`);
        await client.close();
        process.exit(0);
    } catch (err) {
        console.error('Seed transactions error:', err);
        process.exit(1);
    }
}

seedTransactions();
