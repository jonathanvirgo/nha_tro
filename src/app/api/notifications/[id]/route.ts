import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

// PUT /api/notifications/[id]/read - Mark notification as read
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { id } = await params;

        const notification = await prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy thông báo' },
                },
                { status: 404 }
            );
        }

        if (notification.userId !== user!.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền thao tác với thông báo này' },
                },
                { status: 403 }
            );
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            data: updated,
        });
    } catch (error) {
        console.error('Mark notification read error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { id } = await params;

        const notification = await prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy thông báo' },
                },
                { status: 404 }
            );
        }

        if (notification.userId !== user!.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xóa thông báo này' },
                },
                { status: 403 }
            );
        }

        await prisma.notification.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'Đã xóa thông báo',
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
