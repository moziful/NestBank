import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { createAuditLog } from '@/lib/audit';
import { notifyRoles, notifyUser } from '@/lib/notifications';

export async function POST(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Bank Staff', 'Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { requestId, notes, reason } = body;
        if (!requestId) {
            return NextResponse.json({ success: false, message: 'Missing requestId' }, { status: 400 });
        }

        const db = await getDb();
        const query = ObjectId.isValid(requestId) ? { _id: new ObjectId(requestId) } : { requestId };
        const reqItem = await db.collection('bankingRequests').findOne(query);

        if (!reqItem) {
            return NextResponse.json({ success: false, message: 'Request not found' }, { status: 404 });
        }

        await db.collection('bankingRequests').updateOne(query, {
            $set: {
                reviewStatus: 'ForwardedToAdmin',
                forwardedToAdminAt: new Date(),
                forwardedBy: session.username,
                staffNotes: notes || reason || 'Forwarded by Bank Staff for higher authorization'
            },
            $push: {
                timeline: {
                    action: 'FORWARDED_TO_ADMIN',
                    actor: session.username,
                    actorRole: session.role,
                    note: notes || reason || 'Forwarded to Admin',
                    timestamp: new Date()
                }
            }
        });

        await createAuditLog({
            actorName: session.username,
            actorRole: session.role,
            action: 'REQUEST_FORWARDED_TO_ADMIN',
            targetType: 'BankingRequest',
            targetId: String(reqItem._id),
            description: notes || reason || 'Request forwarded to admin',
        });

        await notifyRoles(['Admin'], {
            title: 'Request Forwarded for Admin Approval',
            message: `Staff (${session.username}) forwarded request ${reqItem.requestId || reqItem._id} for Admin review.`,
            category: 'APPROVAL',
            href: '/admin/approvals',
        });

        if (reqItem.userId) {
            await notifyUser({
                userId: reqItem.userId,
                title: 'Request Under Final Review',
                message: `Your request (${reqItem.requestId || 'N/A'}) has been verified by Staff and forwarded to Admin.`,
                category: 'APPROVAL',
                href: '/customer/transactions',
            });
        }

        return NextResponse.json({ success: true, message: 'Request forwarded to Admin successfully' });
    } catch (err) {
        console.error('Forward request error:', err);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
