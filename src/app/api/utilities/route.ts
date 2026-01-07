import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

// GET /api/utilities - List all utilities
export async function GET() {
    try {
        const utilities = await prisma.utility.findMany({
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        });

        // Group by category
        const grouped = utilities.reduce((acc, utility) => {
            const category = utility.category || 'other';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(utility);
            return acc;
        }, {} as Record<string, typeof utilities>);

        return NextResponse.json({
            success: true,
            data: {
                utilities,
                grouped,
            },
        });
    } catch (error) {
        console.error('Get utilities error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// POST /api/utilities - Create a new utility (Admin only)
export async function POST(request: Request) {
    try {
        const { user, error } = await withAuth(request, ['ADMIN']);
        if (error) return error;

        const body = await request.json();
        const { name, icon, category } = body;

        if (!name) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: 'Tên tiện ích là bắt buộc' },
                },
                { status: 400 }
            );
        }

        const utility = await prisma.utility.create({
            data: {
                name,
                icon,
                category,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: utility,
                message: 'Tạo tiện ích thành công',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create utility error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
