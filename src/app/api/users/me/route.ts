import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { updateUserSchema } from '@/lib/validators';
import { ZodError } from 'zod';

// GET /api/users/me - Get current user profile
export async function GET(request: Request) {
    try {
        const user = await getCurrentUser(request);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'UNAUTHORIZED', message: 'Vui lòng đăng nhập' },
                },
                { status: 401 }
            );
        }

        const fullUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                phone: true,
                avatarUrl: true,
                identityCard: true,
                dateOfBirth: true,
                gender: true,
                permanentAddress: true,
                occupation: true,
                workplace: true,
                emailVerified: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: fullUser,
        });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// PUT /api/users/me - Update current user profile
export async function PUT(request: Request) {
    try {
        const user = await getCurrentUser(request);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'UNAUTHORIZED', message: 'Vui lòng đăng nhập' },
                },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validated = updateUserSchema.parse(body);

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                ...(validated.fullName && { fullName: validated.fullName }),
                ...(validated.phone !== undefined && { phone: validated.phone }),
                ...(validated.avatarUrl !== undefined && { avatarUrl: validated.avatarUrl }),
                ...(validated.dateOfBirth !== undefined && {
                    dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
                }),
                ...(validated.identityCard !== undefined && { identityCard: validated.identityCard }),
                ...(validated.gender !== undefined && { gender: validated.gender }),
                ...(validated.permanentAddress !== undefined && { permanentAddress: validated.permanentAddress }),
                ...(validated.occupation !== undefined && { occupation: validated.occupation }),
                ...(validated.workplace !== undefined && { workplace: validated.workplace }),
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                phone: true,
                avatarUrl: true,
                identityCard: true,
                dateOfBirth: true,
                gender: true,
                permanentAddress: true,
                occupation: true,
                workplace: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: updatedUser,
            message: 'Cập nhật thông tin thành công',
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

        console.error('Update user error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
