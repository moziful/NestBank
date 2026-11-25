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

// POST /api/admin/customers/[id]/block - block customer with reason and freeze accounts
export async function POST(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { reason = 'Suspicious activity detected', freezeAccounts = true } = body;

        const db = await getDb();
        const customer = await resolveCustomer(db, id);
        if (!customer) {
            return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
        }

        // 1. Update customer status to Blocked
        await db.collection('users').updateOne(
            { _id: customer._id },
            {
                $set: {
                    status: 'Blocked',
                    blockReason: reason,
                    blockedAt: new Date(),
                    blockedBy: session.userId,
                    updatedAt: new Date(),
                },
            }
        );

        // 2. Freeze accounts if policy enabled
        if (freezeAccounts) {
            await db.collection('accounts').updateMany(
                { userId: customer._id.toString() },
                { $set: { status: 'Frozen', updatedAt: new Date() } }
            );
        }

        // 3. Create high-severity Audit Log
        await db.collection('auditLogs').insertOne({
            actorId: session.userId,
            actor: session.name || 'System Admin',
            targetCustomerId: customer._id.toString(),
            action: 'CUSTOMER_BLOCKED',
            event: `Blocked customer ${customer.name} (${customer.customerId}). Reason: ${reason}`,
            recordRef: customer.customerId,
            severity: 'Security',
            createdAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: `Customer ${customer.name} has been blocked and restricted.`,
        });
    } catch (error) {
        console.error('Block customer error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
