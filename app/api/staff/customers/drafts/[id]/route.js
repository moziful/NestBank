import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// PATCH /api/staff/customers/drafts/[id] - update draft owned by staff
export async function PATCH(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid draft ID' }, { status: 400 });
        }

        const body = await request.json();
        const { currentStep, formData } = body;

        const db = await getDb();
        const filter = { _id: new ObjectId(id) };
        if (session.role !== 'Admin') {
            filter.staffId = session.userId;
        }

        const updateFields = { updatedAt: new Date() };
        if (currentStep !== undefined) updateFields.currentStep = currentStep;
        if (formData !== undefined) updateFields.formData = formData;

        const result = await db.collection('customerDrafts').findOneAndUpdate(
            filter,
            { $set: updateFields },
            { returnDocument: 'after' }
        );

        if (!result) {
            return NextResponse.json({ success: false, message: 'Draft not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            draft: { ...result, _id: String(result._id) },
            message: 'Draft updated.',
        });
    } catch (error) {
        console.error('Update draft error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/staff/customers/drafts/[id] - delete draft
export async function DELETE(request, { params }) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid draft ID' }, { status: 400 });
        }

        const db = await getDb();
        const filter = { _id: new ObjectId(id) };
        if (session.role !== 'Admin') {
            filter.staffId = session.userId;
        }

        await db.collection('customerDrafts').deleteOne(filter);
        return NextResponse.json({ success: true, message: 'Draft discarded.' });
    } catch (error) {
        console.error('Delete draft error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
