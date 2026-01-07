import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { z } from 'zod';

const updateServiceSchema = z.object({
    name: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    unit: z.string().optional(),
    type: z.enum(['FIXED', 'USAGE', 'PEOPLE']).optional(),
    isRequired: z.boolean().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/services/[id] - Get service details
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const service = await prisma.service.findUnique({
            where: { id },
            include: {
                motel: {
                    select: { id: true, name: true },
                },
                roomServices: {
                    include: {
                        room: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });

        if (!service) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy dịch vụ' },
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: service,
        });
    } catch (error) {
        console.error('Get service error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// PUT /api/services/[id] - Update service
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'ADMIN']);
        if (error) return error;

        const { id } = await params;

        const service = await prisma.service.findUnique({
            where: { id },
            include: { motel: { select: { ownerId: true } } },
        });

        if (!service) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy dịch vụ' },
                },
                { status: 404 }
            );
        }

        if (user!.role === 'LANDLORD' && service.motel.ownerId !== user!.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền sửa dịch vụ này' },
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validated = updateServiceSchema.parse(body);

        const updated = await prisma.service.update({
            where: { id },
            data: validated,
        });

        return NextResponse.json({
            success: true,
            data: updated,
            message: 'Cập nhật dịch vụ thành công',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu không hợp lệ', details: error.issues },
                },
                { status: 400 }
            );
        }

        console.error('Update service error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// DELETE /api/services/[id] - Delete service
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'ADMIN']);
        if (error) return error;

        const { id } = await params;

        const service = await prisma.service.findUnique({
            where: { id },
            include: { motel: { select: { ownerId: true } } },
        });

        if (!service) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy dịch vụ' },
                },
                { status: 404 }
            );
        }

        if (user!.role === 'LANDLORD' && service.motel.ownerId !== user!.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xóa dịch vụ này' },
                },
                { status: 403 }
            );
        }

        await prisma.service.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'Xóa dịch vụ thành công',
        });
    } catch (error) {
        console.error('Delete service error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
