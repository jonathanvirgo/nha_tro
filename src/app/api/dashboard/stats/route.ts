import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: Request) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'STAFF', 'ADMIN']);
        if (error) return error;

        // Build filter for landlord's motels
        const motelFilter =
            user!.role === 'LANDLORD'
                ? { ownerId: user!.id }
                : user!.role === 'STAFF'
                    ? {
                        staffAssignments: {
                            some: { staffId: user!.id },
                        },
                    }
                    : {};

        // Get motels
        const motels = await prisma.motel.findMany({
            where: { ...motelFilter, status: 'ACTIVE' },
            select: { id: true },
        });
        const motelIds = motels.map((m) => m.id);

        // Room statistics
        const roomStats = await prisma.room.groupBy({
            by: ['status'],
            where: { motelId: { in: motelIds } },
            _count: { id: true },
        });

        const totalRooms = roomStats.reduce((sum, s) => sum + s._count.id, 0);
        const availableRooms =
            roomStats.find((s) => s.status === 'AVAILABLE')?._count.id || 0;
        const rentedRooms = roomStats.find((s) => s.status === 'RENTED')?._count.id || 0;
        const maintenanceRooms =
            roomStats.find((s) => s.status === 'MAINTENANCE')?._count.id || 0;

        // Get rooms for contract/invoice queries
        const rooms = await prisma.room.findMany({
            where: { motelId: { in: motelIds } },
            select: { id: true },
        });
        const roomIds = rooms.map((r) => r.id);

        // Current month revenue
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const monthlyPayments = await prisma.payment.aggregate({
            where: {
                invoice: {
                    contract: {
                        roomId: { in: roomIds },
                    },
                },
                paymentDate: {
                    gte: firstDayOfMonth,
                    lte: lastDayOfMonth,
                },
            },
            _sum: { amount: true },
        });

        // Unpaid invoices
        const unpaidInvoices = await prisma.invoice.aggregate({
            where: {
                contract: {
                    roomId: { in: roomIds },
                },
                status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] },
            },
            _count: { id: true },
            _sum: { amountTotal: true },
        });

        const unpaidAmount =
            (unpaidInvoices._sum.amountTotal || 0) -
            (await prisma.payment.aggregate({
                where: {
                    invoice: {
                        contract: { roomId: { in: roomIds } },
                        status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] },
                    },
                },
                _sum: { amount: true },
            }).then((r) => r._sum.amount || 0));

        // Expiring contracts (next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringContracts = await prisma.contract.count({
            where: {
                roomId: { in: roomIds },
                status: 'ACTIVE',
                endDate: {
                    gte: now,
                    lte: thirtyDaysFromNow,
                },
            },
        });

        // Pending maintenance requests
        const pendingMaintenance = await prisma.maintenanceRequest.count({
            where: {
                roomId: { in: roomIds },
                status: { in: ['PENDING', 'IN_PROGRESS'] },
            },
        });

        // Pending appointments
        const pendingAppointments = await prisma.appointment.count({
            where: {
                roomId: { in: roomIds },
                status: 'PENDING',
                visitDate: { gte: now },
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                totalMotels: motels.length,
                totalRooms,
                availableRooms,
                rentedRooms,
                maintenanceRooms,
                monthlyRevenue: monthlyPayments._sum.amount || 0,
                unpaidInvoices: unpaidInvoices._count.id || 0,
                unpaidAmount: Math.max(0, unpaidAmount),
                expiringContracts,
                pendingMaintenance,
                pendingAppointments,
            },
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
