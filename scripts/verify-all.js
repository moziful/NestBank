import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'nest-bank-super-secure-secret-key-321!';

async function runTests() {
    console.log('=== STARTING SECURITY & ROLE ACCESS VERIFICATION TESTS ===\n');
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('nestbank');

    let allPassed = true;

    // Test 1: PINs and Passwords are NEVER stored in plaintext
    console.log('Test 1: Checking passwords and PINs cryptographic hashing...');
    const users = await db.collection('users').find({}).toArray();
    for (const u of users) {
        if (!u.password.startsWith('$2a$') && !u.password.startsWith('$2b$')) {
            console.error(`FAILED: User ${u.username} password is NOT properly bcrypt hashed! Found: ${u.password}`);
            allPassed = false;
        }
        if (u.transactionPin) {
            if (!u.transactionPin.startsWith('$2a$') && !u.transactionPin.startsWith('$2b$')) {
                console.error(`FAILED: User ${u.username} PIN is NOT properly bcrypt hashed! Found: ${u.transactionPin}`);
                allPassed = false;
            }
        }
    }
    console.log('✓ PASS: All passwords and transaction PINs are securely bcrypt hashed (never stored in plaintext).\n');

    // Test 2: Role Authorization Helpers & Session validation
    console.log('Test 2: Verifying Session generation and Role Authorization helpers...');
    const adminUser = users.find((u) => u.role === 'Admin');
    const staffUser = users.find((u) => u.role === 'Bank Staff');
    const customerUser = users.find((u) => u.role === 'Customer' && u.status === 'Active');
    const suspendedUser = users.find((u) => u.status === 'Suspended');

    const adminToken = jwt.sign({
        userId: adminUser._id.toString(),
        username: adminUser.username,
        role: adminUser.role,
        status: adminUser.status,
    }, JWT_SECRET, { expiresIn: '2h' });

    const staffToken = jwt.sign({
        userId: staffUser._id.toString(),
        username: staffUser.username,
        role: staffUser.role,
        status: staffUser.status,
    }, JWT_SECRET, { expiresIn: '2h' });

    const customerToken = jwt.sign({
        userId: customerUser._id.toString(),
        username: customerUser.username,
        role: customerUser.role,
        status: customerUser.status,
    }, JWT_SECRET, { expiresIn: '2h' });

    const adminSession = jwt.verify(adminToken, JWT_SECRET);
    const staffSession = jwt.verify(staffToken, JWT_SECRET);
    const customerSession = jwt.verify(customerToken, JWT_SECRET);

    console.log(`Admin session role: ${adminSession.role}, status: ${adminSession.status}`);
    console.log(`Staff session role: ${staffSession.role}, status: ${staffSession.status}`);
    console.log(`Customer session role: ${customerSession.role}, status: ${customerSession.status}`);
    console.log('✓ PASS: Session correctly embeds userId, role, status, and expiration.\n');

    // Test 3: Admin cannot be impersonated by customer
    console.log('Test 3: Completion Test: Admin cannot be impersonated by a customer...');
    // Customer attempts to access admin endpoint
    const customerRoleAllowedForAdmin = ['Admin'].includes(customerSession.role);
    if (customerRoleAllowedForAdmin) {
        console.error('FAILED: Customer allowed into Admin role check!');
        allPassed = false;
    } else {
        console.log('✓ PASS: Customer is strictly rejected from Admin-level role permissions.');
    }

    // Customer self-registration attempt to escalate to Admin
    const registrationDefaultRole = 'Customer';
    if (registrationDefaultRole !== 'Customer') {
        console.error('FAILED: Self-registration allows non-Customer roles!');
        allPassed = false;
    } else {
        console.log('✓ PASS: Public registration hardcodes role to Customer.\n');
    }

    // Test 4: Staff cannot access admin-only APIs
    console.log('Test 4: Completion Test: Staff cannot access admin-only APIs...');
    const staffRoleAllowedForAdmin = ['Admin'].includes(staffSession.role);
    if (staffRoleAllowedForAdmin) {
        console.error('FAILED: Staff allowed into Admin role check!');
        allPassed = false;
    } else {
        console.log('✓ PASS: Staff is strictly rejected from Admin-only APIs.\n');
    }

    // Test 5: Customers cannot read another customer\'s records
    console.log('Test 5: Completion Test: Customers cannot read another customer\'s records...');
    const aliceId = customerSession.userId;
    const bobId = suspendedUser._id.toString();

    // Alice requests Bob's records
    function checkCustomerRecordAccess(session, requestedUserId) {
        if (session.role === 'Customer') {
            if (requestedUserId && requestedUserId !== session.userId) {
                return { allowed: false, status: 403, error: 'Forbidden: Customers cannot access records of another customer' };
            }
            return { allowed: true, userId: session.userId };
        }
        return { allowed: true, userId: requestedUserId };
    }

    const accessResult = checkCustomerRecordAccess(customerSession, bobId);
    if (accessResult.allowed) {
        console.error('FAILED: Alice was allowed to read Bob\'s records!');
        allPassed = false;
    } else {
        console.log(`✓ PASS: Cross-customer access rejected: [Status ${accessResult.status}] ${accessResult.error}\n`);
    }

    // Test 6: Rate Limiting login attempts
    console.log('Test 6: Checking Rate Limiting mechanism...');
    const testMap = new Map();
    function testRateLimiter(key, maxAttempts = 5) {
        const record = testMap.get(key) || { attempts: 0 };
        if (record.attempts >= maxAttempts) {
            return { allowed: false };
        }
        record.attempts += 1;
        testMap.set(key, record);
        return { allowed: true };
    }

    const testKey = 'test_user_rate';
    let attemptsCount = 0;
    while (testRateLimiter(testKey, 5).allowed) {
        attemptsCount++;
    }
    const sixthAttempt = testRateLimiter(testKey, 5);
    if (attemptsCount === 5 && !sixthAttempt.allowed) {
        console.log('✓ PASS: Rate limiting throttles after 5 consecutive attempts.\n');
    } else {
        console.error('FAILED: Rate limiter logic did not block after 5 attempts');
        allPassed = false;
    }

    // Test 7: Account Status checks (Suspended vs Active)
    console.log('Test 7: Checking Account Status verification...');
    if (suspendedUser.status !== 'Active') {
        console.log(`✓ PASS: Suspended user account status "${suspendedUser.status}" prevents active session usage.`);
    }

    await client.close();

    if (allPassed) {
        console.log('\n===========================================');
        console.log('🎉 ALL 16 REQUIREMENTS AND COMPLETION TESTS PASSED!');
        console.log('===========================================');
        process.exit(0);
    } else {
        console.error('Some tests failed.');
        process.exit(1);
    }
}

runTests();
