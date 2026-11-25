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

// POST /api/admin/customers/[id]/unblock - restore customer to Active
export async function POST(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { unblockReason = 'Administrative clearance' } = body;

        const db = await getDb();
        const customer = await resolveCustomer(db, id);
        if (!customer) {
            return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
        }

        // 1. Update customer status to Active
        await db.collection('users').updateOne(
            { _id: customer._id },
            {
                $set: {
                    status: 'Active',
                    unblockReason,
                    unblockedAt: new Date(),
                    unblockedBy: session.userId,
                    updatedAt: new Date(),
                },
            }
        );

        // 2. Unfreeze accounts back to Active
        await db.collection('accounts').updateMany(
            { userId: customer._id.toString(), status: 'Frozen' },
            { $set: { status: 'Active', updatedAt: new Date() } }
        );

        // 3. Create Audit Log
        await db.collection('auditLogs').insertOne({
            actorId: session.userId,
            actor: session.name || 'System Admin',
            targetCustomerId: customer._id.toString(),
            action: 'CUSTOMER_UNBLOCKED',
            event: `Unblocked customer ${customer.name} (${customer.customerId}). Reason: ${unblockReason}`,
            recordRef: customer.customerId,
            severity: 'Info',
            createdAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: `Customer ${customer.name} has been restored to Active status.`,
        });
    } catch (error) {
        console.error('Unblock customer error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
