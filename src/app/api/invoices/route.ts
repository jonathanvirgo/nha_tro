import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { generateInvoicesSchema, recordPaymentSchema } from '@/lib/validators';
import { generateInvoiceNumber } from '@/lib/utils';
import { ZodError } from 'zod';

// GET /api/invoices - List invoices
export async function GET(request: Request) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const month = searchParams.get('month'); // YYYY-MM format
        const motelId = searchParams.get('motelId');
        const contractId = searchParams.get('contractId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: Record<string, any> = {};

        // Filter based on role
        if (user!.role === 'TENANT') {
            where.contract = { tenantId: user!.id };
        } else if (user!.role === 'LANDLORD') {
            where.contract = { room: { motel: { ownerId: user!.id } } };
        }

        if (status) where.status = status;
        if (contractId) where.contractId = contractId;
        if (motelId) {
            where.contract = { ...where.contract, room: { motelId } };
        }
        if (month) {
            const [year, monthNum] = month.split('-').map(Number);
            const startDate = new Date(year, monthNum - 1, 1);
            const endDate = new Date(year, monthNum, 1);
            where.billingMonth = { gte: startDate, lt: endDate };
        }

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                include: {
                    contract: {
                        select: {
                            id: true,
                            contractNumber: true,
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
                                    phone: true,
                                },
                            },
                        },
                    },
                    items: true,
                    payments: {
                        orderBy: { paymentDate: 'desc' },
                    },
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.invoice.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: invoices,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get invoices error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
