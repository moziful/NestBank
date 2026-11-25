import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Helper to resolve account
async function resolveAccount(db, id) {
    if (ObjectId.isValid(id)) {
        return db.collection('accounts').findOne({ _id: new ObjectId(id) });
    }
    return db.collection('accounts').findOne({ accountNumber: id });
}

// GET /api/admin/accounts/[id]
export async function GET(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const db = await getDb();
        const account = await resolveAccount(db, id);

        if (!account) {
            return NextResponse.json({ success: false, message: 'Bank account not found' }, { status: 404 });
        }

        // Fetch customer profile
        const customer = await db.collection('users').findOne(
            { _id: new ObjectId(account.userId) },
            { projection: { password: 0, transactionPin: 0 } }
        );

        // Fetch account transactions
        const transactions = await db.collection('transactions')
            .find({ accountNumber: account.accountNumber })
            .sort({ createdAt: -1 })
            .limit(30)
            .toArray();

        // Fetch audit logs for this account
        const activities = await db.collection('auditLogs')
            .find({ recordRef: account.accountNumber })
            .sort({ createdAt: -1 })
            .limit(20)
            .toArray();

        const ledger = typeof account.ledgerBalance === 'number' ? account.ledgerBalance : (account.balance || 0);
        const held = typeof account.heldAmount === 'number' ? account.heldAmount : 0;
        const availableBalance = Math.max(ledger - held, 0);

        return NextResponse.json({
            success: true,
            account: {
                ...account,
                ledgerBalance: ledger,
                availableBalance,
                heldAmount: held,
            },
            customer,
            transactions,
            activities,
        });
    } catch (error) {
        console.error('Fetch account detail error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/admin/accounts/[id] - update permitted metadata (branch, notes) - NEVER DIRECT BALANCE
export async function PATCH(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { branch, accountType, notes } = body;

        const db = await getDb();
        const account = await resolveAccount(db, id);
        if (!account) {
            return NextResponse.json({ success: false, message: 'Bank account not found' }, { status: 404 });
        }

        const updateFields = { updatedAt: new Date() };
        if (branch) updateFields.branch = branch.trim();
        if (accountType) updateFields.accountType = accountType;
        if (notes !== undefined) updateFields.notes = notes;

        await db.collection('accounts').updateOne({ _id: account._id }, { $set: updateFields });

        await db.collection('auditLogs').insertOne({
            actorId: session.userId,
            actor: session.name || 'System Admin',
            action: 'ACCOUNT_UPDATED',
            event: `Updated account details for ${account.accountNumber} (${account.customerName})`,
            recordRef: account.accountNumber,
            severity: 'Info',
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true, message: 'Account information updated successfully.' });
    } catch (error) {
        console.error('Update account error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
