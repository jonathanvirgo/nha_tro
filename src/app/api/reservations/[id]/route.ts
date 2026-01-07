import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/reservations/[id] - Get reservation details
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { id } = await params;

        const reservation = await prisma.reservation.findUnique({
            where: { id },
            include: {
                room: {
                    include: {
                        motel: {
                            select: {
                                id: true,
                                name: true,
                                address: true,
                                owner: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        phone: true,
                                    },
                                },
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                        email: true,
                    },
                },
            },
        });

        if (!reservation) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy đặt cọc' },
                },
                { status: 404 }
            );
        }

        // Check access
        const isOwner = reservation.userId === user!.id;
        const isLandlord = reservation.room.motel.owner.id === user!.id;
        const isAdmin = user!.role === 'ADMIN';

        if (!isOwner && !isLandlord && !isAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xem đặt cọc này' },
                },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            data: reservation,
        });
    } catch (error) {
        console.error('Get reservation error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// PUT /api/reservations/[id] - Update reservation status (confirm/cancel)
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { id } = await params;
        const body = await request.json();
        const { action } = body; // 'confirm', 'cancel', 'convert'

        const reservation = await prisma.reservation.findUnique({
            where: { id },
            include: {
                room: {
                    include: {
                        motel: { select: { ownerId: true } },
                    },
                },
            },
        });

        if (!reservation) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy đặt cọc' },
                },
                { status: 404 }
            );
        }

        const isOwner = reservation.userId === user!.id;
        const isLandlord = reservation.room.motel.ownerId === user!.id;
        const isAdmin = user!.role === 'ADMIN';

        switch (action) {
            case 'confirm':
                // Only landlord/admin can confirm
                if (!isLandlord && !isAdmin) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: { code: 'FORBIDDEN', message: 'Chỉ chủ nhà mới có thể xác nhận' },
                        },
                        { status: 403 }
                    );
                }

                await prisma.reservation.update({
                    where: { id },
                    data: { status: 'CONFIRMED' },
                });
                break;

            case 'cancel':
                // Owner or landlord can cancel
                if (!isOwner && !isLandlord && !isAdmin) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: { code: 'FORBIDDEN', message: 'Bạn không có quyền hủy đặt cọc này' },
                        },
                        { status: 403 }
                    );
                }

                await prisma.reservation.update({
                    where: { id },
                    data: {
                        status: 'CANCELLED',
                        cancelledAt: new Date(),
                    },
                });
                break;

            case 'convert':
                // Only landlord can convert to contract
                if (!isLandlord && !isAdmin) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: { code: 'FORBIDDEN', message: 'Chỉ chủ nhà mới có thể chuyển thành hợp đồng' },
                        },
                        { status: 403 }
                    );
                }

                if (reservation.status !== 'CONFIRMED') {
                    return NextResponse.json(
                        {
                            success: false,
                            error: { code: 'INVALID_STATUS', message: 'Đặt cọc chưa được xác nhận' },
                        },
                        { status: 400 }
                    );
                }

                await prisma.reservation.update({
                    where: { id },
                    data: { status: 'CONVERTED' },
                });
                break;

            default:
                return NextResponse.json(
                    {
                        success: false,
                        error: { code: 'INVALID_ACTION', message: 'Hành động không hợp lệ' },
                    },
                    { status: 400 }
                );
        }

        const updated = await prisma.reservation.findUnique({
            where: { id },
            include: {
                room: {
                    select: {
                        id: true,
                        name: true,
                        motel: { select: { id: true, name: true } },
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: updated,
            message: action === 'confirm'
                ? 'Xác nhận đặt cọc thành công'
                : action === 'cancel'
                    ? 'Hủy đặt cọc thành công'
                    : 'Đã chuyển thành hợp đồng',
        });
    } catch (error) {
        console.error('Update reservation error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
