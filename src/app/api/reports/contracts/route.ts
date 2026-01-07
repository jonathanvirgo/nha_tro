import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

// GET /api/reports/contracts - Contract report
export async function GET(request: Request) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'ADMIN']);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const motelId = searchParams.get('motelId');
        const status = searchParams.get('status'); // ACTIVE, EXPIRED, TERMINATED, PENDING

        // Build filter
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const contractFilter: Record<string, any> = {};
        if (user!.role === 'LANDLORD') {
            contractFilter.room = { motel: { ownerId: user!.id } };
        }
        if (motelId) {
            contractFilter.room = { ...contractFilter.room, motelId };
        }
        if (status) {
            contractFilter.status = status;
        }

        // Get contracts
        const contracts = await prisma.contract.findMany({
            where: contractFilter,
            include: {
                room: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        motel: { select: { id: true, name: true } },
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                    },
                },
                _count: {
                    select: {
                        tenants: true,
                        invoices: true,
                    },
                },
            },
            orderBy: { startDate: 'desc' },
        });

        // Calculate summary by status
        const statusCounts = await prisma.contract.groupBy({
            by: ['status'],
            where: contractFilter,
            _count: { id: true },
        });

        // Find expiring contracts (within 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringContracts = await prisma.contract.findMany({
            where: {
                ...contractFilter,
                status: 'ACTIVE',
                endDate: { lte: thirtyDaysFromNow, gte: new Date() },
            },
            select: {
                id: true,
                endDate: true,
                room: {
                    select: {
                        name: true,
                        motel: { select: { name: true } },
                    },
                },
                tenant: { select: { fullName: true, phone: true } },
            },
            orderBy: { endDate: 'asc' },
        });

        // Calculate revenue from contracts
        const totalMonthlyRevenue = contracts
            .filter((c) => c.status === 'ACTIVE')
            .reduce((sum, c) => sum + c.rentPrice, 0);

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalContracts: contracts.length,
                    byStatus: statusCounts.reduce((acc, s) => {
                        acc[s.status] = s._count.id;
                        return acc;
                    }, {} as Record<string, number>),
                    totalMonthlyRevenue,
                    expiringWithin30Days: expiringContracts.length,
                },
                expiringContracts,
                contracts: contracts.map((c) => ({
                    id: c.id,
                    contractNumber: c.contractNumber,
                    room: c.room,
                    tenant: c.tenant,
                    startDate: c.startDate,
                    endDate: c.endDate,
                    rentPrice: c.rentPrice,
                    depositAmount: c.depositAmount,
                    status: c.status,
                    tenantCount: c._count.tenants + (c.tenant ? 1 : 0),
                    invoiceCount: c._count.invoices,
                })),
            },
        });
    } catch (error) {
        console.error('Contract report error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
