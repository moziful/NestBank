import { NextResponse } from 'next/server';
import { getSession, hasRole, isAccountActive } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Customer'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }
        if (!isAccountActive(session)) {
            return NextResponse.json({ success: false, message: 'Account is suspended or inactive' }, { status: 403 });
        }

        const db = await getDb();
        const accounts = await db.collection('accounts')
            .find({ userId: session.userId })
            .sort({ createdAt: 1 })
            .toArray();

        return NextResponse.json({
            success: true,
            accounts: accounts.map((a) => ({
                ...a,
                _id: String(a._id),
                availableBalance: Math.max(0, (Number(a.balance) || 0) - (Number(a.heldAmount) || 0)),
            })),
        });
    } catch (error) {
        console.error('Customer accounts API error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
