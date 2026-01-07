import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { generateInvoicePDF } from '@/lib/pdf';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/invoices/[id]/pdf - Generate invoice PDF
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const { id } = await params;

        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                contract: {
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
                            },
                        },
                    },
                },
                items: true,
            },
        });

        if (!invoice) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy hóa đơn' } },
                { status: 404 }
            );
        }

        // Check access
        const isTenant = invoice.contract.tenant?.id === user!.id;
        const isLandlord = invoice.contract.room.motel.owner.id === user!.id;
        const isAdmin = user!.role === 'ADMIN';

        if (!isTenant && !isLandlord && !isAdmin) {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xem hóa đơn này' } },
                { status: 403 }
            );
        }

        // Generate PDF
        const pdfBytes = await generateInvoicePDF({
            invoiceNumber: invoice.invoiceNumber || invoice.id,
            billingMonth: invoice.billingMonth,
            dueDate: invoice.dueDate,
            contractNumber: invoice.contract.contractNumber,
            tenant: invoice.contract.tenant,
            room: {
                name: invoice.contract.room.name,
                motel: {
                    name: invoice.contract.room.motel.name,
                    address: invoice.contract.room.motel.address,
                },
            },
            items: invoice.items,
            amountTotal: invoice.amountTotal,
            amountPaid: invoice.amountPaid,
            status: invoice.status,
        });

        // Return PDF
        return new Response(Buffer.from(pdfBytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="hoa-don-${invoice.invoiceNumber || invoice.id}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Generate invoice PDF error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' } },
            { status: 500 }
        );
    }
}
