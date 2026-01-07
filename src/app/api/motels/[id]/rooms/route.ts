import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { createRoomSchema } from '@/lib/validators';
import { ZodError } from 'zod';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/motels/[id]/rooms - List rooms in a motel
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id: motelId } = await params;
        const { searchParams } = new URL(request.url);

        const status = searchParams.get('status');
        const floor = searchParams.get('floor');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: Record<string, any> = { motelId };

        if (status) where.status = status;
        if (floor) where.floor = parseInt(floor);
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        const [rooms, total] = await Promise.all([
            prisma.room.findMany({
                where,
                include: {
                    images: {
                        orderBy: { sortOrder: 'asc' },
                    },
                    utilities: {
                        include: { utility: true },
                    },
                    _count: {
                        select: {
                            contracts: { where: { status: 'ACTIVE' } },
                        },
                    },
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: [{ floor: 'asc' }, { name: 'asc' }],
            }),
            prisma.room.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: rooms.map((room) => ({
                ...room,
                hasActiveContract: room._count.contracts > 0,
                utilities: room.utilities.map((u) => u.utility),
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get rooms error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// POST /api/motels/[id]/rooms - Create a new room
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'STAFF', 'ADMIN']);
        if (error) return error;

        const { id: motelId } = await params;

        // Verify motel exists and user has access
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
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền thêm phòng cho nhà trọ này' },
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validated = createRoomSchema.parse(body);

        // Extract utilities from validated data
        const { utilities, ...roomData } = validated;

        // Create room
        const room = await prisma.room.create({
            data: {
                ...roomData,
                motelId,
                utilities: utilities
                    ? {
                        create: utilities.map((utilityId: string) => ({
                            utilityId,
                        })),
                    }
                    : undefined,
            },
            include: {
                images: true,
                utilities: {
                    include: { utility: true },
                },
            },
        });

        // Update motel room count
        await prisma.motel.update({
            where: { id: motelId },
            data: {
                totalRooms: { increment: 1 },
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    ...room,
                    utilities: room.utilities.map((u) => u.utility),
                },
                message: 'Tạo phòng thành công',
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

        console.error('Create room error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
