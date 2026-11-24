import { NextResponse } from 'next/server';
import { getSession, hashPin, comparePin, comparePassword } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        if (session.status !== 'Active') {
            return NextResponse.json({ success: false, message: 'Account is not active' }, { status: 403 });
        }

        const body = await request.json();
        const { currentPassword, oldPin, newPin } = body;

        if (!newPin || !/^\d{4,6}$/.test(newPin)) {
            return NextResponse.json(
                { success: false, message: 'PIN must be between 4 and 6 digits' },
                { status: 400 }
            );
        }

        const db = await getDb();
        const user = await db.collection('users').findOne({ _id: new ObjectId(session.userId) });

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Must verify current password OR existing PIN to configure/update PIN
        if (user.transactionPin) {
            let verified = false;
            if (oldPin && (await comparePin(oldPin, user.transactionPin))) {
                verified = true;
            } else if (currentPassword && (await comparePassword(currentPassword, user.password))) {
                verified = true;
            }

            if (!verified) {
                return NextResponse.json(
                    { success: false, message: 'Incorrect current password or old PIN' },
                    { status: 400 }
                );
            }
        } else {
            // First time setting PIN: verify current account password
            if (!currentPassword || !(await comparePassword(currentPassword, user.password))) {
                return NextResponse.json(
                    { success: false, message: 'Please provide valid account password to set up PIN' },
                    { status: 400 }
                );
            }
        }

        const hashedPin = await hashPin(newPin);
        await db.collection('users').updateOne(
            { _id: new ObjectId(session.userId) },
            {
                $set: {
                    transactionPin: hashedPin,
                    hasTransactionPin: true,
                    updatedAt: new Date(),
                },
            }
        );

        return NextResponse.json({
            success: true,
            message: 'Transaction PIN configured successfully',
        });
    } catch (error) {
        console.error('PIN configuration error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
