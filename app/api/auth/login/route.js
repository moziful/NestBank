import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { comparePassword, setSessionCookie, checkRateLimit, resetRateLimit } from '@/lib/auth';

export async function POST(request) {
    try {
        const body = await request.json();
        const { usernameOrEmail, password } = body;

        if (!usernameOrEmail || !password) {
            return NextResponse.json(
                { success: false, message: 'Username/email and password are required' },
                { status: 400 }
            );
        }

        const identifier = usernameOrEmail.trim().toLowerCase();
        const rateLimitKey = `login_${identifier}`;
        const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Too many login attempts. Account temporarily locked. Please try again in ${rateLimit.waitMinutes} minutes.`,
                },
                { status: 429 }
            );
        }

        const db = await getDb();
        const user = await db.collection('users').findOne({
            $or: [
                { email: identifier },
                { username: identifier },
            ],
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        if (user.status && user.status !== 'Active') {
            return NextResponse.json(
                { success: false, message: `Your account is ${user.status.toLowerCase()}. Please contact bank support.` },
                { status: 403 }
            );
        }

        // Reset rate limit on success
        resetRateLimit(rateLimitKey);

        // Set session cookie
        await setSessionCookie(user);

        // Role-specific redirect determination
        let redirectPath = '/overview';
        if (user.role === 'Admin') {
            redirectPath = '/admin/overview';
        } else if (user.role === 'Bank Staff') {
            redirectPath = '/staff/overview';
        }

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id.toString(),
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status,
                hasPin: !!user.transactionPin,
            },
            redirectPath,
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
