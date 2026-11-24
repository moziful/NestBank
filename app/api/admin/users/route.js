import { NextResponse } from 'next/server';
import { getSession, hasRole, hashPassword } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET: Admin-only list of all users and staff
export async function GET(request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        if (!hasRole(session, ['Admin'])) {
            return NextResponse.json(
                { success: false, message: 'Forbidden: Admin access required' },
                { status: 403 }
            );
        }

        const db = await getDb();
        const users = await db.collection('users').find(
            {},
            { projection: { password: 0, transactionPin: 0 } }
        ).sort({ createdAt: -1 }).toArray();

        return NextResponse.json({ success: true, users });
    } catch (error) {
        console.error('Admin fetch users error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

// POST: Admin account provisioning (Create Admin, Bank Staff, or Customer accounts with specific status/roles)
export async function POST(request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // STRICT ACCESS CHECK: Only Admin can provision accounts via this endpoint
        if (!hasRole(session, ['Admin'])) {
            return NextResponse.json(
                { success: false, message: 'Forbidden: Admin privilege required to provision accounts' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, username, email, password, role, status = 'Active', department, phone } = body;

        if (!name || !username || !email || !password || !role) {
            return NextResponse.json(
                { success: false, message: 'Name, username, email, password, and role are required' },
                { status: 400 }
            );
        }

        const validRoles = ['Admin', 'Bank Staff', 'Customer'];
        if (!validRoles.includes(role)) {
            return NextResponse.json(
                { success: false, message: 'Invalid role. Allowed roles: Admin, Bank Staff, Customer' },
                { status: 400 }
            );
        }

        const db = await getDb();
        const existing = await db.collection('users').findOne({
            $or: [
                { email: email.trim().toLowerCase() },
                { username: username.trim().toLowerCase() },
            ],
        });

        if (existing) {
            return NextResponse.json(
                { success: false, message: 'User with this email or username already exists' },
                { status: 409 }
            );
        }

        const hashedPassword = await hashPassword(password);
        const newUser = {
            name: name.trim(),
            username: username.trim().toLowerCase(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role,
            status, // Active, Suspended, etc.
            department: department || '',
            phone: phone || '',
            createdBy: session.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection('users').insertOne(newUser);

        if (role === 'Customer') {
            await db.collection('accounts').insertOne({
                userId: result.insertedId.toString(),
                accountNumber: 'NB' + Math.floor(1000000000 + Math.random() * 9000000000),
                accountType: 'Savings',
                balance: 5000.00,
                currency: 'USD',
                status: 'Active',
                createdAt: new Date(),
            });
        }

        return NextResponse.json({
            success: true,
            message: `${role} account provisioned successfully`,
            user: {
                id: result.insertedId.toString(),
                name: newUser.name,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                status: newUser.status,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Admin provisioning error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Admin updates account status or details
export async function PATCH(request) {
    try {
        const session = await getSession();
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, status, role } = body;

        if (!userId) {
            return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
        }

        const updateData = { updatedAt: new Date() };
        if (status) updateData.status = status;
        if (role) updateData.role = role;

        const db = await getDb();
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        console.error('Admin update user error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
