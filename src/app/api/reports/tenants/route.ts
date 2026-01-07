import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

// GET /api/reports/tenants - Tenant report
export async function GET(request: Request) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'ADMIN']);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const motelId = searchParams.get('motelId');

        // Build filter
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const contractFilter: Record<string, any> = { status: 'ACTIVE' };
        if (user!.role === 'LANDLORD') {
            contractFilter.room = { motel: { ownerId: user!.id } };
        }
        if (motelId) {
            contractFilter.room = { ...contractFilter.room, motelId };
        }

        // Get active contracts with tenant info
        const contracts = await prisma.contract.findMany({
            where: contractFilter,
            include: {
                room: {
                    select: {
                        id: true,
                        name: true,
                        motel: { select: { id: true, name: true } },
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
                tenants: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                        isPrimary: true,
                    },
                },
                invoices: {
                    where: { status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] } },
                    select: { id: true, amountTotal: true, amountPaid: true, status: true },
                },
            },
            orderBy: { startDate: 'desc' },
        });

        // Calculate summary
        const totalTenants = contracts.reduce((sum, c) => sum + c.tenants.length + (c.tenant ? 1 : 0), 0);
        const totalOutstanding = contracts.reduce((sum, c) => {
            return sum + c.invoices.reduce((invSum, inv) => invSum + (inv.amountTotal - inv.amountPaid), 0);
        }, 0);

        // Format tenant data
        const tenantData = contracts.map((c) => ({
            contractId: c.id,
            room: c.room,
            startDate: c.startDate,
            endDate: c.endDate,
            rentPrice: c.rentPrice,
            primaryTenant: c.tenant,
            additionalTenants: c.tenants,
            totalTenants: c.tenants.length + (c.tenant ? 1 : 0),
            outstandingAmount: c.invoices.reduce((sum, inv) => sum + (inv.amountTotal - inv.amountPaid), 0),
            hasOverdueInvoices: c.invoices.some((inv) => inv.status === 'OVERDUE'),
        }));

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalContracts: contracts.length,
                    totalTenants,
                    totalOutstanding,
                    tenantsWithOverdue: tenantData.filter((t) => t.hasOverdueInvoices).length,
                },
                tenants: tenantData,
            },
        });
    } catch (error) {
        console.error('Tenant report error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
