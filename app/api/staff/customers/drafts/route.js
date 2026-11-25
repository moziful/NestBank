import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { createAuditLog } from '@/lib/audit';

// GET /api/staff/customers/drafts - list drafts created by current staff
export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const db = await getDb();
        const drafts = await db.collection('customerDrafts')
            .find({ staffId: session.userId })
            .sort({ updatedAt: -1 })
            .limit(10)
            .toArray();

        return NextResponse.json({ success: true, drafts });
    } catch (error) {
        console.error('List drafts error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/staff/customers/drafts - create a new registration draft
export async function POST(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { currentStep = 1, formData = {} } = body;

        const db = await getDb();
        const now = new Date();
        const draftDoc = {
            staffId: session.userId,
            staffName: session.name || session.username,
            currentStep,
            formData,
            status: 'DRAFT',
            createdAt: now,
            updatedAt: now,
        };

        const result = await db.collection('customerDrafts').insertOne(draftDoc);

        await createAuditLog({
            actorId: session.userId,
            actorName: session.name || session.username,
            actorRole: session.role,
            action: 'CUSTOMER_DRAFT_SAVED',
            category: 'CUSTOMER',
            targetType: 'CustomerDraft',
            targetId: String(result.insertedId),
            description: `Saved customer registration draft at step ${currentStep}`,
        });

        return NextResponse.json({
            success: true,
            draft: { ...draftDoc, _id: String(result.insertedId) },
            message: 'Registration draft saved.',
        }, { status: 201 });
    } catch (error) {
        console.error('Save draft error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
