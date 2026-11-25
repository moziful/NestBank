import { NextResponse } from 'next/server';
import { getSession, hasRole, hashPassword, hashPin } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

// GET /api/admin/customers - list customers with server-side search, filtering, total balance & account counts
export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const search = (searchParams.get('search') || '').trim();
        const status = searchParams.get('status');
        const accountType = searchParams.get('accountType');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);

        const db = await getDb();
        const query = { role: 'Customer' };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { customerId: { $regex: search, $options: 'i' } },
            ];
        }

        if (status && status !== 'All') {
            query.status = status;
        }

        // If filtering by account type, find user IDs with that account type
        if (accountType && accountType !== 'All') {
            const matchingAccounts = await db.collection('accounts').find({ accountType }).toArray();
            const matchedUserIds = matchingAccounts.map((a) => a.userId);
            if (query._id) {
                // If already restricted
            } else {
                query.$or = (query.$or || []).length
                    ? [{ $and: [{ $or: query.$or }, { $expr: { $in: [{ $toString: '$_id' }, matchedUserIds] } }] }]
                    : [{ $expr: { $in: [{ $toString: '$_id' }, matchedUserIds] } }];
                delete query.$or;
                query.$expr = { $in: [{ $toString: '$_id' }, matchedUserIds] };
            }
        }

        const total = await db.collection('users').countDocuments(query);
        const customers = await db.collection('users')
            .find(query, { projection: { password: 0, transactionPin: 0 } })
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

        // Attach live account count and combined total balance for each customer
        const enrichedCustomers = await Promise.all(
            customers.map(async (cust) => {
                const accounts = await db.collection('accounts').find({ userId: cust._id.toString() }).toArray();
                const totalBalance = accounts.reduce((acc, a) => acc + (a.balance || 0), 0);
                return {
                    ...cust,
                    accountCount: accounts.length,
                    totalBalance,
                    accounts: accounts.map((a) => ({
                        accountNumber: a.accountNumber,
                        accountType: a.accountType,
                        balance: a.balance,
                        status: a.status,
                    })),
                };
            })
        );

        return NextResponse.json({
            success: true,
            customers: enrichedCustomers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        });
    } catch (error) {
        console.error('Fetch customers error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/customers - create new customer with initial account & audit log
export async function POST(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const {
            name,
            email,
            phone,
            password,
            pin,
            address,
            dateOfBirth,
            accountType = 'Savings',
            initialDeposit = 1000,
            status = 'Active',
        } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, message: 'Full name, email, and password are required.' },
                { status: 400 }
            );
        }

        const db = await getDb();
        const existing = await db.collection('users').findOne({ email: email.trim().toLowerCase() });
        if (existing) {
            return NextResponse.json(
                { success: false, message: 'Customer with this email already exists.' },
                { status: 409 }
            );
        }

        const count = await db.collection('users').countDocuments({ role: 'Customer' });
        const customerId = `CUS-${1000 + count + 1}`;

        const hashedPassword = await hashPassword(password);
        let hashedPin = null;
        if (pin) {
            hashedPin = await hashPin(pin);
        }

        const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

        const newCustomer = {
            name: name.trim(),
            username,
            email: email.trim().toLowerCase(),
            phone: phone || '',
            customerId,
            role: 'Customer',
            status, // Active, Inactive, Blocked
            password: hashedPassword,
            transactionPin: hashedPin,
            hasTransactionPin: !!hashedPin,
            address: address || '',
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            identityVerificationStatus: 'VERIFIED',
            createdBy: session.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection('users').insertOne(newCustomer);
        const userId = result.insertedId.toString();

        // Create opening bank account
        const newAccount = {
            userId,
            accountNumber: `NB${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            accountType,
            balance: Number(initialDeposit) || 0,
            currency: 'BDT',
            status: 'Active',
            createdAt: new Date(),
        };
        await db.collection('accounts').insertOne(newAccount);

        // Record opening transaction
        if (Number(initialDeposit) > 0) {
            await db.collection('transactions').insertOne({
                transactionId: `TXN${Date.now()}`,
                userId,
                accountNumber: newAccount.accountNumber,
                customerName: newCustomer.name,
                type: 'Deposit',
                amount: Number(initialDeposit),
                currency: 'BDT',
                status: 'Completed',
                reference: 'Account opening initial deposit',
                createdAt: new Date(),
            });
        }

        // Record in audit log
        await db.collection('auditLogs').insertOne({
            actorId: session.userId,
            actor: session.name || 'System Admin',
            action: 'CUSTOMER_CREATED',
            event: `Provisioned customer profile for ${newCustomer.name} (${newCustomer.customerId}) with initial ${accountType} account`,
            recordRef: newCustomer.customerId,
            severity: 'Info',
            createdAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: 'Customer registered successfully',
            customer: {
                id: userId,
                customerId,
                name: newCustomer.name,
                email: newCustomer.email,
                status: newCustomer.status,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Create customer error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
