import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return new NextResponse('Forbidden: Admin access required', { status: 403 });
        }

        const db = await getDb();
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || '';
        const status = searchParams.get('status') || '';
        const riskStatus = searchParams.get('riskStatus') || '';

        const query = {};
        if (type && type !== 'All') query.type = { $regex: new RegExp(`^${type}$`, 'i') };
        if (status && status !== 'All') query.status = { $regex: new RegExp(`^${status}$`, 'i') };
        if (riskStatus && riskStatus !== 'All') query.riskStatus = { $regex: new RegExp(`^${riskStatus}$`, 'i') };

        const transactions = await db.collection('transactions').find(query).sort({ createdAt: -1 }).limit(5000).toArray();

        // CSV Header
        const headers = [
            'Transaction ID',
            'Type',
            'Customer Name',
            'Customer ID',
            'From Account',
            'To Account',
            'Amount (BDT)',
            'Fee (BDT)',
            'Status',
            'Risk Status',
            'Initiated By',
            'Date & Time'
        ];

        const rows = transactions.map(t => [
            `"${t.transactionId || ''}"`,
            `"${t.type || ''}"`,
            `"${t.customerName || ''}"`,
            `"${t.customerId || ''}"`,
            `"${t.sourceAccountNumber || t.accountNumber || 'N/A'}"`,
            `"${t.destinationAccountNumber || 'N/A'}"`,
            t.amount || 0,
            t.fee || 0,
            `"${t.status || ''}"`,
            `"${t.riskStatus || 'NORMAL'}"`,
            `"${t.initiatedByType || 'Customer'}"`,
            `"${t.createdAt ? new Date(t.createdAt).toISOString() : ''}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename=transactions-export-${new Date().toISOString().slice(0, 10)}.csv`
            }
        });
    } catch (err) {
        console.error('Export transactions error:', err);
        return new NextResponse('Internal server error', { status: 500 });
    }
}
