import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/admin/accounts - list accounts with search, filters, pagination, and sorting
export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const search = (searchParams.get('search') || '').trim();
        const accountType = searchParams.get('accountType');
        const status = searchParams.get('status');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);

        const db = await getDb();
        const query = {};

        if (search) {
            query.$or = [
                { accountNumber: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } },
                { customerId: { $regex: search, $options: 'i' } },
            ];
        }

        if (accountType && accountType !== 'All') {
            query.accountType = accountType;
        }

        if (status && status !== 'All') {
            query.status = status;
        }

        const total = await db.collection('accounts').countDocuments(query);
        const accounts = await db.collection('accounts')
            .find(query)
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

        // Compute available balance: ledgerBalance - heldAmount
        const enrichedAccounts = accounts.map((acc) => {
            const ledger = typeof acc.ledgerBalance === 'number' ? acc.ledgerBalance : (acc.balance || 0);
            const held = typeof acc.heldAmount === 'number' ? acc.heldAmount : 0;
            return {
                ...acc,
                ledgerBalance: ledger,
                availableBalance: Math.max(ledger - held, 0),
                heldAmount: held,
            };
        });

        return NextResponse.json({
            success: true,
            accounts: enrichedAccounts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        });
    } catch (error) {
        console.error('Fetch accounts error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/accounts - open new account for existing verified customer with initial deposit transaction
export async function POST(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const {
            customerId, // customer._id or customer.customerId
            accountType = 'Savings',
            initialDeposit = 0,
            maxSingleTransfer = 50000,
            dailyTransferLimit = 100000,
            dailyWithdrawalLimit = 40000,
            minimumBalance = 500,
            branch = 'Principal Corporate Branch, Dhaka',
        } = body;

        if (!customerId) {
            return NextResponse.json({ success: false, message: 'Customer ID is required.' }, { status: 400 });
        }

        const db = await getDb();
        let customer = null;
        if (ObjectId.isValid(customerId)) {
            customer = await db.collection('users').findOne({ _id: new ObjectId(customerId), role: 'Customer' });
        }
        if (!customer) {
            customer = await db.collection('users').findOne({ customerId, role: 'Customer' });
        }

        if (!customer) {
            return NextResponse.json({ success: false, message: 'Verified customer not found.' }, { status: 404 });
        }

        // Generate unique account number
        const count = await db.collection('accounts').countDocuments();
        const accountNumber = `NB${Math.floor(1000000000 + Math.random() * 9000000000)}`;

        const depositVal = Number(initialDeposit) || 0;

        const newAccount = {
            userId: customer._id.toString(),
            customerId: customer.customerId || `CUS-${customer._id.toString().slice(-4)}`,
            customerName: customer.name,
            accountNumber,
            accountType,
            currency: 'BDT',
            balance: depositVal,
            ledgerBalance: depositVal,
            heldAmount: 0,
            status: 'Active',
            branch,
            limits: {
                maxSingleTransfer: Number(maxSingleTransfer) || 50000,
                dailyTransferLimit: Number(dailyTransferLimit) || 100000,
                dailyWithdrawalLimit: Number(dailyWithdrawalLimit) || 40000,
                minimumBalance: Number(minimumBalance) || 500,
                dailyTransactionCount: 20,
            },
            createdBy: session.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection('accounts').insertOne(newAccount);

        // Record opening financial deposit transaction if depositVal > 0
        if (depositVal > 0) {
            await db.collection('transactions').insertOne({
                transactionId: `TXN${Date.now()}`,
                userId: customer._id.toString(),
                accountNumber,
                customerName: customer.name,
                type: 'Deposit',
                amount: depositVal,
                currency: 'BDT',
                status: 'Completed',
                reference: 'Account opening initial deposit',
                createdAt: new Date(),
            });
        }

        // Record audit log
        await db.collection('auditLogs').insertOne({
            actorId: session.userId,
            actor: session.name || 'System Admin',
            action: 'ACCOUNT_CREATED',
            event: `Created new ${accountType} account ${accountNumber} for customer ${customer.name}`,
            recordRef: accountNumber,
            severity: 'Info',
            createdAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: 'Bank account opened successfully',
            account: {
                id: result.insertedId.toString(),
                accountNumber,
                customerName: customer.name,
                accountType,
                balance: depositVal,
                status: 'Active',
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Create account error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
