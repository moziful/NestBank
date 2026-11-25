import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const tab = searchParams.get('tab') || 'ALL'; // ALL, PENDING_DISBURSEMENT, ACTIVE, OVERDUE, COMPLETED
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const search = searchParams.get('search') || '';
        const loanType = searchParams.get('loanType') || '';
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

        const db = await getDb();
        const query = {};

        // Tab filters
        if (tab === 'PENDING_DISBURSEMENT') {
            query.status = { $in: ['Approved', 'APPROVED'] };
            query.disbursementStatus = { $ne: 'DISBURSED' };
        } else if (tab === 'ACTIVE') {
            query.status = { $in: ['Active', 'ACTIVE'] };
        } else if (tab === 'OVERDUE') {
            query.$or = [{ status: { $in: ['Overdue', 'OVERDUE'] } }, { isOverdue: true }];
        } else if (tab === 'COMPLETED') {
            query.status = { $in: ['Completed', 'COMPLETED'] };
        }

        if (loanType && loanType !== 'All') {
            query.loanType = { $regex: new RegExp(`^${loanType}$`, 'i') };
        }

        if (search) {
            query.$or = [
                { loanId: { $regex: search, $options: 'i' } },
                { applicationId: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } },
                { customerId: { $regex: search, $options: 'i' } },
                { accountNumber: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;
        const total = await db.collection('loans').countDocuments(query);
        const loans = await db.collection('loans')
            .find(query)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .toArray();

        return NextResponse.json({
            success: true,
            loans,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1
            }
        });
    } catch (err) {
        console.error('List loans error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
