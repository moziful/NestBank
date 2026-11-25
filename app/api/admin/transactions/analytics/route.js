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
        const days = parseInt(searchParams.get('days') || '30', 10);
        const db = await getDb();

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // 1. Transaction volume over time (daily)
        const volumeAgg = await db.collection('transactions').aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    volume: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]).toArray();

        // 2. Transaction amount by type
        const typeAgg = await db.collection('transactions').aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: '$type',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        // 3. Status distribution
        const statusAgg = await db.collection('transactions').aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        return NextResponse.json({
            success: true,
            analytics: {
                volumeOverTime: volumeAgg.map(v => ({ date: v._id, count: v.count, volume: v.volume })),
                amountByType: typeAgg.map(t => ({ type: t._id || 'Other', totalAmount: t.totalAmount, count: t.count })),
                statusDistribution: statusAgg.map(s => ({ status: s._id || 'Unknown', count: s.count }))
            }
        });
    } catch (err) {
        console.error('Transaction analytics error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
