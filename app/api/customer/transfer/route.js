import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSession, hasRole, isAccountActive, comparePin } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { createAuditLog } from '@/lib/audit';

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
            fromAccountNumber,
            toAccountNumber,
            amount,
            description = '',
            pin,
            idempotencyKey,
        } = body;

        const transferAmount = Number(amount);
        if (!fromAccountNumber || !toAccountNumber || !transferAmount || transferAmount <= 0 || isNaN(transferAmount)) {
            return NextResponse.json(
                { success: false, message: 'Valid source account, destination account, and positive amount are required.' },
                { status: 400 }
            );
        }

        if (fromAccountNumber.trim() === toAccountNumber.trim()) {
            return NextResponse.json(
                { success: false, message: 'Source and destination accounts cannot be the same.' },
                { status: 400 }
            );
        }

        if (!pin) {
            return NextResponse.json({ success: false, message: 'Transaction PIN is required.' }, { status: 400 });
        }

        const db = await getDb();

        // 1. Idempotency check
        if (idempotencyKey) {
            const existingTx = await db.collection('transactions').findOne({
                idempotencyKey,
                userId: session.userId,
            });
            if (existingTx) {
                return NextResponse.json({
                    success: true,
                    message: 'Transfer already processed.',
                    receipt: existingTx,
                    idempotent: true,
                });
            }
        }

        // 2. Verify PIN
        const user = await db.collection('users').findOne({ _id: new ObjectId(session.userId) });
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }
        if (!user.transactionPin) {
            return NextResponse.json(
                { success: false, message: 'Please configure your Transaction PIN in Profile & Security before transferring funds.' },
                { status: 400 }
            );
        }
        const pinValid = await comparePin(String(pin), user.transactionPin);
        if (!pinValid) {
            return NextResponse.json({ success: false, message: 'Invalid Transaction PIN.' }, { status: 401 });
        }

        // 3. Verify destination account exists and is Active
        const destAccount = await db.collection('accounts').findOne({
            accountNumber: toAccountNumber.trim(),
        });
        if (!destAccount) {
            return NextResponse.json({ success: false, message: 'Recipient account not found.' }, { status: 404 });
        }
        if (destAccount.status !== 'Active') {
            return NextResponse.json(
                { success: false, message: `Recipient account is currently ${destAccount.status} and cannot receive funds.` },
                { status: 400 }
            );
        }

        // 4. Verify source account ownership & limits
        const sourceCheck = await db.collection('accounts').findOne({
            accountNumber: fromAccountNumber.trim(),
            userId: session.userId,
        });
        if (!sourceCheck) {
            return NextResponse.json({ success: false, message: 'Source account not found or unauthorized.' }, { status: 403 });
        }
        if (sourceCheck.status !== 'Active') {
            return NextResponse.json(
                { success: false, message: `Source account is ${sourceCheck.status}. Transfers are disabled.` },
                { status: 400 }
            );
        }

        const perTxLimit = Number(sourceCheck.perTransactionLimit) || 500000;
        if (transferAmount > perTxLimit) {
            return NextResponse.json(
                { success: false, message: `Amount exceeds per-transaction limit of ৳${perTxLimit.toLocaleString()}.` },
                { status: 400 }
            );
        }

        // 5. Atomic debit checking available balance (balance - heldAmount >= transferAmount)
        const held = Number(sourceCheck.heldAmount) || 0;
        const debitedSource = await db.collection('accounts').findOneAndUpdate(
            {
                _id: sourceCheck._id,
                userId: session.userId,
                status: 'Active',
                balance: { $gte: transferAmount + held },
            },
            {
                $inc: { balance: -transferAmount },
                $set: { updatedAt: new Date() },
            },
            { returnDocument: 'after' }
        );

        if (!debitedSource) {
            return NextResponse.json(
                { success: false, message: 'Insufficient available balance for this transfer.' },
                { status: 400 }
            );
        }

        // 6. Credit destination account
        await db.collection('accounts').updateOne(
            { _id: destAccount._id },
            {
                $inc: { balance: transferAmount },
                $set: { updatedAt: new Date() },
            }
        );

        const recipientUser = await db.collection('users').findOne(
            { _id: new ObjectId(destAccount.userId) },
            { projection: { name: 1 } }
        );

        const now = new Date();
        const txId = `TRX-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

        const txDoc = {
            transactionId: txId,
            userId: session.userId,
            type: 'Transfer',
            status: 'Completed',
            amount: transferAmount,
            fromAccount: sourceCheck.accountNumber,
            toAccount: destAccount.accountNumber,
            accountNumber: sourceCheck.accountNumber,
            senderName: user.name,
            recipientName: recipientUser?.name || 'NestBank Customer',
            description: (description || 'Fund Transfer').trim(),
            initiatedBy: 'Customer',
            idempotencyKey: idempotencyKey || null,
            createdAt: now,
        };

        await db.collection('transactions').insertOne(txDoc);

        // Double-entry ledger records
        await db.collection('ledgerEntries').insertMany([
            {
                transactionId: txId,
                accountNumber: sourceCheck.accountNumber,
                entryType: 'DEBIT',
                amount: transferAmount,
                balanceAfter: debitedSource.balance,
                createdAt: now,
            },
            {
                transactionId: txId,
                accountNumber: destAccount.accountNumber,
                entryType: 'CREDIT',
                amount: transferAmount,
                balanceAfter: (Number(destAccount.balance) || 0) + transferAmount,
                createdAt: now,
            },
        ]);

        // Notifications for sender & receiver
        await db.collection('notifications').insertMany([
            {
                userId: session.userId,
                title: 'Transfer Completed',
                message: `Transferred ৳${transferAmount.toLocaleString()} from ${sourceCheck.accountNumber} to ${destAccount.accountNumber}.`,
                category: 'TRANSFER',
                read: false,
                createdAt: now,
            },
            {
                userId: destAccount.userId,
                title: 'Funds Received',
                message: `Received ৳${transferAmount.toLocaleString()} in account ${destAccount.accountNumber} from ${user.name}.`,
                category: 'TRANSFER',
                read: false,
                createdAt: now,
            },
        ]);

        await createAuditLog({
            actorId: session.userId,
            actorName: user.name || session.username,
            actorRole: 'CUSTOMER',
            action: 'CUSTOMER_TRANSFER_COMPLETED',
            category: 'TRANSACTION',
            targetType: 'Transaction',
            targetId: txId,
            description: `Customer transfer of ৳${transferAmount} from ${sourceCheck.accountNumber} to ${destAccount.accountNumber}`,
        });

        return NextResponse.json({
            success: true,
            message: 'Transfer completed successfully.',
            receipt: txDoc,
        });
    } catch (error) {
        console.error('Customer transfer error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
