import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const db = await getDb();
        const history = await db.collection('bankSettingsHistory')
            .find({})
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray();

        return NextResponse.json({ success: true, history });
    } catch (err) {
        console.error('Get settings history error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
