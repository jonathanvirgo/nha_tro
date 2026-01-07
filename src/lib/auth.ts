import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

type Role = 'ADMIN' | 'LANDLORD' | 'TENANT' | 'STAFF' | 'USER';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface JWTPayload {
    userId: string;
    email: string;
    role: Role;
}

export function generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function comparePassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export function extractTokenFromHeader(
    authHeader: string | null
): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.slice(7);
}

export async function getCurrentUser(request: Request) {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
        return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            phone: true,
            avatarUrl: true,
        },
    });

    return user;
}

export function unauthorizedResponse(message = 'Unauthorized') {
    return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message } },
        { status: 401 }
    );
}

export function forbiddenResponse(message = 'Forbidden') {
    return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message } },
        { status: 403 }
    );
}

export function hasRole(userRole: Role, allowedRoles: Role[]): boolean {
    return allowedRoles.includes(userRole);
}

// Middleware helper to check authentication
export async function withAuth(
    request: Request,
    allowedRoles?: Role[]
): Promise<{ user: Awaited<ReturnType<typeof getCurrentUser>>; error?: NextResponse }> {
    const user = await getCurrentUser(request);

    if (!user) {
        return { user: null, error: unauthorizedResponse('Vui lòng đăng nhập') };
    }

    if (allowedRoles && !hasRole(user.role, allowedRoles)) {
        return { user, error: forbiddenResponse('Bạn không có quyền thực hiện hành động này') };
    }

    return { user };
}
