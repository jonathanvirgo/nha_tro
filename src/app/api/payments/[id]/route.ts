import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/payments/[id] - Get payment details
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { id } = await params;

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                invoice: {
                    select: {
                        id: true,
                        invoiceNumber: true,
                        billingMonth: true,
                        amountTotal: true,
                        status: true,
                        contract: {
                            select: {
                                id: true,
                                room: {
                                    select: {
                                        id: true,
                                        name: true,
                                        motel: {
                                            select: {
                                                id: true,
                                                name: true,
                                                owner: {
                                                    select: { id: true, fullName: true },
                                                },
                                            },
                                        },
                                    },
                                },
                                tenant: {
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
                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });

        if (!payment) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy thanh toán' },
                },
                { status: 404 }
            );
        }

        // Check access
        const isTenant = payment.invoice.contract.tenant?.id === user!.id;
        const isLandlord = payment.invoice.contract.room.motel.owner.id === user!.id;
        const isAdmin = user!.role === 'ADMIN';

        if (!isTenant && !isLandlord && !isAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xem thanh toán này' },
                },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            data: payment,
        });
    } catch (error) {
        console.error('Get payment error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
