import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their required roles
const protectedRoutes = {
    '/admin': ['ADMIN', 'LANDLORD'],
    '/tenant': ['TENANT'],
};

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;

    // Check if route is protected
    const isAdminRoute = pathname.startsWith('/admin');
    const isTenantRoute = pathname.startsWith('/tenant');

    // If accessing protected route without token, redirect to login
    if ((isAdminRoute || isTenantRoute) && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If user is logged in and tries to access login/register, redirect to appropriate dashboard
    if (token && (pathname === '/login' || pathname === '/register')) {
        // Try to decode token to get role (simplified - in real app use JWT decode)
        // For now, redirect to home
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all paths except static files and API routes
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
};
