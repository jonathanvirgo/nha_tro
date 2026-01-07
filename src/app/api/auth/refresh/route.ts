import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, generateAccessToken, generateRefreshToken, JWTPayload } from '@/lib/auth';

// POST /api/auth/refresh - Refresh access token
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { refreshToken } = body;

        if (!refreshToken) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'MISSING_TOKEN', message: 'Refresh token là bắt buộc' },
                },
                { status: 400 }
            );
        }

        // Verify refresh token
        const payload = verifyToken(refreshToken);
        if (!payload) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'INVALID_TOKEN', message: 'Refresh token không hợp lệ' },
                },
                { status: 401 }
            );
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                role: true,
                fullName: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'USER_NOT_FOUND', message: 'Người dùng không tồn tại' },
                },
                { status: 401 }
            );
        }

        // Generate new tokens with correct payload structure
        const tokenPayload: JWTPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const newAccessToken = generateAccessToken(tokenPayload);
        const newRefreshToken = generateRefreshToken(tokenPayload);

        return NextResponse.json({
            success: true,
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
