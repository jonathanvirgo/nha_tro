import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

// GET /api/reports/financial - Financial report
export async function GET(request: Request) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'ADMIN']);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
        const motelId = searchParams.get('motelId');

        // Build base filter
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const baseFilter: Record<string, any> = {};
        if (user!.role === 'LANDLORD') {
            baseFilter.contract = { room: { motel: { ownerId: user!.id } } };
        }
        if (motelId) {
            baseFilter.contract = { ...baseFilter.contract, room: { motelId } };
        }

        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year + 1, 0, 1);

        // Get monthly data
        const monthlyData = [];
        for (let month = 0; month < 12; month++) {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 1);

            const [invoices, payments] = await Promise.all([
                prisma.invoice.aggregate({
                    where: {
                        ...baseFilter,
                        billingMonth: { gte: startDate, lt: endDate },
                    },
                    _sum: { amountTotal: true, amountPaid: true },
                    _count: { id: true },
                }),
                prisma.payment.aggregate({
                    where: {
                        ...baseFilter,
                        paymentDate: { gte: startDate, lt: endDate },
                    },
                    _sum: { amount: true },
                    _count: { id: true },
                }),
            ]);

            monthlyData.push({
                month: month + 1,
                monthName: new Date(year, month, 1).toLocaleDateString('vi-VN', { month: 'long' }),
                totalInvoiced: invoices._sum.amountTotal || 0,
                totalCollected: payments._sum.amount || 0,
                invoiceCount: invoices._count.id,
                paymentCount: payments._count.id,
                collectionRate: invoices._sum.amountTotal
                    ? Math.round(((payments._sum.amount || 0) / invoices._sum.amountTotal) * 100)
                    : 0,
            });
        }

        // Get yearly totals
        const yearlyTotals = await Promise.all([
            prisma.invoice.aggregate({
                where: { ...baseFilter, billingMonth: { gte: yearStart, lt: yearEnd } },
                _sum: { amountTotal: true, amountPaid: true },
                _count: { id: true },
            }),
            prisma.payment.aggregate({
                where: { ...baseFilter, paymentDate: { gte: yearStart, lt: yearEnd } },
                _sum: { amount: true },
                _count: { id: true },
            }),
        ]);

        // Get outstanding invoices
        const outstandingInvoices = await prisma.invoice.findMany({
            where: {
                ...baseFilter,
                status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] },
            },
            select: {
                id: true,
                invoiceNumber: true,
                amountTotal: true,
                amountPaid: true,
                status: true,
                dueDate: true,
                contract: {
                    select: {
                        room: {
                            select: {
                                name: true,
                                motel: { select: { name: true } },
                            },
                        },
                        tenant: { select: { fullName: true } },
                    },
                },
            },
            orderBy: { dueDate: 'asc' },
            take: 20,
        });

        return NextResponse.json({
            success: true,
            data: {
                year,
                monthlyData,
                summary: {
                    totalInvoiced: yearlyTotals[0]._sum.amountTotal || 0,
                    totalCollected: yearlyTotals[1]._sum.amount || 0,
                    outstanding: (yearlyTotals[0]._sum.amountTotal || 0) - (yearlyTotals[0]._sum.amountPaid || 0),
                    invoiceCount: yearlyTotals[0]._count.id,
                    paymentCount: yearlyTotals[1]._count.id,
                    collectionRate: yearlyTotals[0]._sum.amountTotal
                        ? Math.round(((yearlyTotals[1]._sum.amount || 0) / yearlyTotals[0]._sum.amountTotal) * 100)
                        : 0,
                },
                outstandingInvoices,
            },
        });
    } catch (error) {
        console.error('Financial report error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
