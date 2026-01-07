import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { createReviewSchema } from '@/lib/validators';
import { ZodError } from 'zod';

type RouteParams = { params: Promise<{ motelId: string }> };

// GET /api/motels/[motelId]/reviews - List reviews for a motel
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { motelId } = await params;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const [reviews, total, avgRating] = await Promise.all([
            prisma.review.findMany({
                where: { motelId },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            avatarUrl: true,
                        },
                    },
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.review.count({ where: { motelId } }),
            prisma.review.aggregate({
                where: { motelId },
                _avg: {
                    overallRating: true,
                    locationRating: true,
                    priceRating: true,
                    cleanlinessRating: true,
                    landlordRating: true,
                    amenitiesRating: true,
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                reviews,
                averageRatings: avgRating._avg,
            },
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// POST /api/motels/[motelId]/reviews - Create a review
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request, ['TENANT', 'USER']);
        if (error) return error;

        const { motelId } = await params;
        const body = await request.json();
        const validated = createReviewSchema.parse(body);

        // Check if motel exists
        const motel = await prisma.motel.findUnique({
            where: { id: motelId },
        });

        if (!motel) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy nhà trọ' },
                },
                { status: 404 }
            );
        }

        // Check if user already reviewed this motel
        const existingReview = await prisma.review.findFirst({
            where: {
                motelId,
                userId: user!.id,
            },
        });

        if (existingReview) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'ALREADY_REVIEWED', message: 'Bạn đã đánh giá nhà trọ này rồi' },
                },
                { status: 400 }
            );
        }

        // Calculate overall rating
        const overallRating = Math.round((
            (validated.locationRating || 5) +
            (validated.priceRating || 5) +
            (validated.cleanlinessRating || 5) +
            (validated.landlordRating || 5) +
            (validated.amenitiesRating || 5)
        ) / 5);

        const review = await prisma.review.create({
            data: {
                motelId,
                userId: user!.id,
                overallRating,
                locationRating: validated.locationRating,
                priceRating: validated.priceRating,
                cleanlinessRating: validated.cleanlinessRating,
                landlordRating: validated.landlordRating,
                amenitiesRating: validated.amenitiesRating,
                content: validated.content,
                images: validated.images || [],
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: review,
                message: 'Đánh giá thành công',
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Dữ liệu không hợp lệ',
                        details: error.issues,
                    },
                },
                { status: 400 }
            );
        }

        console.error('Create review error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
