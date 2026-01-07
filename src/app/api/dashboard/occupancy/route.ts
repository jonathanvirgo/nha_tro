import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

// GET /api/dashboard/occupancy - Get room occupancy statistics
export async function GET(request: Request) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'STAFF', 'ADMIN']);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const motelId = searchParams.get('motelId');

        // Build filter based on role
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const motelFilter: Record<string, any> = { status: 'ACTIVE' };
        if (user!.role === 'LANDLORD') {
            motelFilter.ownerId = user!.id;
        }
        if (motelId) {
            motelFilter.id = motelId;
        }

        // Get motels with room stats
        const motels = await prisma.motel.findMany({
            where: motelFilter,
            include: {
                rooms: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
        });

        // Calculate occupancy per motel
        const motelOccupancy = motels.map((motel) => {
            const totalRooms = motel.rooms.length;
            const occupiedRooms = motel.rooms.filter((r) => r.status === 'RENTED').length;
            const availableRooms = motel.rooms.filter((r) => r.status === 'AVAILABLE').length;
            const maintenanceRooms = motel.rooms.filter((r) => r.status === 'MAINTENANCE').length;

            return {
                motelId: motel.id,
                motelName: motel.name,
                totalRooms,
                occupiedRooms,
                availableRooms,
                maintenanceRooms,
                occupancyRate: totalRooms > 0
                    ? Math.round((occupiedRooms / totalRooms) * 100)
                    : 0,
            };
        });

        // Calculate overall stats
        const totalRooms = motelOccupancy.reduce((sum, m) => sum + m.totalRooms, 0);
        const occupiedRooms = motelOccupancy.reduce((sum, m) => sum + m.occupiedRooms, 0);
        const availableRooms = motelOccupancy.reduce((sum, m) => sum + m.availableRooms, 0);
        const maintenanceRooms = motelOccupancy.reduce((sum, m) => sum + m.maintenanceRooms, 0);

        return NextResponse.json({
            success: true,
            data: {
                overall: {
                    totalMotels: motels.length,
                    totalRooms,
                    occupiedRooms,
                    availableRooms,
                    maintenanceRooms,
                    occupancyRate: totalRooms > 0
                        ? Math.round((occupiedRooms / totalRooms) * 100)
                        : 0,
                },
                byMotel: motelOccupancy,
            },
        });
    } catch (error) {
        console.error('Get occupancy error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
