import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const tab = searchParams.get('tab') || 'ALL'; // ALL, DEPOSIT, WITHDRAWAL, LOAN, HISTORY
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const priority = searchParams.get('priority') || '';

        const db = await getDb();
        const skip = (page - 1) * limit;

        if (tab === 'LOAN') {
            const loanQuery = {};
            if (search) {
                loanQuery.$or = [
                    { loanId: { $regex: search, $options: 'i' } },
                    { applicationId: { $regex: search, $options: 'i' } },
                    { customerName: { $regex: search, $options: 'i' } },
                    { customerId: { $regex: search, $options: 'i' } },
                    { purpose: { $regex: search, $options: 'i' } },
                    { loanType: { $regex: search, $options: 'i' } },
                ];
            }
            if (status && status !== 'All') {
                loanQuery.status = { $regex: new RegExp(`^${status}$`, 'i') };
            } else {
                loanQuery.status = { $in: ['Pending', 'PENDING', 'Under Review', 'UNDER_REVIEW'] };
            }

            const total = await db.collection('loans').countDocuments(loanQuery);
            const items = await db.collection('loans')
                .find(loanQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();

            return NextResponse.json({
                success: true,
                items,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit) || 1
                }
            });
        }

        // Banking Requests (Deposits, Withdrawals, History)
        const reqQuery = {};

        if (tab === 'DEPOSIT') {
            reqQuery.type = { $in: ['DEPOSIT', 'Deposit'] };
            reqQuery.status = { $in: ['PENDING', 'Pending'] };
        } else if (tab === 'WITHDRAWAL') {
            reqQuery.type = { $in: ['WITHDRAWAL', 'Withdrawal'] };
            reqQuery.status = { $in: ['PENDING', 'Pending'] };
        } else if (tab === 'HISTORY') {
            reqQuery.status = { $in: ['APPROVED', 'Approved', 'REJECTED', 'Rejected'] };
        } else {
            // ALL pending banking requests
            reqQuery.status = { $in: ['PENDING', 'Pending'] };
        }

        if (status && status !== 'All') {
            reqQuery.status = { $regex: new RegExp(`^${status}$`, 'i') };
        }

        if (priority && priority !== 'All') {
            reqQuery.priority = { $regex: new RegExp(`^${priority}$`, 'i') };
        }

        if (search) {
            reqQuery.$or = [
                { requestId: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } },
                { customerId: { $regex: search, $options: 'i' } },
                { accountNumber: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await db.collection('bankingRequests').countDocuments(reqQuery);
        const items = await db.collection('bankingRequests')
            .find(reqQuery)
            .sort({ createdAt: -1, submittedAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        return NextResponse.json({
            success: true,
            items,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1
            }
        });
    } catch (err) {
        console.error('Approvals list error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
