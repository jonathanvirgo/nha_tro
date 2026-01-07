import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validators';
import { ZodError } from 'zod';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validated = registerSchema.parse(body);

        // Check if email exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validated.email },
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'EMAIL_EXISTS', message: 'Email đã được sử dụng' },
                },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(validated.password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: validated.email,
                password: hashedPassword,
                fullName: validated.fullName,
                phone: validated.phone,
                role: validated.role as 'USER' | 'LANDLORD',
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                phone: true,
            },
        });

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

        return NextResponse.json(
            {
                success: true,
                data: {
                    user,
                    accessToken,
                    refreshToken,
                },
                message: 'Đăng ký thành công',
            },
            { status: 201 }
        );
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

        console.error('Register error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi, vui lòng thử lại' },
            },
            { status: 500 }
        );
    }
}
