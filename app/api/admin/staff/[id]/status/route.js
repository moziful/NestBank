import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// PATCH /api/admin/staff/[id]/status - activate, deactivate, or suspend staff account
export async function PATCH(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status, reason } = body;

        const validStatuses = ['Active', 'Inactive', 'Suspended'];
        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json({ success: false, message: 'Invalid status. Must be Active, Inactive, or Suspended.' }, { status: 400 });
        }

        const db = await getDb();
        const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { employeeId: id };

        const staff = await db.collection('users').findOne(query);
        if (!staff) {
            return NextResponse.json({ success: false, message: 'Staff member not found' }, { status: 404 });
        }

        const previousStatus = staff.status;
        await db.collection('users').updateOne(query, {
            $set: {
                status,
                updatedAt: new Date(),
            },
        });

        // Record status change in audit log for full accountability
        await db.collection('auditLogs').insertOne({
            actorId: session.userId,
            actor: session.name || 'System Admin',
            action: `STAFF_STATUS_${status.toUpperCase()}`,
            event: `Changed status of ${staff.name} (${staff.employeeId}) from ${previousStatus} to ${status}. ${reason ? `Reason: ${reason}` : ''}`,
            recordRef: staff.employeeId,
            severity: status === 'Active' ? 'Info' : 'Warning',
            createdAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: `Staff account marked as ${status} successfully`,
            newStatus: status,
        });
    } catch (error) {
        console.error('Update staff status error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
