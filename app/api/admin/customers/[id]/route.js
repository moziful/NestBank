import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Helper to resolve user
async function resolveCustomer(db, id) {
    if (ObjectId.isValid(id)) {
        return db.collection('users').findOne({ _id: new ObjectId(id), role: 'Customer' });
    }
    return db.collection('users').findOne({ customerId: id, role: 'Customer' });
}

// GET /api/admin/customers/[id]
export async function GET(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const db = await getDb();
        const customer = await resolveCustomer(db, id);

        if (!customer) {
            return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
        }

        const userId = customer._id.toString();

        // 1. Fetch Accounts
        const accounts = await db.collection('accounts').find({ userId }).toArray();
        const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

        // 2. Fetch Aggregated Financial Statistics
        const txAgg = await db.collection('transactions').aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: '$type',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                }
            }
        ]).toArray();

        let totalDeposits = 0;
        let totalWithdrawals = 0;
        txAgg.forEach((t) => {
            if (t._id === 'Deposit') totalDeposits = t.totalAmount;
            if (t._id === 'Withdrawal') totalWithdrawals = t.totalAmount;
        });

        // 3. Fetch Loans
        const loans = await db.collection('loans').find({
            $or: [{ userId }, { customerName: customer.name }]
        }).toArray();

        // 4. Fetch Recent Transactions
        const transactions = await db.collection('transactions')
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(25)
            .toArray();

        // 5. Fetch Activity Logs
        const activities = await db.collection('auditLogs')
            .find({
                $or: [
                    { actorId: userId },
                    { actor: customer.name },
                    { recordRef: customer.customerId },
                ]
            })
            .sort({ createdAt: -1 })
            .limit(20)
            .toArray();

        const safeCustomer = { ...customer };
        delete safeCustomer.password;
        delete safeCustomer.transactionPin;

        return NextResponse.json({
            success: true,
            customer: safeCustomer,
            summary: {
                totalBalance,
                accountCount: accounts.length,
                totalDeposits,
                totalWithdrawals,
                activeLoanCount: loans.filter((l) => l.status === 'Active').length,
            },
            accounts,
            transactions,
            loans,
            activities,
        });
    } catch (error) {
        console.error('Fetch customer detail error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/admin/customers/[id] - update customer profile
export async function PATCH(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, phone, address, dateOfBirth, status } = body;

        const db = await getDb();
        const customer = await resolveCustomer(db, id);
        if (!customer) {
            return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
        }

        const updateFields = { updatedAt: new Date() };
        if (name) updateFields.name = name.trim();
        if (phone !== undefined) updateFields.phone = phone.trim();
        if (address !== undefined) updateFields.address = address.trim();
        if (dateOfBirth) updateFields.dateOfBirth = new Date(dateOfBirth);
        if (status) updateFields.status = status;

        await db.collection('users').updateOne({ _id: customer._id }, { $set: updateFields });

        await db.collection('auditLogs').insertOne({
            actorId: session.userId,
            actor: session.name || 'System Admin',
            action: 'CUSTOMER_PROFILE_UPDATED',
            event: `Updated profile details for customer ${customer.name} (${customer.customerId})`,
            recordRef: customer.customerId,
            severity: 'Info',
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true, message: 'Customer updated successfully' });
    } catch (error) {
        console.error('Update customer error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
