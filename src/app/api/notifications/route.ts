import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

// GET /api/notifications - List notifications for current user
export async function GET(request: Request) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get('unread') === 'true';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const where: { userId: string; isRead?: boolean } = { userId: user!.id };
        if (unreadOnly) where.isRead = false;

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({ where: { userId: user!.id, isRead: false } }),
        ]);

        return NextResponse.json({
            success: true,
            data: notifications,
            unreadCount,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
