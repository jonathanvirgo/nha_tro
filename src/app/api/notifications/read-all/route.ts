import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

// PUT /api/notifications/read-all - Mark all notifications as read
export async function PUT(request: Request) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        await prisma.notification.updateMany({
            where: {
                userId: user!.id,
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Đã đánh dấu tất cả thông báo là đã đọc',
        });
    } catch (error) {
        console.error('Mark all notifications as read error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
