import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { notifyUser } from '@/lib/notifications';

export async function POST(request, context) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id } = await context.params;
        const body = await request.json().catch(() => ({}));
        const { decisionNote } = body;

        const db = await getDb();
        const query = ObjectId.isValid(id) ? { $or: [{ _id: new ObjectId(id) }, { requestId: id }] } : { requestId: id };
        
        const reqDoc = await db.collection('bankingRequests').findOne(query);
        if (!reqDoc) {
            return NextResponse.json({ success: false, message: 'Banking request not found.' }, { status: 404 });
        }

        if (reqDoc.status !== 'Pending' && reqDoc.status !== 'PENDING') {
            return NextResponse.json({ success: false, message: `Request is already ${reqDoc.status}. Duplicate processing prevented.` }, { status: 400 });
        }

        // Find Account
        let accQuery = {};
        if (reqDoc.accountId) accQuery = { _id: new ObjectId(reqDoc.accountId) };
        else if (reqDoc.accountNumber) accQuery = { accountNumber: reqDoc.accountNumber };
        else accQuery = { customerName: reqDoc.customerName };

        const account = await db.collection('accounts').findOne(accQuery);
        if (!account) {
            return NextResponse.json({ success: false, message: 'Linked bank account not found.' }, { status: 404 });
        }

        if (account.status === 'Frozen' || account.status === 'Closed') {
            return NextResponse.json({ success: false, message: `Cannot process: Account is currently ${account.status}.` }, { status: 400 });
        }

        const type = (reqDoc.type || reqDoc.category || '').toUpperCase();
        const amount = Number(reqDoc.amount);
        const now = new Date();
        const txId = `TXN-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

        if (type === 'WITHDRAWAL') {
            const currentBalance = typeof account.balance === 'number' ? account.balance : 0;
            const heldAmount = typeof account.heldAmount === 'number' ? account.heldAmount : 0;
            const availableBalance = currentBalance - heldAmount;

            if (availableBalance < amount) {
                return NextResponse.json({
                    success: false,
                    message: `Insufficient available funds! Available: ৳${availableBalance.toLocaleString()}, Requested: ৳${amount.toLocaleString()}`
                }, { status: 400 });
            }

            // Perform atomic debit and ledger entries
            await db.collection('accounts').updateOne(
                { _id: account._id, balance: { $gte: amount + heldAmount } },
                {
                    $inc: { balance: -amount, ledgerBalance: -amount },
                    $set: { updatedAt: now }
                }
            );

            // Record completed Transaction
            const txDoc = {
                transactionId: txId,
                type: 'Withdrawal',
                sourceAccountId: account._id,
                sourceAccountNumber: account.accountNumber,
                accountNumber: account.accountNumber,
                customerName: account.customerName || reqDoc.customerName,
                customerId: account.customerId || reqDoc.customerId,
                amount,
                fee: 0,
                currency: 'BDT',
                status: 'Successful',
                riskStatus: 'NORMAL',
                initiatedByType: 'Customer',
                description: reqDoc.description || 'Withdrawal approved by administrator',
                reference: reqDoc.requestId,
                approvedBy: session.username || session.email,
                createdAt: now,
                completedAt: now
            };
            await db.collection('transactions').insertOne(txDoc);

            // Double-entry ledger
            await db.collection('ledgerEntries').insertOne({
                ledgerId: `LED-${txId}-D`,
                transactionId: txId,
                accountId: account._id,
                accountNumber: account.accountNumber,
                entryType: 'DEBIT',
                amount,
                currency: 'BDT',
                description: `Approved withdrawal payout: ${reqDoc.requestId}`,
                createdAt: now
            });
        } else {
            // DEPOSIT
            await db.collection('accounts').updateOne(
                { _id: account._id },
                {
                    $inc: { balance: amount, ledgerBalance: amount },
                    $set: { updatedAt: now }
                }
            );

            // Record completed Transaction
            const txDoc = {
                transactionId: txId,
                type: 'Deposit',
                sourceAccountId: account._id,
                sourceAccountNumber: account.accountNumber,
                accountNumber: account.accountNumber,
                customerName: account.customerName || reqDoc.customerName,
                customerId: account.customerId || reqDoc.customerId,
                amount,
                fee: 0,
                currency: 'BDT',
                status: 'Successful',
                riskStatus: 'NORMAL',
                initiatedByType: 'Customer',
                description: reqDoc.description || 'Deposit approved by administrator',
                reference: reqDoc.requestId,
                approvedBy: session.username || session.email,
                createdAt: now,
                completedAt: now
            };
            await db.collection('transactions').insertOne(txDoc);

            // Double-entry ledger
            await db.collection('ledgerEntries').insertOne({
                ledgerId: `LED-${txId}-C`,
                transactionId: txId,
                accountId: account._id,
                accountNumber: account.accountNumber,
                entryType: 'CREDIT',
                amount,
                currency: 'BDT',
                description: `Approved deposit credit: ${reqDoc.requestId}`,
                createdAt: now
            });
        }

        // Mark Banking Request as Approved
        await db.collection('bankingRequests').updateOne(
            { _id: reqDoc._id },
            {
                $set: {
                    status: 'Approved',
                    reviewedAt: now,
                    reviewedBy: session.username || session.email,
                    reviewedByRole: session.role,
                    decisionNote: decisionNote || 'Request details verified and approved.',
                    transactionId: txId,
                    updatedAt: now
                }
            }
        );

        // Audit Log
        await db.collection('auditLogs').insertOne({
            actor: session.username || session.email,
            role: session.role,
            action: `${type}_REQUEST_APPROVED`,
            event: `Approved ${type} request ${reqDoc.requestId} for ৳${amount.toLocaleString()} on account ${account.accountNumber}`,
            recordRef: reqDoc.requestId,
            severity: 'Info',
            createdAt: now
        });

        await notifyUser({
            userId: reqDoc.userId || account.userId,
            title: `${type === 'WITHDRAWAL' ? 'Withdrawal' : 'Deposit'} Request Approved`,
            message: `Your ${type.toLowerCase()} request (${reqDoc.requestId}) for ৳${amount.toLocaleString()} on account ${account.accountNumber} has been approved and posted (${txId}).`,
            category: 'APPROVAL',
            href: '/customer/transactions',
        });

        return NextResponse.json({
            success: true,
            message: `${type === 'WITHDRAWAL' ? 'Withdrawal' : 'Deposit'} request approved successfully. Funds have been posted.`,
            transactionId: txId
        });
    } catch (err) {
        console.error('Approve request error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
