import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { updateReviewSchema } from '@/lib/validators';
import { ZodError } from 'zod';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/reviews/[id] - Get review details
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const review = await prisma.review.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
                motel: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    },
                },
            },
        });

        if (!review) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy đánh giá' },
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: review,
        });
    } catch (error) {
        console.error('Get review error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// PUT /api/reviews/[id] - Update review
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { id } = await params;

        const existingReview = await prisma.review.findUnique({
            where: { id },
        });

        if (!existingReview) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy đánh giá' },
                },
                { status: 404 }
            );
        }

        if (existingReview.userId !== user!.id && user!.role !== 'ADMIN') {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền sửa đánh giá này' },
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validated = updateReviewSchema.parse(body);

        // Recalculate overall rating if sub-ratings are updated
        let overallRating = existingReview.overallRating;
        if (validated.cleanlinessRating || validated.locationRating ||
            validated.priceRating || validated.landlordRating || validated.amenitiesRating) {
            overallRating = Math.round((
                (validated.cleanlinessRating || existingReview.cleanlinessRating || 5) +
                (validated.locationRating || existingReview.locationRating || 5) +
                (validated.priceRating || existingReview.priceRating || 5) +
                (validated.landlordRating || existingReview.landlordRating || 5) +
                (validated.amenitiesRating || existingReview.amenitiesRating || 5)
            ) / 5);
        }

        const review = await prisma.review.update({
            where: { id },
            data: {
                ...validated,
                overallRating,
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

        return NextResponse.json({
            success: true,
            data: review,
            message: 'Cập nhật đánh giá thành công',
        });
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

        console.error('Update review error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// DELETE /api/reviews/[id] - Delete review
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { id } = await params;

        const existingReview = await prisma.review.findUnique({
            where: { id },
        });

        if (!existingReview) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy đánh giá' },
                },
                { status: 404 }
            );
        }

        if (existingReview.userId !== user!.id && user!.role !== 'ADMIN') {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xóa đánh giá này' },
                },
                { status: 403 }
            );
        }

        await prisma.review.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'Xóa đánh giá thành công',
        });
    } catch (error) {
        console.error('Delete review error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
