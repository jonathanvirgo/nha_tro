import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { updateMaintenanceStatusSchema } from '@/lib/validators';
import { ZodError } from 'zod';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/maintenance-requests/[id] - Get maintenance request details
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { id } = await params;

        const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
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
                requester: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                        email: true,
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
        });

        if (!maintenanceRequest) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy yêu cầu sửa chữa' },
                },
                { status: 404 }
            );
        }

        // Check access
        const isRequester = maintenanceRequest.requesterId === user!.id;
        const isLandlord = maintenanceRequest.room.motel.owner.id === user!.id;
        const isAssigned = maintenanceRequest.assignedToId === user!.id;
        const isAdmin = user!.role === 'ADMIN';

        if (!isRequester && !isLandlord && !isAssigned && !isAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xem yêu cầu này' },
                },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            data: maintenanceRequest,
        });
    } catch (error) {
        console.error('Get maintenance request error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// PUT /api/maintenance-requests/[id] - Update maintenance request
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { id } = await params;
        const body = await request.json();
        const validated = updateMaintenanceStatusSchema.parse(body);

        const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
            where: { id },
            include: {
                room: {
                    include: {
                        motel: { select: { ownerId: true } },
                    },
                },
            },
        });

        if (!maintenanceRequest) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy yêu cầu sửa chữa' },
                },
                { status: 404 }
            );
        }

        const isLandlord = maintenanceRequest.room.motel.ownerId === user!.id;
        const isAdmin = user!.role === 'ADMIN';
        const isStaff = user!.role === 'STAFF';

        // Only landlord/staff/admin can update status
        if (!isLandlord && !isAdmin && !isStaff) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền cập nhật yêu cầu này' },
                },
                { status: 403 }
            );
        }

        // Build update data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: Record<string, any> = {
            status: validated.status,
        };

        if (validated.assignedToId) {
            updateData.assignedToId = validated.assignedToId;
        }

        if (validated.estimatedCost !== undefined) {
            updateData.estimatedCost = validated.estimatedCost;
        }

        if (validated.actualCost !== undefined) {
            updateData.actualCost = validated.actualCost;
        }

        if (validated.notes) {
            updateData.resolutionNotes = validated.notes;
        }

        // Update completion date if resolved
        if (validated.status === 'RESOLVED') {
            updateData.resolvedAt = new Date();
        }

        const updated = await prisma.maintenanceRequest.update({
            where: { id },
            data: updateData,
            include: {
                room: {
                    select: {
                        id: true,
                        name: true,
                        motel: { select: { id: true, name: true } },
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
        });

        // If resolved, update room status if it was in maintenance
        if (validated.status === 'RESOLVED') {
            const hasOtherPendingRequests = await prisma.maintenanceRequest.count({
                where: {
                    roomId: maintenanceRequest.roomId,
                    id: { not: id },
                    status: { in: ['PENDING', 'IN_PROGRESS'] },
                },
            });

            if (hasOtherPendingRequests === 0) {
                // No more pending requests, room can be available again
                // (only if it was in MAINTENANCE status)
                await prisma.room.updateMany({
                    where: {
                        id: maintenanceRequest.roomId,
                        status: 'MAINTENANCE',
                    },
                    data: { status: 'AVAILABLE' },
                });
            }
        }

        const statusMessages: Record<string, string> = {
            IN_PROGRESS: 'Đã bắt đầu xử lý yêu cầu',
            RESOLVED: 'Đã hoàn thành sửa chữa',
            CANCELLED: 'Đã hủy yêu cầu',
        };

        return NextResponse.json({
            success: true,
            data: updated,
            message: statusMessages[validated.status] || 'Cập nhật thành công',
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

        console.error('Update maintenance request error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
