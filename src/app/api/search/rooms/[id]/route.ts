import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/search/rooms/[id] - Get public room details
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const room = await prisma.room.findUnique({
            where: { id, status: 'AVAILABLE' },
            include: {
                motel: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        province: true,
                        district: true,
                        ward: true,
                        latitude: true,
                        longitude: true,
                        description: true,
                        rules: true,
                        images: {
                            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                            take: 5,
                        },
                        owner: {
                            select: {
                                id: true,
                                fullName: true,
                                phone: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                images: {
                    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                },
                utilities: {
                    include: {
                        utility: true,
                    },
                },
                roomServices: {
                    include: {
                        service: true,
                    },
                },
            },
        });

        if (!room) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy phòng hoặc phòng không còn trống' } },
                { status: 404 }
            );
        }

        // Get review stats for the motel
        const reviewStats = await prisma.review.aggregate({
            where: { motelId: room.motelId },
            _avg: { overallRating: true },
            _count: { id: true },
        });

        // Get similar rooms
        const similarRooms = await prisma.room.findMany({
            where: {
                id: { not: id },
                motelId: room.motelId,
                status: 'AVAILABLE',
            },
            select: {
                id: true,
                name: true,
                price: true,
                area: true,
                roomType: true,
                images: {
                    where: { isPrimary: true },
                    take: 1,
                },
            },
            take: 4,
        });

        return NextResponse.json({
            success: true,
            data: {
                ...room,
                rating: reviewStats._avg.overallRating || 0,
                reviewCount: reviewStats._count.id,
                similarRooms,
            },
        });
    } catch (error) {
        console.error('Get public room error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' } },
            { status: 500 }
        );
    }
}
