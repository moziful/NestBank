import { NextResponse } from 'next/server';
import { getSession, hasRole, isAccountActive } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/customer/records: Customers can ONLY read their own records; Staff/Admin can view any customer if authorized
export async function GET(request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        if (!isAccountActive(session)) {
            return NextResponse.json({ success: false, message: 'Account is suspended or inactive' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const requestedUserId = searchParams.get('userId');

        const db = await getDb();

        // Security check: Customer can NEVER read another customer's records
        if (session.role === 'Customer') {
            if (requestedUserId && requestedUserId !== session.userId) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Forbidden: Customers cannot access records of another customer',
                    },
                    { status: 403 }
                );
            }

            // Customer queries their own accounts and profile
            const user = await db.collection('users').findOne(
                { _id: new ObjectId(session.userId) },
                { projection: { password: 0, transactionPin: 0 } }
            );

            const accounts = await db.collection('accounts').find({ userId: session.userId }).toArray();
            return NextResponse.json({
                success: true,
                profile: user,
                accounts,
            });
        }

        // Staff or Admin reading customer records
        if (hasRole(session, ['Admin', 'Bank Staff'])) {
            if (requestedUserId) {
                const user = await db.collection('users').findOne(
                    { _id: new ObjectId(requestedUserId) },
                    { projection: { password: 0, transactionPin: 0 } }
                );
                if (!user) {
                    return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
                }
                const accounts = await db.collection('accounts').find({ userId: requestedUserId }).toArray();
                return NextResponse.json({ success: true, profile: user, accounts });
            }

            // List all customer accounts for staff/admin
            const customers = await db.collection('users').find(
                { role: 'Customer' },
                { projection: { password: 0, transactionPin: 0 } }
            ).toArray();

            return NextResponse.json({ success: true, customers });
        }

        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    } catch (error) {
        console.error('Customer records error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
