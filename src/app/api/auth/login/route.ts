import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validators';
import { ZodError } from 'zod';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validated = loginSchema.parse(body);

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: validated.email },
        });

        if (!user || !user.password) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'INVALID_CREDENTIALS', message: 'Email hoặc mật khẩu không đúng' },
                },
                { status: 401 }
            );
        }

        // Compare password
        const isValidPassword = await comparePassword(validated.password, user.password);

        if (!isValidPassword) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'INVALID_CREDENTIALS', message: 'Email hoặc mật khẩu không đúng' },
                },
                { status: 401 }
            );
        }

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const refreshToken = generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    phone: user.phone,
                    avatarUrl: user.avatarUrl,
                },
                accessToken,
                refreshToken,
            },
            message: 'Đăng nhập thành công',
        });
    } catch (error) {
        if (error instanceof ZodError) {
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

        console.error('Login error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi, vui lòng thử lại' },
            },
            { status: 500 }
        );
    }
}
