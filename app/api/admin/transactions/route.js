import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const search = searchParams.get('search') || '';
        const type = searchParams.get('type') || '';
        const status = searchParams.get('status') || '';
        const riskStatus = searchParams.get('riskStatus') || '';
        const dateRange = searchParams.get('dateRange') || '';
        const minAmount = searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')) : null;
        const maxAmount = searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')) : null;
        const account = searchParams.get('account') || '';
        const initiatedBy = searchParams.get('initiatedBy') || '';
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

        const db = await getDb();
        const query = {};

        // Search across Transaction ID, account numbers, customer name, customer ID
        if (search) {
            query.$or = [
                { transactionId: { $regex: search, $options: 'i' } },
                { accountNumber: { $regex: search, $options: 'i' } },
                { sourceAccountNumber: { $regex: search, $options: 'i' } },
                { destinationAccountNumber: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } },
                { customerId: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { reference: { $regex: search, $options: 'i' } },
            ];
        }

        // Type filter
        if (type && type !== 'All') {
            query.type = { $regex: new RegExp(`^${type}$`, 'i') };
        }

        // Status filter
        if (status && status !== 'All') {
            query.status = { $regex: new RegExp(`^${status}$`, 'i') };
        }

        // Risk status filter
        if (riskStatus && riskStatus !== 'All') {
            query.riskStatus = { $regex: new RegExp(`^${riskStatus}$`, 'i') };
        }

        // Account filter
        if (account) {
            query.$or = [
                { accountNumber: { $regex: account, $options: 'i' } },
                { sourceAccountNumber: { $regex: account, $options: 'i' } },
                { destinationAccountNumber: { $regex: account, $options: 'i' } },
            ];
        }

        // Initiated by filter
        if (initiatedBy && initiatedBy !== 'All') {
            query.initiatedByType = { $regex: new RegExp(`^${initiatedBy}$`, 'i') };
        }

        // Amount range filter
        if (minAmount !== null || maxAmount !== null) {
            query.amount = {};
            if (minAmount !== null && !isNaN(minAmount)) query.amount.$gte = minAmount;
            if (maxAmount !== null && !isNaN(maxAmount)) query.amount.$lte = maxAmount;
        }

        // Date range filter
        if (dateRange && dateRange !== 'All') {
            const now = new Date();
            let startDate = new Date();
            if (dateRange === 'today') {
                startDate.setHours(0, 0, 0, 0);
            } else if (dateRange === '7d') {
                startDate.setDate(now.getDate() - 7);
            } else if (dateRange === '30d') {
                startDate.setDate(now.getDate() - 30);
            }
            query.createdAt = { $gte: startDate };
        }

        const skip = (page - 1) * limit;

        const totalTransactions = await db.collection('transactions').countDocuments(query);
        const transactions = await db.collection('transactions')
            .find(query)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .toArray();

        return NextResponse.json({
            success: true,
            transactions,
            pagination: {
                total: totalTransactions,
                page,
                limit,
                totalPages: Math.ceil(totalTransactions / limit) || 1,
            }
        });
    } catch (err) {
        console.error('List transactions error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
