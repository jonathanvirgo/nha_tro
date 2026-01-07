import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { z } from 'zod';

const updateStatusSchema = z.object({
    status: z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'RESERVED']),
});

type RouteParams = { params: Promise<{ id: string }> };

// PUT /api/rooms/[id]/status - Update room status
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'STAFF', 'ADMIN']);
        if (error) return error;

        const { id } = await params;
        const body = await request.json();
        const validated = updateStatusSchema.parse(body);

        const room = await prisma.room.findUnique({
            where: { id },
            include: { motel: { select: { ownerId: true } } },
        });

        if (!room) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy phòng' } },
                { status: 404 }
            );
        }

        if (user!.role === 'LANDLORD' && room.motel.ownerId !== user!.id) {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền cập nhật phòng này' } },
                { status: 403 }
            );
        }

        // Check for active contracts if trying to set as AVAILABLE
        if (validated.status === 'AVAILABLE') {
            const activeContract = await prisma.contract.findFirst({
                where: {
                    roomId: id,
                    status: 'ACTIVE',
                },
            });

            if (activeContract) {
                return NextResponse.json(
                    { success: false, error: { code: 'HAS_CONTRACT', message: 'Phòng vẫn còn hợp đồng đang hoạt động' } },
                    { status: 400 }
                );
            }
        }

        const updated = await prisma.room.update({
            where: { id },
            data: { status: validated.status },
            select: {
                id: true,
                name: true,
                status: true,
                motel: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json({
            success: true,
            data: updated,
            message: `Cập nhật trạng thái phòng thành ${validated.status}`,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu không hợp lệ', details: error.issues } },
                { status: 400 }
            );
        }

        console.error('Update room status error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' } },
            { status: 500 }
        );
    }
}
