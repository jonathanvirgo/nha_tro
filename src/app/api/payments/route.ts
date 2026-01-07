import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

// GET /api/payments - List payment history
export async function GET(request: Request) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const invoiceId = searchParams.get('invoiceId');
        const motelId = searchParams.get('motelId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: Record<string, any> = {};

        // Filter based on role
        if (user!.role === 'TENANT') {
            where.invoice = { contract: { tenantId: user!.id } };
        } else if (user!.role === 'LANDLORD') {
            where.invoice = { contract: { room: { motel: { ownerId: user!.id } } } };
        }

        if (invoiceId) where.invoiceId = invoiceId;
        if (motelId) {
            where.invoice = { ...where.invoice, contract: { room: { motelId } } };
        }
        if (startDate || endDate) {
            where.paymentDate = {};
            if (startDate) where.paymentDate.gte = new Date(startDate);
            if (endDate) where.paymentDate.lte = new Date(endDate);
        }

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                include: {
                    invoice: {
                        select: {
                            id: true,
                            invoiceNumber: true,
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
                                                },
                                            },
                                        },
                                    },
                                    tenant: {
                                        select: {
                                            id: true,
                                            fullName: true,
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
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { paymentDate: 'desc' },
            }),
            prisma.payment.count({ where }),
        ]);

        // Calculate totals
        const totalAmount = await prisma.payment.aggregate({
            where,
            _sum: { amount: true },
        });

        return NextResponse.json({
            success: true,
            data: payments,
            summary: {
                totalAmount: totalAmount._sum.amount || 0,
            },
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get payments error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
