import { NextResponse } from 'next/server';
import { getSession, hasRole, isAccountActive } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { createAuditLog } from '@/lib/audit';
import { notifyRoles } from '@/lib/notifications';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Customer'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const db = await getDb();

        const query = { userId: session.userId };
        if (type && type !== 'All') {
            query.type = type;
        }

        const requests = await db.collection('bankingRequests')
            .find(query)
            .sort({ createdAt: -1 })
            .limit(30)
            .toArray();

        return NextResponse.json({ success: true, requests });
    } catch (error) {
        console.error('Customer requests GET error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Customer'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }
        if (!isAccountActive(session)) {
            return NextResponse.json({ success: false, message: 'Account is suspended or inactive' }, { status: 403 });
        }

        const body = await request.json();
        const {
            type, // 'Deposit' or 'Withdrawal'
            accountNumber,
            amount,
            method = 'Branch / Simulation',
            description = '',
        } = body;

        if (!['Deposit', 'Withdrawal'].includes(type)) {
            return NextResponse.json({ success: false, message: 'Invalid request type' }, { status: 400 });
        }

        const reqAmount = Number(amount);
        if (!accountNumber || !reqAmount || reqAmount <= 0 || isNaN(reqAmount)) {
            return NextResponse.json({ success: false, message: 'Valid account and positive amount are required.' }, { status: 400 });
        }

        const db = await getDb();
        const account = await db.collection('accounts').findOne({
            accountNumber: accountNumber.trim(),
            userId: session.userId,
        });

        if (!account) {
            return NextResponse.json({ success: false, message: 'Account not found or unauthorized.' }, { status: 404 });
        }
        if (account.status !== 'Active') {
            return NextResponse.json({ success: false, message: `Account is ${account.status}.` }, { status: 400 });
        }

        // For withdrawals, reserve funds on heldAmount atomically so the same funds cannot be spent twice
        if (type === 'Withdrawal') {
            const perTxLimit = Number(account.perTransactionLimit) || 500000;
            if (reqAmount > perTxLimit) {
                return NextResponse.json(
                    { success: false, message: `Withdrawal exceeds per-transaction limit of ৳${perTxLimit.toLocaleString()}.` },
                    { status: 400 }
                );
            }

            const currentBalance = Number(account.balance) || 0;
            const currentHeld = Number(account.heldAmount) || 0;
            if (currentBalance - currentHeld < reqAmount) {
                return NextResponse.json(
                    { success: false, message: 'Insufficient available balance (after accounting for pending holds).' },
                    { status: 400 }
                );
            }

            await db.collection('accounts').updateOne(
                { _id: account._id },
                { $inc: { heldAmount: reqAmount }, $set: { updatedAt: new Date() } }
            );
        }

        const now = new Date();
        const reqId = `${type === 'Deposit' ? 'DEP' : 'WDR'}-${Date.now().toString().slice(-6)}`;
        const newReq = {
            requestId: reqId,
            type,
            userId: session.userId,
            customerName: session.name || session.username,
            accountNumber: account.accountNumber,
            accountType: account.accountType,
            amount: reqAmount,
            method,
            description: (description || `Simulated ${type} Request`).trim(),
            status: 'Pending',
            priority: reqAmount >= 100000 ? 'High' : 'Normal',
            timeline: [
                {
                    action: 'SUBMITTED',
                    actor: session.username,
                    actorRole: 'Customer',
                    note: `${type} request submitted for review`,
                    timestamp: now,
                },
            ],
            createdAt: now,
            updatedAt: now,
        };

        const insertRes = await db.collection('bankingRequests').insertOne(newReq);

        await db.collection('notifications').insertOne({
            userId: session.userId,
            title: `${type} Request Submitted for Review`,
            message: `Your ${type.toLowerCase()} request (${reqId}) for ৳${reqAmount.toLocaleString()} is pending review.`,
            category: 'REQUEST',
            href: type === 'Withdrawal' ? '/customer/withdraw' : '/customer/deposit',
            read: false,
            createdAt: now,
        });

        await notifyRoles(['Admin', 'Bank Staff'], {
            title: `New ${type} Request for Review`,
            message: `${session.name || session.username} submitted a ${type.toLowerCase()} request (${reqId}) for ৳${reqAmount.toLocaleString()}.`,
            category: 'APPROVAL',
            href: '/staff/requests',
        });

        await createAuditLog({
            actorId: session.userId,
            actorName: session.name || session.username,
            actorRole: 'CUSTOMER',
            action: `CUSTOMER_${type.toUpperCase()}_REQUESTED`,
            category: 'APPROVAL',
            targetType: 'BankingRequest',
            targetId: String(insertRes.insertedId),
            description: `Customer submitted ${type} request ${reqId} for ৳${reqAmount} on ${account.accountNumber}`,
        });

        return NextResponse.json({
            success: true,
            message: `${type} request submitted and is pending Staff/Admin approval.`,
            request: { ...newReq, _id: String(insertRes.insertedId) },
        }, { status: 201 });
    } catch (error) {
        console.error('Customer request POST error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
