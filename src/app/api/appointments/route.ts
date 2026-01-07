import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { createAppointmentSchema } from '@/lib/validators';
import { ZodError } from 'zod';

// GET /api/appointments - List appointments
export async function GET(request: Request) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const date = searchParams.get('date');
        const roomId = searchParams.get('roomId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: Record<string, any> = {};

        // Filter based on role
        if (user!.role === 'LANDLORD') {
            where.room = { motel: { ownerId: user!.id } };
        } else if (user!.role === 'USER' || user!.role === 'TENANT') {
            where.userId = user!.id;
        }

        if (status) where.status = status;
        if (roomId) where.roomId = roomId;
        if (date) {
            const dateObj = new Date(date);
            const nextDay = new Date(dateObj);
            nextDay.setDate(nextDay.getDate() + 1);
            where.visitDate = { gte: dateObj, lte: nextDay };
        }

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where,
                include: {
                    room: {
                        select: {
                            id: true,
                            name: true,
                            floor: true,
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
                orderBy: { visitDate: 'asc' },
            }),
            prisma.appointment.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: appointments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// POST /api/appointments - Create a viewing appointment
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = createAppointmentSchema.parse(body);

        // Check room exists and is available
        const room = await prisma.room.findUnique({
            where: { id: validated.roomId },
            select: { id: true, status: true },
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

        if (room.status === 'RENTED') {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'ROOM_NOT_AVAILABLE', message: 'Phòng này đã được thuê' },
                },
                { status: 400 }
            );
        }

        // Check for existing appointment at same time
        const visitDate = new Date(validated.visitDate);
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                roomId: validated.roomId,
                visitDate: visitDate,
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
        });

        if (existingAppointment) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'TIME_CONFLICT', message: 'Đã có lịch hẹn trong khung giờ này' },
                },
                { status: 400 }
            );
        }

        // Create appointment
        const appointment = await prisma.appointment.create({
            data: {
                roomId: validated.roomId,
                visitDate: visitDate,
                guestName: validated.guestName,
                guestPhone: validated.guestPhone,
                guestEmail: validated.guestEmail,
                note: validated.note,
            },
            include: {
                room: {
                    select: {
                        id: true,
                        name: true,
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
                data: appointment,
                message: 'Đặt lịch xem phòng thành công',
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

        console.error('Create appointment error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
