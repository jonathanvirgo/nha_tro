import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { createMaintenanceSchema, updateMaintenanceStatusSchema } from '@/lib/validators';
import { ZodError } from 'zod';

// GET /api/maintenance-requests - List maintenance requests
export async function GET(request: Request) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const roomId = searchParams.get('roomId');
        const motelId = searchParams.get('motelId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: Record<string, any> = {};

        // Filter based on role
        if (user!.role === 'TENANT') {
            where.requesterId = user!.id;
        } else if (user!.role === 'LANDLORD') {
            where.room = { motel: { ownerId: user!.id } };
        }

        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (roomId) where.roomId = roomId;
        if (motelId) {
            where.room = { ...where.room, motelId };
        }

        const [requests, total] = await Promise.all([
            prisma.maintenanceRequest.findMany({
                where,
                include: {
                    room: {
                        select: {
                            id: true,
                            name: true,
                            floor: true,
                            motel: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    requester: {
                        select: {
                            id: true,
                            fullName: true,
                            phone: true,
                        },
                    },
                    assignedTo: {
                        select: {
                            id: true,
                            fullName: true,
                            phone: true,
                        },
                    },
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: [
                    { priority: 'desc' },
                    { createdAt: 'desc' },
                ],
            }),
            prisma.maintenanceRequest.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: requests,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get maintenance requests error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// POST /api/maintenance-requests - Create a maintenance request
export async function POST(request: Request) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const body = await request.json();
        const validated = createMaintenanceSchema.parse(body);

        // Check room exists
        const room = await prisma.room.findUnique({
            where: { id: validated.roomId },
            select: { id: true },
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

        const maintenanceRequest = await prisma.maintenanceRequest.create({
            data: {
                roomId: validated.roomId,
                requesterId: user!.id,
                title: validated.title,
                description: validated.description,
                priority: validated.priority,
                images: validated.images || [],
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
                            },
                        },
                    },
                },
                requester: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: maintenanceRequest,
                message: 'Tạo yêu cầu sửa chữa thành công',
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

        console.error('Create maintenance request error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
