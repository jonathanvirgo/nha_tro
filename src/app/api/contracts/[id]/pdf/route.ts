import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { generateContractPDF } from '@/lib/pdf';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/contracts/[id]/pdf - Generate contract PDF
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { id } = await params;

        const contract = await prisma.contract.findUnique({
            where: { id },
            include: {
                room: {
                    include: {
                        motel: {
                            select: {
                                name: true,
                                address: true,
                                owner: {
                                    select: { id: true, fullName: true, phone: true },
                                },
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
                        identityCard: true,
                    },
                },
                tenants: {
                    select: {
                        fullName: true,
                        phone: true,
                        identityCard: true,
                        relationship: true,
                    },
                },
            },
        });

        if (!contract) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hợp đồng' } },
                { status: 404 }
            );
        }

        // Check access
        const isTenant = contract.tenant?.id === user!.id;
        const isLandlord = contract.room.motel.owner.id === user!.id;
        const isAdmin = user!.role === 'ADMIN';

        if (!isTenant && !isLandlord && !isAdmin) {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xem hợp đồng này' } },
                { status: 403 }
            );
        }

        // Generate PDF
        const pdfBytes = await generateContractPDF({
            contractNumber: contract.contractNumber,
            startDate: contract.startDate,
            endDate: contract.endDate,
            rentPrice: contract.rentPrice,
            depositAmount: contract.depositAmount,
            tenant: contract.tenant,
            room: {
                name: contract.room.name,
                area: contract.room.area,
                roomType: contract.room.roomType,
                motel: {
                    name: contract.room.motel.name,
                    address: contract.room.motel.address,
                    owner: contract.room.motel.owner,
                },
            },
            tenants: contract.tenants,
        });

        // Return PDF
        return new Response(Buffer.from(pdfBytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="hop-dong-${contract.contractNumber || contract.id}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Generate contract PDF error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' } },
            { status: 500 }
        );
    }
}
