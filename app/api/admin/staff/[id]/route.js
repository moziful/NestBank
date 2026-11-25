import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/admin/staff/[id] - get staff profile details
export async function GET(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const db = await getDb();

        let query = {};
        if (ObjectId.isValid(id)) {
            query = { _id: new ObjectId(id) };
        } else {
            query = { employeeId: id };
        }

        const staff = await db.collection('users').findOne(
            query,
            { projection: { password: 0, transactionPin: 0 } }
        );

        if (!staff) {
            return NextResponse.json({ success: false, message: 'Staff member not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, staff });
    } catch (error) {
        console.error('Fetch staff detail error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/admin/staff/[id] - edit staff profile (personal & employment information)
export async function PATCH(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, phone, department, designation, status } = body;

        const db = await getDb();
        const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { employeeId: id };

        const existingStaff = await db.collection('users').findOne(query);
        if (!existingStaff) {
            return NextResponse.json({ success: false, message: 'Staff member not found' }, { status: 404 });
        }

        const updateFields = { updatedAt: new Date() };
        if (name) updateFields.name = name.trim();
        if (phone !== undefined) updateFields.phone = phone.trim();
        if (department) updateFields.department = department;
        if (designation) updateFields.designation = designation;
        if (status) updateFields.status = status;

        await db.collection('users').updateOne(query, { $set: updateFields });

        // Record edit in audit log
        await db.collection('auditLogs').insertOne({
            actorId: session.userId,
            actor: session.name || 'System Admin',
            action: 'STAFF_PROFILE_UPDATED',
            event: `Updated profile details for staff member ${existingStaff.name} (${existingStaff.employeeId})`,
            recordRef: existingStaff.employeeId,
            severity: 'Info',
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true, message: 'Staff profile updated successfully' });
    } catch (error) {
        console.error('Update staff error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
