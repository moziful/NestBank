import { NextResponse } from 'next/server';

// Routes and their role requirements
const roleRoutePrefixes = [
    { prefix: '/admin', roles: ['Admin'] },
    { prefix: '/staff', roles: ['Admin', 'Bank Staff'] },
    { prefix: '/customer', roles: ['Customer'] },
    { prefix: '/overview', roles: ['Customer'] },
    { prefix: '/my-accounts', roles: ['Customer'] },
    { prefix: '/transfer-money', roles: ['Customer'] },
    { prefix: '/transactions', roles: ['Customer'] },
    { prefix: '/deposit', roles: ['Customer'] },
    { prefix: '/withdraw', roles: ['Customer'] },
    { prefix: '/statements', roles: ['Customer'] },
    { prefix: '/profile-security', roles: ['Customer'] },
];

const publicRoutes = ['/login', '/register'];

// Decode JWT payload without external heavy library for edge compatibility
function decodeJwtPayload(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = Buffer.from(payloadBase64, 'base64').toString('utf8');
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Ignore static files, images, favicon, api routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get('nestbank_session')?.value;
    const session = token ? decodeJwtPayload(token) : null;
    const isSessionValid = session && (!session.exp || session.exp * 1000 > Date.now());

    // 1. If user is accessing login or register while already logged in and active
    if (publicRoutes.includes(pathname)) {
        if (isSessionValid && session.status === 'Active') {
            if (session.role === 'Admin') {
                return NextResponse.redirect(new URL('/admin/overview', request.url));
            } else if (session.role === 'Bank Staff') {
                return NextResponse.redirect(new URL('/staff/overview', request.url));
            } else {
                return NextResponse.redirect(new URL('/overview', request.url));
            }
        }
        return NextResponse.next();
    }

    // 2. Root path redirect
    if (pathname === '/') {
        if (!isSessionValid) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        if (session.role === 'Admin') {
            return NextResponse.redirect(new URL('/admin/overview', request.url));
        } else if (session.role === 'Bank Staff') {
            return NextResponse.redirect(new URL('/staff/overview', request.url));
        } else {
            return NextResponse.redirect(new URL('/overview', request.url));
        }
    }

    // 3. Check role-restricted routes
    for (const rule of roleRoutePrefixes) {
        if (pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)) {
            if (!isSessionValid) {
                const loginUrl = new URL('/login', request.url);
                loginUrl.searchParams.set('callbackUrl', pathname);
                return NextResponse.redirect(loginUrl);
            }

            // Account status check
            if (session.status !== 'Active') {
                const loginUrl = new URL('/login', request.url);
                loginUrl.searchParams.set('error', 'suspended');
                return NextResponse.redirect(loginUrl);
            }

            // Role match check
            const allowed = rule.roles.map((r) => r.toLowerCase());
            if (!allowed.includes(session.role?.toLowerCase())) {
                // Redirect user to their own role's dashboard if attempting unauthorized route
                if (session.role === 'Admin') {
                    return NextResponse.redirect(new URL('/admin/overview', request.url));
                } else if (session.role === 'Bank Staff') {
                    return NextResponse.redirect(new URL('/staff/overview', request.url));
                } else {
                    return NextResponse.redirect(new URL('/overview', request.url));
                }
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
