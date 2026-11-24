import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { hashPassword, hashPin } from '@/lib/auth';

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, username, email, password, pin, phone } = body;

        if (!name || !username || !email || !password) {
            return NextResponse.json(
                { success: false, message: 'Name, username, email, and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { success: false, message: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        if (pin && !/^\d{4,6}$/.test(pin)) {
            return NextResponse.json(
                { success: false, message: 'Transaction PIN must be 4 to 6 numeric digits' },
                { status: 400 }
            );
        }

        const db = await getDb();
        const existing = await db.collection('users').findOne({
            $or: [
                { email: email.trim().toLowerCase() },
                { username: username.trim().toLowerCase() },
            ],
        });

        if (existing) {
            return NextResponse.json(
                { success: false, message: 'Username or email already in use' },
                { status: 409 }
            );
        }

        const hashedPassword = await hashPassword(password);
        let hashedPin = null;
        if (pin) {
            hashedPin = await hashPin(pin);
        }

        const newUser = {
            name: name.trim(),
            username: username.trim().toLowerCase(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            transactionPin: hashedPin,
            hasTransactionPin: !!hashedPin,
            role: 'Customer', // Self registration is strictly Customer
            status: 'Active',
            phone: phone || '',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection('users').insertOne(newUser);

        // Also create a sample customer account record
        await db.collection('accounts').insertOne({
            userId: result.insertedId.toString(),
            accountNumber: 'NB' + Math.floor(1000000000 + Math.random() * 9000000000),
            accountType: 'Savings',
            balance: 1000.00,
            currency: 'USD',
            status: 'Active',
            createdAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: 'Registration successful! You can now log in.',
            userId: result.insertedId.toString(),
        }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
