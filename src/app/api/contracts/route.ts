import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { createContractSchema } from '@/lib/validators';
import { generateContractNumber } from '@/lib/utils';
import { ZodError } from 'zod';

// GET /api/contracts - List contracts
export async function GET(request: Request) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const motelId = searchParams.get('motelId');
        const roomId = searchParams.get('roomId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: Record<string, any> = {};

        // Filter based on role
        if (user!.role === 'TENANT') {
            where.tenantId = user!.id;
        } else if (user!.role === 'LANDLORD') {
            where.room = { motel: { ownerId: user!.id } };
        }

        if (status) where.status = status;
        if (roomId) where.roomId = roomId;
        if (motelId) {
            where.room = { ...where.room, motelId };
        }

        const [contracts, total] = await Promise.all([
            prisma.contract.findMany({
                where,
                include: {
                    room: {
                        select: {
                            id: true,
                            name: true,
                            floor: true,
                            motel: {
                                select: {
                                    id: true,
                                    name: true,
                                    address: true,
                                },
                            },
                        },
                    },
                    tenant: {
                        select: {
                            id: true,
                            fullName: true,
                            phone: true,
                            email: true,
                        },
                    },
                    tenants: true,
                    _count: {
                        select: { invoices: true },
                    },
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.contract.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: contracts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get contracts error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// POST /api/contracts - Create a new contract
export async function POST(request: Request) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'STAFF', 'ADMIN']);
        if (error) return error;

        const body = await request.json();
        const validated = createContractSchema.parse(body);

        // Check room exists and is available
        const room = await prisma.room.findUnique({
            where: { id: validated.roomId },
            include: {
                motel: { select: { ownerId: true } },
                contracts: { where: { status: 'ACTIVE' } },
            },
        });

        if (!room) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy phòng' },
                },
                { status: 404 }
            );
        }

        if (user!.role === 'LANDLORD' && room.motel.ownerId !== user!.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền tạo hợp đồng cho phòng này' },
                },
                { status: 403 }
            );
        }

        if (room.contracts.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'ROOM_OCCUPIED', message: 'Phòng này đang có hợp đồng' },
                },
                { status: 400 }
            );
        }

        // Extract tenants from validated data
        const { tenants: tenantData, ...contractData } = validated;

        // Create contract with transaction
        const contract = await prisma.$transaction(async (tx) => {
            // Create contract
            const newContract = await tx.contract.create({
                data: {
                    ...contractData,
                    contractNumber: generateContractNumber(),
                    startDate: new Date(contractData.startDate),
                    endDate: contractData.endDate ? new Date(contractData.endDate) : null,
                },
            });

            // Create tenant records
            if (tenantData && tenantData.length > 0) {
                await tx.tenant.createMany({
                    data: tenantData.map((tenant) => ({
                        contractId: newContract.id,
                        fullName: tenant.fullName,
                        phone: tenant.phone,
                        email: tenant.email,
                        identityCard: tenant.identityCard,
                        dateOfBirth: tenant.dateOfBirth ? new Date(tenant.dateOfBirth) : null,
                        gender: tenant.gender,
                        relationship: tenant.relationship,
                        isPrimary: tenant.isPrimary,
                    })),
                });
            }

            // Update room status
            await tx.room.update({
                where: { id: validated.roomId },
                data: { status: 'RENTED' },
            });

            return newContract;
        });

        // Fetch complete contract
        const fullContract = await prisma.contract.findUnique({
            where: { id: contract.id },
            include: {
                room: {
                    select: {
                        id: true,
                        name: true,
                        motel: { select: { id: true, name: true } },
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                    },
                },
                tenants: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: fullContract,
                message: 'Tạo hợp đồng thành công',
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

        console.error('Create contract error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
