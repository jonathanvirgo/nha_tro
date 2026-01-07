import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/contracts/[id] - Get contract details
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { id } = await params;

        const contract = await prisma.contract.findUnique({
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
                        roomServices: {
                            include: { service: true },
                        },
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                        email: true,
                    },
                },
                tenants: true,
                invoices: {
                    orderBy: { billingMonth: 'desc' },
                    take: 3,
                },
            },
        });

        if (!contract) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy hợp đồng' },
                },
                { status: 404 }
            );
        }

        // Check access
        const isTenant = contract.tenantId === user!.id;
        const isLandlord = contract.room.motel.owner.id === user!.id;
        const isAdmin = user!.role === 'ADMIN';

        if (!isTenant && !isLandlord && !isAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xem hợp đồng này' },
                },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            data: contract,
        });
    } catch (error) {
        console.error('Get contract error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// PUT /api/contracts/[id] - Update contract
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'ADMIN']);
        if (error) return error;

        const { id } = await params;
        const body = await request.json();

        const contract = await prisma.contract.findUnique({
            where: { id },
            include: {
                room: {
                    include: {
                        motel: { select: { ownerId: true } },
                    },
                },
            },
        });

        if (!contract) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy hợp đồng' },
                },
                { status: 404 }
            );
        }

        if (user!.role === 'LANDLORD' && contract.room.motel.ownerId !== user!.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền sửa hợp đồng này' },
                },
                { status: 403 }
            );
        }

        const { action, ...updateData } = body;

        if (action === 'terminate') {
            // Terminate contract
            const updated = await prisma.$transaction(async (tx) => {
                const terminated = await tx.contract.update({
                    where: { id },
                    data: {
                        status: 'TERMINATED',
                        notes: updateData.terminationReason
                            ? `${contract.notes || ''}\n[Thanh lý]: ${updateData.terminationReason}`.trim()
                            : contract.notes,
                    },
                });

                // Update room status
                await tx.room.update({
                    where: { id: contract.roomId },
                    data: { status: 'AVAILABLE' },
                });

                return terminated;
            });

            return NextResponse.json({
                success: true,
                data: updated,
                message: 'Thanh lý hợp đồng thành công',
            });
        }

        if (action === 'renew') {
            // Renew contract
            const newEndDate = updateData.newEndDate ? new Date(updateData.newEndDate) : null;
            const updated = await prisma.contract.update({
                where: { id },
                data: {
                    endDate: newEndDate,
                    rentPrice: updateData.newRentPrice || contract.rentPrice,
                },
            });

            return NextResponse.json({
                success: true,
                data: updated,
                message: 'Gia hạn hợp đồng thành công',
            });
        }

        // Regular update
        const updated = await prisma.contract.update({
            where: { id },
            data: {
                rentPrice: updateData.rentPrice,
                depositAmount: updateData.depositAmount,
                paymentDueDay: updateData.paymentDueDay,
                notes: updateData.notes,
            },
        });

        return NextResponse.json({
            success: true,
            data: updated,
            message: 'Cập nhật hợp đồng thành công',
        });
    } catch (error) {
        console.error('Update contract error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
