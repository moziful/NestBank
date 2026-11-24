import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

async function hashPin(pin) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(pin, salt);
}

async function seed() {
    try {
        console.log('Connecting to database with URI:', uri ? uri.substring(0, 30) + '...' : 'UNDEFINED');
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('nestbank');

        const adminPassword = await hashPassword('AdminPass123!');
        const staffPassword = await hashPassword('StaffPass123!');
        const customerPassword = await hashPassword('CustPass123!');
        const customerPin = await hashPin('1234');

        const users = [
            {
                name: 'System Admin',
                username: 'admin',
                email: 'admin@nestbank.com',
                password: adminPassword,
                role: 'Admin',
                status: 'Active',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Bank Staff Officer',
                username: 'staff',
                email: 'staff@nestbank.com',
                password: staffPassword,
                role: 'Bank Staff',
                status: 'Active',
                department: 'Customer Service',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Alice Customer',
                username: 'alice',
                email: 'alice@example.com',
                password: customerPassword,
                transactionPin: customerPin,
                hasTransactionPin: true,
                role: 'Customer',
                status: 'Active',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: 'Bob Customer',
                username: 'bob',
                email: 'bob@example.com',
                password: customerPassword,
                role: 'Customer',
                status: 'Suspended',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        for (const u of users) {
            const existing = await db.collection('users').findOne({ username: u.username });
            if (!existing) {
                const res = await db.collection('users').insertOne(u);
                if (u.role === 'Customer') {
                    await db.collection('accounts').insertOne({
                        userId: res.insertedId.toString(),
                        accountNumber: 'NB' + Math.floor(1000000000 + Math.random() * 9000000000),
                        accountType: 'Checking',
                        balance: 3250.75,
                        currency: 'USD',
                        status: 'Active',
                        createdAt: new Date(),
                    });
                }
                console.log(`Created user: ${u.username} (${u.role})`);
            } else {
                console.log(`User already exists: ${u.username}`);
            }
        }

        console.log('Seeding completed successfully!');
        await client.close();
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
