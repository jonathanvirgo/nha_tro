import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { updateMotelSchema } from '@/lib/validators';
import { ZodError } from 'zod';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/motels/[id] - Get motel details
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const motel = await prisma.motel.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                        avatarUrl: true,
                    },
                },
                images: {
                    orderBy: { sortOrder: 'asc' },
                },
                services: true,
                rooms: {
                    include: {
                        images: {
                            where: { isPrimary: true },
                            take: 1,
                        },
                    },
                },
                _count: {
                    select: {
                        rooms: true,
                        reviews: true,
                    },
                },
            },
        });

        if (!motel) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy nhà trọ' },
                },
                { status: 404 }
            );
        }

        // Calculate room stats
        const roomStats = await prisma.room.groupBy({
            by: ['status'],
            where: { motelId: id },
            _count: { id: true },
        });

        return NextResponse.json({
            success: true,
            data: {
                ...motel,
                roomStats: roomStats.reduce(
                    (acc, stat) => ({
                        ...acc,
                        [stat.status.toLowerCase()]: stat._count.id,
                    }),
                    {}
                ),
            },
        });
    } catch (error) {
        console.error('Get motel error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// PUT /api/motels/[id] - Update motel
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'STAFF', 'ADMIN']);
        if (error) return error;

        const { id } = await params;

        // Check ownership
        const existingMotel = await prisma.motel.findUnique({
            where: { id },
            select: { ownerId: true },
        });

        if (!existingMotel) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy nhà trọ' },
                },
                { status: 404 }
            );
        }

        if (user!.role === 'LANDLORD' && existingMotel.ownerId !== user!.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền sửa nhà trọ này' },
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validated = updateMotelSchema.parse(body);

        const motel = await prisma.motel.update({
            where: { id },
            data: validated,
            include: {
                images: true,
                services: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: motel,
            message: 'Cập nhật nhà trọ thành công',
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

        console.error('Update motel error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// DELETE /api/motels/[id] - Delete motel (soft delete)
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'ADMIN']);
        if (error) return error;

        const { id } = await params;

        // Check ownership
        const existingMotel = await prisma.motel.findUnique({
            where: { id },
            select: { ownerId: true },
        });

        if (!existingMotel) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy nhà trọ' },
                },
                { status: 404 }
            );
        }

        if (user!.role === 'LANDLORD' && existingMotel.ownerId !== user!.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xóa nhà trọ này' },
                },
                { status: 403 }
            );
        }

        // Soft delete - change status to INACTIVE
        await prisma.motel.update({
            where: { id },
            data: { status: 'INACTIVE' },
        });

        return NextResponse.json({
            success: true,
            message: 'Xóa nhà trọ thành công',
        });
    } catch (error) {
        console.error('Delete motel error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
