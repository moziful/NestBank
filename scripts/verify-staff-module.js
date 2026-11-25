import { getDb } from '../lib/mongodb.js';
import { getRolePermissions } from '../lib/permissions.js';

async function main() {
    console.log('--- Verifying Staff Module Architecture & Permissions ---');

    // 1. Verify permissions matrix
    const staffPerms = getRolePermissions('Bank Staff');
    const adminPerms = getRolePermissions('Admin');

    if (staffPerms.customers.canBlock === false && adminPerms.customers.canBlock === true) {
        console.log('✔ Staff cannot block customers, Admin can block customers');
    } else {
        console.error('✖ Permission mismatch for customer blocking');
        process.exit(1);
    }

    if (staffPerms.accounts.canFreeze === false && adminPerms.accounts.canFreeze === true) {
        console.log('✔ Staff cannot freeze accounts, Admin can freeze accounts');
    } else {
        console.error('✖ Permission mismatch for account freezing');
        process.exit(1);
    }

    if (staffPerms.loans.canDisburse === false && adminPerms.loans.canDisburse === true) {
        console.log('✔ Staff cannot disburse loans, Admin can disburse loans');
    } else {
        console.error('✖ Permission mismatch for loan disbursement');
        process.exit(1);
    }

    // 2. Verify database collections accessibility
    const db = await getDb();
    const customerCount = await db.collection('users').countDocuments({ role: 'Customer' });
    const accountCount = await db.collection('accounts').countDocuments();
    const loanCount = await db.collection('loans').countDocuments();
    const txCount = await db.collection('transactions').countDocuments();

    console.log(`✔ Database accessible: ${customerCount} customers, ${accountCount} accounts, ${loanCount} loans, ${txCount} transactions.`);

    console.log('✔ All Staff verification checks passed successfully.');
    process.exit(0);
}

main().catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
});
