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

// PATCH /api/admin/customers/[id]/status - activate or deactivate customer
export async function PATCH(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status, reason } = body;

        const validStatuses = ['Active', 'Inactive', 'Blocked'];
        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json({ success: false, message: 'Invalid status.' }, { status: 400 });
        }

        const db = await getDb();
        const customer = await resolveCustomer(db, id);
        if (!customer) {
            return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
        }

        const previousStatus = customer.status;
        await db.collection('users').updateOne(
            { _id: customer._id },
            {
                $set: {
                    status,
                    statusReason: reason || '',
                    updatedAt: new Date(),
                },
            }
        );

        // Audit Log
        await db.collection('auditLogs').insertOne({
            actorId: session.userId,
            actor: session.name || 'System Admin',
            targetCustomerId: customer._id.toString(),
            action: `CUSTOMER_${status.toUpperCase()}`,
            event: `Changed customer status of ${customer.name} (${customer.customerId}) from ${previousStatus} to ${status}. ${reason ? `Reason: ${reason}` : ''}`,
            recordRef: customer.customerId,
            severity: status === 'Active' ? 'Info' : (status === 'Blocked' ? 'Security' : 'Warning'),
            createdAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: `Customer marked as ${status} successfully`,
            newStatus: status,
        });
    } catch (error) {
        console.error('Update customer status error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
