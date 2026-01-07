import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { createServiceSchema } from '@/lib/validators';
import { ZodError } from 'zod';

type RouteParams = { params: Promise<{ motelId: string }> };

// GET /api/motels/[motelId]/services - List services for a motel
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { motelId } = await params;

        const services = await prisma.service.findMany({
            where: { motelId },
            orderBy: { createdAt: 'asc' },
        });

        return NextResponse.json({
            success: true,
            data: services,
        });
    } catch (error) {
        console.error('Get services error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// POST /api/motels/[motelId]/services - Create a new service
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'STAFF', 'ADMIN']);
        if (error) return error;

        const { motelId } = await params;

        // Verify motel access
        const motel = await prisma.motel.findUnique({
            where: { id: motelId },
            select: { ownerId: true },
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

        if (user!.role === 'LANDLORD' && motel.ownerId !== user!.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền thêm dịch vụ cho nhà trọ này' },
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validated = createServiceSchema.parse(body);

        const service = await prisma.service.create({
            data: {
                ...validated,
                motelId,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: service,
                message: 'Tạo dịch vụ thành công',
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

        console.error('Create service error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
