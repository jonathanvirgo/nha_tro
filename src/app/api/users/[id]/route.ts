import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { z } from 'zod';

const updateUserSchema = z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().optional().nullable(),
    role: z.enum(['ADMIN', 'LANDLORD', 'TENANT', 'STAFF', 'USER']).optional(),
    emailVerified: z.boolean().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/users/[id] - Get user by ID (Admin only)
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { user: admin, error } = await withAuth(request, ['ADMIN']);
        if (error) return error;

        const { id } = await params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                role: true,
                avatarUrl: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        ownedMotels: true,
                        contracts: true,
                        appointments: true,
                        maintenanceRequests: true,
                        reviews: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy người dùng' } },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' } },
            { status: 500 }
        );
    }
}

// PUT /api/users/[id] - Update user (Admin only)
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { error } = await withAuth(request, ['ADMIN']);
        if (error) return error;

        const { id } = await params;
        const body = await request.json();
        const validated = updateUserSchema.parse(body);

        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy người dùng' } },
                { status: 404 }
            );
        }

        const updated = await prisma.user.update({
            where: { id },
            data: validated,
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                role: true,
                emailVerified: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: updated,
            message: 'Cập nhật người dùng thành công',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu không hợp lệ', details: error.issues } },
                { status: 400 }
            );
        }

        console.error('Update user error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' } },
            { status: 500 }
        );
    }
}

// DELETE /api/users/[id] - Delete user (Admin only)
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { user: admin, error } = await withAuth(request, ['ADMIN']);
        if (error) return error;

        const { id } = await params;

        // Prevent self-deletion
        if (id === admin!.id) {
            return NextResponse.json(
                { success: false, error: { code: 'SELF_DELETE', message: 'Không thể xóa chính mình' } },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy người dùng' } },
                { status: 404 }
            );
        }

        await prisma.user.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'Xóa người dùng thành công',
        });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' } },
            { status: 500 }
        );
    }
}
