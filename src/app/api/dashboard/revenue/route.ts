import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

// GET /api/dashboard/revenue - Get revenue statistics
export async function GET(request: Request) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'STAFF', 'ADMIN']);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
        const motelId = searchParams.get('motelId');

        // Base filter for role
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const baseFilter: Record<string, any> = {};
        if (user!.role === 'LANDLORD') {
            baseFilter.contract = { room: { motel: { ownerId: user!.id } } };
        }
        if (motelId) {
            baseFilter.contract = { ...baseFilter.contract, room: { motelId } };
        }

        // Get monthly revenue for the year
        const monthlyRevenue = [];
        for (let month = 0; month < 12; month++) {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 1);

            const result = await prisma.payment.aggregate({
                where: {
                    ...baseFilter,
                    paymentDate: { gte: startDate, lt: endDate },
                },
                _sum: { amount: true },
                _count: { id: true },
            });

            monthlyRevenue.push({
                month: month + 1,
                monthName: new Date(year, month, 1).toLocaleDateString('vi-VN', { month: 'long' }),
                revenue: result._sum.amount || 0,
                transactionCount: result._count.id,
            });
        }

        // Get yearly totals
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year + 1, 0, 1);

        const yearlyTotal = await prisma.payment.aggregate({
            where: {
                ...baseFilter,
                paymentDate: { gte: yearStart, lt: yearEnd },
            },
            _sum: { amount: true },
            _count: { id: true },
        });

        // Get comparison with previous year
        const prevYearStart = new Date(year - 1, 0, 1);
        const prevYearEnd = new Date(year, 0, 1);

        const prevYearTotal = await prisma.payment.aggregate({
            where: {
                ...baseFilter,
                paymentDate: { gte: prevYearStart, lt: prevYearEnd },
            },
            _sum: { amount: true },
        });

        const currentYearRevenue = yearlyTotal._sum.amount || 0;
        const prevYearRevenue = prevYearTotal._sum.amount || 0;
        const growthRate = prevYearRevenue > 0
            ? ((currentYearRevenue - prevYearRevenue) / prevYearRevenue) * 100
            : 0;

        return NextResponse.json({
            success: true,
            data: {
                year,
                monthlyRevenue,
                yearlyTotal: currentYearRevenue,
                transactionCount: yearlyTotal._count.id,
                previousYearTotal: prevYearRevenue,
                growthRate: Math.round(growthRate * 100) / 100,
            },
        });
    } catch (error) {
        console.error('Get revenue error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
