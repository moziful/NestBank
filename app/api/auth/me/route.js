import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session) {
            return NextResponse.json({ authenticated: false, session: null }, { status: 401 });
        }

        const db = await getDb();
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(session.userId) },
            { projection: { password: 0, transactionPin: 0 } }
        );

        if (!user) {
            return NextResponse.json({ authenticated: false, message: 'User not found' }, { status: 404 });
        }

        if (user.status !== 'Active') {
            return NextResponse.json(
                { authenticated: false, message: 'Account is not active', status: user.status },
                { status: 403 }
            );
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                id: user._id.toString(),
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status,
                hasPin: !!user.hasTransactionPin,
            },
        });
    } catch (error) {
        console.error('Session check error:', error);
        return NextResponse.json({ authenticated: false, message: 'Internal server error' }, { status: 500 });
    }
}
