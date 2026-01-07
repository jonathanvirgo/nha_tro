import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateDistance } from '@/lib/utils';

// GET /api/search/rooms - Public search for rooms
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
        const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
        const radius = parseFloat(searchParams.get('radius') || '30'); // Default 30km
        const minPrice = searchParams.get('minPrice')
            ? parseFloat(searchParams.get('minPrice')!)
            : null;
        const maxPrice = searchParams.get('maxPrice')
            ? parseFloat(searchParams.get('maxPrice')!)
            : null;
        const minArea = searchParams.get('minArea')
            ? parseFloat(searchParams.get('minArea')!)
            : null;
        const maxArea = searchParams.get('maxArea')
            ? parseFloat(searchParams.get('maxArea')!)
            : null;
        const roomType = searchParams.get('roomType');
        const utilities = searchParams.get('utilities')?.split(',').filter(Boolean);
        const sortBy = searchParams.get('sortBy') || 'distance';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

        // Build where clause for rooms
        const roomWhere: Record<string, unknown> = {
            status: 'AVAILABLE',
            motel: {
                status: 'ACTIVE',
            },
        };

        if (minPrice !== null || maxPrice !== null) {
            roomWhere.price = {};
            if (minPrice !== null) (roomWhere.price as Record<string, number>).gte = minPrice;
            if (maxPrice !== null) (roomWhere.price as Record<string, number>).lte = maxPrice;
        }

        if (minArea !== null || maxArea !== null) {
            roomWhere.area = {};
            if (minArea !== null) (roomWhere.area as Record<string, number>).gte = minArea;
            if (maxArea !== null) (roomWhere.area as Record<string, number>).lte = maxArea;
        }

        if (roomType) {
            roomWhere.roomType = roomType;
        }

        if (utilities && utilities.length > 0) {
            roomWhere.utilities = {
                some: {
                    utilityId: { in: utilities },
                },
            };
        }

        // Fetch rooms with related data
        let rooms = await prisma.room.findMany({
            where: roomWhere,
            include: {
                motel: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        province: true,
                        district: true,
                        latitude: true,
                        longitude: true,
                    },
                },
                images: {
                    orderBy: { sortOrder: 'asc' },
                    take: 3,
                },
                utilities: {
                    include: {
                        utility: true,
                    },
                },
                _count: {
                    select: { reviews: true },
                },
            },
        });

        // Calculate distance and filter by radius if coordinates provided
        if (lat !== null && lng !== null) {
            rooms = rooms
                .map((room) => {
                    const motelLat = room.motel.latitude;
                    const motelLng = room.motel.longitude;

                    if (motelLat === null || motelLng === null) {
                        return { ...room, distance: null };
                    }

                    const distance = calculateDistance(lat, lng, motelLat, motelLng);
                    return { ...room, distance };
                })
                .filter((room) => room.distance === null || room.distance <= radius);
        }

        // Get average ratings for each room's motel
        const motelIds = [...new Set(rooms.map((r) => r.motel.id))];
        const ratings = await prisma.review.groupBy({
            by: ['motelId'],
            where: { motelId: { in: motelIds } },
            _avg: { overallRating: true },
            _count: { id: true },
        });

        const ratingMap = new Map(
            ratings.map((r) => [
                r.motelId,
                { rating: r._avg.overallRating, reviewCount: r._count.id },
            ])
        );

        // Add ratings to rooms
        const roomsWithRatings = rooms.map((room) => {
            const motelRating = ratingMap.get(room.motel.id);
            return {
                id: room.id,
                name: room.name,
                floor: room.floor,
                area: room.area,
                roomType: room.roomType,
                price: room.price,
                deposit: room.deposit,
                maxTenants: room.maxTenants,
                description: room.description,
                motel: room.motel,
                images: room.images.map((img) => img.imageUrl),
                utilities: room.utilities.map((u) => u.utility.name),
                distance: 'distance' in room ? room.distance : null,
                rating: motelRating?.rating || 0,
                reviewCount: motelRating?.reviewCount || 0,
            };
        });

        // Sort results
        if (sortBy === 'distance' && lat !== null && lng !== null) {
            roomsWithRatings.sort((a, b) => ((a.distance as number) || Infinity) - ((b.distance as number) || Infinity));
        } else if (sortBy === 'price') {
            roomsWithRatings.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'rating') {
            roomsWithRatings.sort((a, b) => ((b.rating as number) || 0) - ((a.rating as number) || 0));
        }

        // Paginate
        const total = roomsWithRatings.length;
        const paginatedRooms = roomsWithRatings.slice((page - 1) * limit, page * limit);

        return NextResponse.json({
            success: true,
            data: {
                rooms: paginatedRooms,
            },
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Search rooms error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
