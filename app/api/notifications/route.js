import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !session.userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDb();
        const notifications = await db.collection('notifications')
            .find({ userId: String(session.userId) })
            .sort({ createdAt: -1 })
            .limit(40)
            .toArray();

        const unreadCount = await db.collection('notifications').countDocuments({
            userId: String(session.userId),
            read: false,
        });

        return NextResponse.json({
            success: true,
            notifications: notifications.map((n) => ({ ...n, _id: String(n._id) })),
            unreadCount,
        });
    } catch (error) {
        console.error('Notifications GET error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const session = await getSession(request);
        if (!session || !session.userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { notificationId, markAll = false } = body;
        const db = await getDb();

        if (markAll) {
            await db.collection('notifications').updateMany(
                { userId: String(session.userId), read: false },
                { $set: { read: true } }
            );
        } else if (notificationId && ObjectId.isValid(notificationId)) {
            await db.collection('notifications').updateOne(
                { _id: new ObjectId(notificationId), userId: String(session.userId) },
                { $set: { read: true } }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Notifications PATCH error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
