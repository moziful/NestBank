import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/admin/staff/[id]/activity - get activity history of staff member
export async function GET(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const db = await getDb();
        const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { employeeId: id };

        const staff = await db.collection('users').findOne(query);
        if (!staff) {
            return NextResponse.json({ success: false, message: 'Staff member not found' }, { status: 404 });
        }

        const activities = await db.collection('auditLogs')
            .find({
                $or: [
                    { actorId: staff._id.toString() },
                    { actor: staff.name },
                    { recordRef: staff.employeeId },
                ]
            })
            .sort({ createdAt: -1 })
            .limit(30)
            .toArray();

        return NextResponse.json({ success: true, activities, staffName: staff.name });
    } catch (error) {
        console.error('Fetch staff activity error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
