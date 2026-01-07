import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { updateRoomSchema } from '@/lib/validators';
import { ZodError } from 'zod';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/rooms/[id] - Get room details
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const room = await prisma.room.findUnique({
            where: { id },
            include: {
                motel: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        latitude: true,
                        longitude: true,
                        owner: {
                            select: {
                                id: true,
                                fullName: true,
                                phone: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                images: {
                    orderBy: { sortOrder: 'asc' },
                },
                utilities: {
                    include: { utility: true },
                },
                roomServices: {
                    include: { service: true },
                },
                contracts: {
                    where: { status: 'ACTIVE' },
                    include: {
                        tenant: {
                            select: {
                                id: true,
                                fullName: true,
                                phone: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        reviews: true,
                        maintenanceRequests: { where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } },
                    },
                },
            },
        });

        if (!room) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy phòng' },
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                ...room,
                utilities: room.utilities.map((u) => u.utility),
                services: room.roomServices.map((rs) => ({
                    ...rs.service,
                    customPrice: rs.customPrice,
                })),
                currentContract: room.contracts[0] || null,
            },
        });
    } catch (error) {
        console.error('Get room error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// PUT /api/rooms/[id] - Update room
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'STAFF', 'ADMIN']);
        if (error) return error;

        const { id } = await params;

        // Check room exists and user has access
        const existingRoom = await prisma.room.findUnique({
            where: { id },
            include: {
                motel: { select: { ownerId: true } },
            },
        });

        if (!existingRoom) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy phòng' },
                },
                { status: 404 }
            );
        }

        if (user!.role === 'LANDLORD' && existingRoom.motel.ownerId !== user!.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền sửa phòng này' },
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validated = updateRoomSchema.parse(body);

        const { utilities, ...roomData } = validated;

        // Update room
        const room = await prisma.room.update({
            where: { id },
            data: roomData,
            include: {
                images: true,
                utilities: {
                    include: { utility: true },
                },
            },
        });

        // Update utilities if provided
        if (utilities) {
            // Delete existing utilities
            await prisma.roomUtility.deleteMany({ where: { roomId: id } });
            // Add new utilities
            await prisma.roomUtility.createMany({
                data: utilities.map((utilityId: string) => ({
                    roomId: id,
                    utilityId,
                })),
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                ...room,
                utilities: room.utilities.map((u) => u.utility),
            },
            message: 'Cập nhật phòng thành công',
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

        console.error('Update room error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// DELETE /api/rooms/[id] - Delete room
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'ADMIN']);
        if (error) return error;

        const { id } = await params;

        const existingRoom = await prisma.room.findUnique({
            where: { id },
            include: {
                motel: { select: { id: true, ownerId: true } },
                contracts: { where: { status: 'ACTIVE' } },
            },
        });

        if (!existingRoom) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy phòng' },
                },
                { status: 404 }
            );
        }

        if (user!.role === 'LANDLORD' && existingRoom.motel.ownerId !== user!.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xóa phòng này' },
                },
                { status: 403 }
            );
        }

        if (existingRoom.contracts.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'HAS_ACTIVE_CONTRACT', message: 'Không thể xóa phòng đang có hợp đồng' },
                },
                { status: 400 }
            );
        }

        // Delete room
        await prisma.room.delete({ where: { id } });

        // Update motel room count
        await prisma.motel.update({
            where: { id: existingRoom.motel.id },
            data: {
                totalRooms: { decrement: 1 },
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Xóa phòng thành công',
        });
    } catch (error) {
        console.error('Delete room error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
