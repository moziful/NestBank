import { NextResponse } from 'next/server';
import { getSession, hasRole, hashPassword } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST /api/admin/staff/[id]/reset-password - trigger secure password reset
export async function POST(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { newPassword } = body;

        const db = await getDb();
        const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { employeeId: id };

        const staff = await db.collection('users').findOne(query);
        if (!staff) {
            return NextResponse.json({ success: false, message: 'Staff member not found' }, { status: 404 });
        }

        // Generate temporary password if none provided
        const tempPassword = newPassword || `NestStaff${Math.floor(100000 + Math.random() * 900000)}!`;
        const hashedPassword = await hashPassword(tempPassword);

        await db.collection('users').updateOne(query, {
            $set: {
                password: hashedPassword,
                requirePasswordChange: true,
                lastPasswordReset: new Date(),
                updatedAt: new Date(),
            },
        });

        // Audit log
        await db.collection('auditLogs').insertOne({
            actorId: session.userId,
            actor: session.name || 'System Admin',
            action: 'STAFF_PASSWORD_RESET',
            event: `Admin reset password for staff member ${staff.name} (${staff.employeeId})`,
            recordRef: staff.employeeId,
            severity: 'Security',
            createdAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: 'Password reset successfully',
            tempPassword,
        });
    } catch (error) {
        console.error('Reset staff password error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
