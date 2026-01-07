import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { createMotelSchema } from '@/lib/validators';
import { ZodError } from 'zod';

// GET /api/motels - List motels for landlord
export async function GET(request: Request) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'STAFF', 'ADMIN']);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        const where: Record<string, unknown> = {};

        // Filter by owner for landlords
        if (user!.role === 'LANDLORD') {
            where.ownerId = user!.id;
        }

        // Apply filters
        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [motels, total] = await Promise.all([
            prisma.motel.findMany({
                where,
                include: {
                    images: {
                        where: { isPrimary: true },
                        take: 1,
                    },
                    _count: {
                        select: { rooms: true },
                    },
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.motel.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: motels,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get motels error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// POST /api/motels - Create new motel
export async function POST(request: Request) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'ADMIN']);
        if (error) return error;

        const body = await request.json();
        const validated = createMotelSchema.parse(body);

        const motel = await prisma.motel.create({
            data: {
                ...validated,
                ownerId: user!.id,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: motel,
                message: 'Tạo nhà trọ thành công',
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

        console.error('Create motel error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
