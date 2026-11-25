import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Customer'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const db = await getDb();
        const notifications = await db.collection('notifications')
            .find({ userId: session.userId })
            .sort({ createdAt: -1 })
            .limit(40)
            .toArray();

        return NextResponse.json({
            success: true,
            notifications: notifications.map((n) => ({ ...n, _id: String(n._id) })),
        });
    } catch (error) {
        console.error('Customer notifications GET error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Customer'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { notificationId, markAll = false } = body;
        const db = await getDb();

        if (markAll) {
            await db.collection('notifications').updateMany(
                { userId: session.userId, read: false },
                { $set: { read: true } }
            );
        } else if (notificationId && ObjectId.isValid(notificationId)) {
            await db.collection('notifications').updateOne(
                { _id: new ObjectId(notificationId), userId: session.userId },
                { $set: { read: true } }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Customer notifications PATCH error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
