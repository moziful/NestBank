import { NextResponse } from 'next/server';
import { getSession, hasRole, isAccountActive } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Customer'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }
        if (!isAccountActive(session)) {
            return NextResponse.json({ success: false, message: 'Account is suspended or inactive' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const search = (searchParams.get('search') || '').trim();
        const type = searchParams.get('type') || 'All';
        const status = searchParams.get('status') || 'All';
        const accountNumber = searchParams.get('account') || 'All';
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10', 10)));

        const db = await getDb();
        const accounts = await db.collection('accounts').find({ userId: session.userId }).toArray();
        const ownedAccountNumbers = accounts.map((a) => a.accountNumber).filter(Boolean);

        const baseScope = ownedAccountNumbers.length > 0
            ? {
                $or: [
                    { userId: session.userId },
                    { accountNumber: { $in: ownedAccountNumbers } },
                    { fromAccount: { $in: ownedAccountNumbers } },
                    { toAccount: { $in: ownedAccountNumbers } },
                ],
            }
            : { userId: session.userId };

        const filters = [baseScope];

        if (accountNumber && accountNumber !== 'All' && ownedAccountNumbers.includes(accountNumber)) {
            filters.push({
                $or: [
                    { accountNumber },
                    { fromAccount: accountNumber },
                    { toAccount: accountNumber },
                ],
            });
        }

        if (type && type !== 'All') {
            filters.push({ type });
        }

        if (status && status !== 'All') {
            filters.push({ status });
        }

        if (search) {
            filters.push({
                $or: [
                    { transactionId: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { fromAccount: { $regex: search, $options: 'i' } },
                    { toAccount: { $regex: search, $options: 'i' } },
                ],
            });
        }

        const query = filters.length === 1 ? filters[0] : { $and: filters };
        const total = await db.collection('transactions').countDocuments(query);
        const transactions = await db.collection('transactions')
            .find(query, { projection: { investigationNotes: 0, riskScore: 0, flaggedBy: 0, riskStatus: 0 } })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

        return NextResponse.json({
            success: true,
            transactions,
            ownedAccounts: ownedAccountNumbers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        });
    } catch (error) {
        console.error('Customer transactions error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
