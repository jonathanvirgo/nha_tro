import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { sendMessageSchema } from '@/lib/validators';
import { ZodError } from 'zod';

// GET /api/messages - List conversations
export async function GET(request: Request) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        // Get distinct conversations
        const messages = await prisma.message.findMany({
            where: {
                OR: [{ senderId: user!.id }, { receiverId: user!.id }],
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Group by conversation partner
        const conversationsMap = new Map<string, {
            partnerId: string;
            partnerName: string;
            partnerAvatar: string | null;
            lastMessage: typeof messages[0];
            unreadCount: number;
        }>();

        for (const message of messages) {
            const partnerId =
                message.senderId === user!.id ? message.receiverId : message.senderId;
            const partner =
                message.senderId === user!.id ? message.receiver : message.sender;

            if (!conversationsMap.has(partnerId)) {
                const unreadCount = await prisma.message.count({
                    where: {
                        senderId: partnerId,
                        receiverId: user!.id,
                        isRead: false,
                    },
                });

                conversationsMap.set(partnerId, {
                    partnerId,
                    partnerName: partner.fullName || 'Unknown',
                    partnerAvatar: partner.avatarUrl,
                    lastMessage: message,
                    unreadCount,
                });
            }
        }

        const conversations = Array.from(conversationsMap.values());

        return NextResponse.json({
            success: true,
            data: conversations,
        });
    } catch (error) {
        console.error('Get messages error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// POST /api/messages - Send a new message
export async function POST(request: Request) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const body = await request.json();
        const validated = sendMessageSchema.parse(body);

        // Check receiver exists
        const receiver = await prisma.user.findUnique({
            where: { id: validated.receiverId },
        });

        if (!receiver) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy người nhận' },
                },
                { status: 404 }
            );
        }

        const message = await prisma.message.create({
            data: {
                senderId: user!.id,
                receiverId: validated.receiverId,
                content: validated.content,
                messageType: validated.messageType,
                attachments: validated.attachments || [],
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
                receiver: {
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
                data: message,
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

        console.error('Send message error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
