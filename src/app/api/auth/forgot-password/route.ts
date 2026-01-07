import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// POST /api/auth/forgot-password - Request password reset
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'MISSING_EMAIL', message: 'Email là bắt buộc' },
                },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({
                success: true,
                message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu',
            });
        }

        // Generate reset token (in production, store this and send via email)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // TODO: In production:
        // 1. Store resetToken hash in database
        // 2. Send email with reset link: /reset-password?token=...
        // For now, we'll just log it (remove in production!)
        console.log(`Password reset token for ${email}: ${resetToken}`);
        console.log(`Token expires at: ${resetTokenExpiry}`);

        return NextResponse.json({
            success: true,
            message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu',
            // Only for development - remove in production!
            ...(process.env.NODE_ENV === 'development' && {
                debug: { resetToken, expiresAt: resetTokenExpiry }
            }),
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
