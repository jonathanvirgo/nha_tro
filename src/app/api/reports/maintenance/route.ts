import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

// GET /api/reports/maintenance - Maintenance report
export async function GET(request: Request) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'STAFF', 'ADMIN']);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const motelId = searchParams.get('motelId');
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

        // Build filter
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: Record<string, any> = {};
        if (user!.role === 'LANDLORD') {
            filter.room = { motel: { ownerId: user!.id } };
        }
        if (motelId) {
            filter.room = { ...filter.room, motelId };
        }

        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year + 1, 0, 1);
        filter.createdAt = { gte: yearStart, lt: yearEnd };

        // Get maintenance requests
        const requests = await prisma.maintenanceRequest.findMany({
            where: filter,
            include: {
                room: {
                    select: {
                        id: true,
                        name: true,
                        motel: { select: { id: true, name: true } },
                    },
                },
                requester: { select: { id: true, fullName: true } },
                assignedTo: { select: { id: true, fullName: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate summary by status
        const statusCounts = await prisma.maintenanceRequest.groupBy({
            by: ['status'],
            where: filter,
            _count: { id: true },
        });

        // Calculate by priority
        const priorityCounts = await prisma.maintenanceRequest.groupBy({
            by: ['priority'],
            where: filter,
            _count: { id: true },
        });

        // Calculate costs
        const costStats = await prisma.maintenanceRequest.aggregate({
            where: filter,
            _sum: { estimatedCost: true, actualCost: true },
            _avg: { estimatedCost: true, actualCost: true },
        });

        // Monthly breakdown
        const monthlyData = [];
        for (let month = 0; month < 12; month++) {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 1);

            const monthStats = await prisma.maintenanceRequest.aggregate({
                where: {
                    ...filter,
                    createdAt: { gte: startDate, lt: endDate },
                },
                _count: { id: true },
                _sum: { actualCost: true },
            });

            monthlyData.push({
                month: month + 1,
                monthName: new Date(year, month, 1).toLocaleDateString('vi-VN', { month: 'long' }),
                requestCount: monthStats._count.id,
                totalCost: monthStats._sum.actualCost || 0,
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                year,
                summary: {
                    totalRequests: requests.length,
                    byStatus: statusCounts.reduce((acc, s) => {
                        acc[s.status] = s._count.id;
                        return acc;
                    }, {} as Record<string, number>),
                    byPriority: priorityCounts.reduce((acc, p) => {
                        acc[p.priority] = p._count.id;
                        return acc;
                    }, {} as Record<string, number>),
                    totalEstimatedCost: costStats._sum.estimatedCost || 0,
                    totalActualCost: costStats._sum.actualCost || 0,
                    avgCost: costStats._avg.actualCost || 0,
                },
                monthlyData,
                recentRequests: requests.slice(0, 20).map((r) => ({
                    id: r.id,
                    title: r.title,
                    room: r.room,
                    priority: r.priority,
                    status: r.status,
                    estimatedCost: r.estimatedCost,
                    actualCost: r.actualCost,
                    requester: r.requester,
                    assignedTo: r.assignedTo,
                    createdAt: r.createdAt,
                    completedAt: r.completedAt,
                })),
            },
        });
    } catch (error) {
        console.error('Maintenance report error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
