import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { createReservationSchema } from '@/lib/validators';
import { ZodError } from 'zod';

// GET /api/reservations - List reservations
export async function GET(request: Request) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const roomId = searchParams.get('roomId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: Record<string, any> = {};

        // Filter based on role
        if (user!.role === 'USER' || user!.role === 'TENANT') {
            where.userId = user!.id;
        } else if (user!.role === 'LANDLORD') {
            where.room = { motel: { ownerId: user!.id } };
        }

        if (status) where.status = status;
        if (roomId) where.roomId = roomId;

        const [reservations, total] = await Promise.all([
            prisma.reservation.findMany({
                where,
                include: {
                    room: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            motel: {
                                select: {
                                    id: true,
                                    name: true,
                                    address: true,
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
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.reservation.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: reservations,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get reservations error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// POST /api/reservations - Create a reservation (deposit)
export async function POST(request: Request) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const body = await request.json();
        const validated = createReservationSchema.parse(body);

        // Check room exists and is available
        const room = await prisma.room.findUnique({
            where: { id: validated.roomId },
            include: {
                motel: { select: { ownerId: true } },
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

        if (room.status !== 'AVAILABLE') {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'ROOM_NOT_AVAILABLE', message: 'Phòng này không còn trống' },
                },
                { status: 400 }
            );
        }

        // Check for existing active reservation
        const existingReservation = await prisma.reservation.findFirst({
            where: {
                roomId: validated.roomId,
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
        });

        if (existingReservation) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'ALREADY_RESERVED', message: 'Phòng này đã có người đặt cọc' },
                },
                { status: 400 }
            );
        }

        // Create reservation
        const reservation = await prisma.reservation.create({
            data: {
                roomId: validated.roomId,
                userId: user!.id,
                depositAmount: validated.depositAmount,
                intendedStartDate: new Date(validated.intendedStartDate),
            },
            include: {
                room: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        motel: {
                            select: {
                                id: true,
                                name: true,
                                address: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: reservation,
                message: 'Đặt cọc thành công. Vui lòng thanh toán trong vòng 24 giờ.',
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

        console.error('Create reservation error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
