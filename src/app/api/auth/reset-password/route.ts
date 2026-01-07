import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token là bắt buộc'),
    password: z
        .string()
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
        .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số'),
});

// POST /api/auth/reset-password - Reset password with token
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = resetPasswordSchema.parse(body);

        // TODO: In production:
        // 1. Verify token hash from database
        // 2. Check if token is expired
        // 3. Get user associated with token

        // For demo purposes, we'll accept a special test token in development
        if (process.env.NODE_ENV === 'development' && validated.token === 'test-reset-token') {
            // Demo: reset password for test user
            const hashedPassword = await hashPassword(validated.password);

            // Update the first user found (for testing only)
            const user = await prisma.user.findFirst();
            if (user) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { password: hashedPassword },
                });
            }

            return NextResponse.json({
                success: true,
                message: 'Mật khẩu đã được đặt lại thành công',
            });
        }

        // In production, validate the actual token
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INVALID_TOKEN', message: 'Token không hợp lệ hoặc đã hết hạn' },
            },
            { status: 400 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Dữ liệu không hợp lệ',
                        details: error.issues,
                    },
                },
                { status: 400 }
            );
        }

        console.error('Reset password error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
