import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { recordPaymentSchema } from '@/lib/validators';
import { ZodError } from 'zod';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/invoices/[id] - Get invoice details
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
                                        id: true,
                                        name: true,
                                        address: true,
                                        owner: {
                                            select: {
                                                id: true,
                                                fullName: true,
                                                phone: true,
                                            },
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
                        tenants: true,
                    },
                },
                items: true,
                payments: {
                    orderBy: { paymentDate: 'desc' },
                },
            },
        });

        if (!invoice) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy hóa đơn' },
                },
                { status: 404 }
            );
        }

        // Check access
        if (user!.role === 'TENANT' && invoice.contract.tenantId !== user!.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xem hóa đơn này' },
                },
                { status: 403 }
            );
        }

        if (user!.role === 'LANDLORD' && invoice.contract.room.motel.owner.id !== user!.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xem hóa đơn này' },
                },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            data: invoice,
        });
    } catch (error) {
        console.error('Get invoice error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}

// POST /api/invoices/[id]/payments - Record a payment for invoice
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'STAFF', 'ADMIN']);
        if (error) return error;

        const { id } = await params;

        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                contract: {
                    include: {
                        room: {
                            include: {
                                motel: { select: { ownerId: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!invoice) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy hóa đơn' },
                },
                { status: 404 }
            );
        }

        if (user!.role === 'LANDLORD' && invoice.contract.room.motel.ownerId !== user!.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền thu tiền hóa đơn này' },
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validated = recordPaymentSchema.parse(body);

        const remainingAmount = invoice.amountTotal - invoice.amountPaid;
        if (validated.amount > remainingAmount) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'INVALID_AMOUNT',
                        message: `Số tiền vượt quá số tiền còn nợ (${remainingAmount.toLocaleString('vi-VN')} VND)`,
                    },
                },
                { status: 400 }
            );
        }

        // Create payment and update invoice
        const [payment, updatedInvoice] = await prisma.$transaction([
            prisma.payment.create({
                data: {
                    invoiceId: id,
                    amount: validated.amount,
                    paymentMethod: validated.paymentMethod,
                    notes: validated.notes,
                    createdById: user!.id,
                },
            }),
            prisma.invoice.update({
                where: { id },
                data: {
                    amountPaid: { increment: validated.amount },
                    status:
                        invoice.amountPaid + validated.amount >= invoice.amountTotal
                            ? 'PAID'
                            : 'PARTIAL',
                    paidDate:
                        invoice.amountPaid + validated.amount >= invoice.amountTotal
                            ? new Date()
                            : null,
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                payment,
                invoice: updatedInvoice,
            },
            message: 'Ghi nhận thanh toán thành công',
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

        console.error('Record payment error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
