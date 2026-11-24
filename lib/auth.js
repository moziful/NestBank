import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'nest-bank-super-secure-secret-key-321!';
const SESSION_COOKIE_NAME = 'nestbank_session';
const SESSION_EXPIRY_SECONDS = 60 * 60 * 2; // 2 hours

export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}

export async function hashPin(pin) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(pin, salt);
}

export async function comparePin(pin, hash) {
    return bcrypt.compare(pin, hash);
}

export function createToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: SESSION_EXPIRY_SECONDS });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export async function getSession(request) {
    let token = null;
    if (request && request.cookies) {
        token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    } else {
        try {
            const cookieStore = await cookies();
            token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        } catch {
            return null;
        }
    }
    if (!token) return null;
    return verifyToken(token);
}

export async function setSessionCookie(user) {
    const cookieStore = await cookies();
    const payload = {
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role, // 'Admin', 'Bank Staff', or 'Customer'
        status: user.status || 'Active', // 'Active', 'Suspended', 'Pending'
    };
    const token = createToken(payload);
    
    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_EXPIRY_SECONDS,
    });

    return token;
}

export async function clearSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}

// Role Authorization Helpers
export function hasRole(session, allowedRoles) {
    if (!session || !session.role) return false;
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
    return normalizedAllowed.includes(session.role.toLowerCase());
}

export function isAccountActive(session) {
    return session && session.status === 'Active';
}

// Rate limiting in-memory storage (sliding/windowed counter)
const loginAttempts = new Map();

export function checkRateLimit(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const record = loginAttempts.get(key) || { attempts: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
        record.attempts = 1;
        record.resetTime = now + windowMs;
        loginAttempts.set(key, record);
        return { allowed: true, remaining: maxAttempts - 1 };
    }

    if (record.attempts >= maxAttempts) {
        const waitMinutes = Math.ceil((record.resetTime - now) / 60000);
        return { allowed: false, waitMinutes, remaining: 0 };
    }

    record.attempts += 1;
    loginAttempts.set(key, record);
    return { allowed: true, remaining: maxAttempts - record.attempts };
}

export function resetRateLimit(key) {
    loginAttempts.delete(key);
}
