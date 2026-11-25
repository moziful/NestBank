import { getDb } from '@/lib/mongodb';

/**
 * Insert a notification for a single user.
 */
export async function notifyUser({
    userId,
    title,
    message,
    category = 'SYSTEM',
    href = '',
    metadata = null,
}) {
    if (!userId) return;
    try {
        const db = await getDb();
        await db.collection('notifications').insertOne({
            userId: String(userId),
            title,
            message,
            category: category.toUpperCase(),
            href,
            metadata,
            read: false,
            createdAt: new Date(),
        });
    } catch (err) {
        console.error('notifyUser error:', err);
    }
}

/**
 * Broadcast a notification to all active users matching any of the given roles.
 */
export async function notifyRoles(roles = [], { title, message, category = 'SYSTEM', href = '', metadata = null }) {
    if (!roles || roles.length === 0) return;
    try {
        const db = await getDb();
        const recipients = await db.collection('users')
            .find(
                { role: { $in: roles }, status: { $ne: 'Blocked' } },
                { projection: { _id: 1 } }
            )
            .toArray();

        if (recipients.length === 0) return;

        const now = new Date();
        const docs = recipients.map((u) => ({
            userId: String(u._id),
            title,
            message,
            category: category.toUpperCase(),
            href,
            metadata,
            read: false,
            createdAt: now,
        }));

        await db.collection('notifications').insertMany(docs);
    } catch (err) {
        console.error('notifyRoles error:', err);
    }
}
