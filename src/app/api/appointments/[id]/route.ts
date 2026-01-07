import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { updateAppointmentStatusSchema } from '@/lib/validators';
import { ZodError } from 'zod';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/appointments/[id] - Get appointment details
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { id } = await params;

        const appointment = await prisma.appointment.findUnique({
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

        if (!appointment) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy lịch hẹn' },
                },
                { status: 404 }
            );
        }

        // Check access
        const isGuest = appointment.userId === user!.id ||
            (appointment.guestPhone && appointment.guestEmail);
        const isLandlord = appointment.room.motel.owner.id === user!.id;
        const isAdmin = user!.role === 'ADMIN';

        if (!isGuest && !isLandlord && !isAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xem lịch hẹn này' },
                },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        console.error('Get appointment error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// PUT /api/appointments/[id] - Update appointment status
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { id } = await params;
        const body = await request.json();
        const validated = updateAppointmentStatusSchema.parse(body);

        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                room: {
                    include: {
                        motel: { select: { ownerId: true } },
                    },
                },
            },
        });

        if (!appointment) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy lịch hẹn' },
                },
                { status: 404 }
            );
        }

        const isLandlord = appointment.room.motel.ownerId === user!.id;
        const isAdmin = user!.role === 'ADMIN';
        const isOwner = appointment.userId === user!.id;

        // Only landlord can confirm
        if (validated.status === 'CONFIRMED' && !isLandlord && !isAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Chỉ chủ nhà mới có thể xác nhận lịch hẹn' },
                },
                { status: 403 }
            );
        }

        // Only landlord or owner can cancel
        if (validated.status === 'CANCELLED' && !isLandlord && !isAdmin && !isOwner) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền hủy lịch hẹn này' },
                },
                { status: 403 }
            );
        }

        const updated = await prisma.appointment.update({
            where: { id },
            data: {
                status: validated.status,
                note: validated.note || appointment.note,
            },
            include: {
                room: {
                    select: {
                        id: true,
                        name: true,
                        motel: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });

        const message = validated.status === 'CONFIRMED'
            ? 'Đã xác nhận lịch hẹn'
            : validated.status === 'CANCELLED'
                ? 'Đã hủy lịch hẹn'
                : validated.status === 'COMPLETED'
                    ? 'Đã hoàn thành lịch hẹn'
                    : 'Cập nhật lịch hẹn thành công';

        return NextResponse.json({
            success: true,
            data: updated,
            message,
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

        console.error('Update appointment error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// DELETE /api/appointments/[id] - Delete appointment
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { id } = await params;

        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                room: {
                    include: {
                        motel: { select: { ownerId: true } },
                    },
                },
            },
        });

        if (!appointment) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy lịch hẹn' },
                },
                { status: 404 }
            );
        }

        const isOwner = appointment.userId === user!.id;
        const isLandlord = appointment.room.motel.ownerId === user!.id;
        const isAdmin = user!.role === 'ADMIN';

        if (!isOwner && !isLandlord && !isAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xóa lịch hẹn này' },
                },
                { status: 403 }
            );
        }

        await prisma.appointment.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'Xóa lịch hẹn thành công',
        });
    } catch (error) {
        console.error('Delete appointment error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
