import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { generateInvoicesSchema } from '@/lib/validators';
import { generateInvoiceNumber } from '@/lib/utils';
import { ZodError } from 'zod';

// POST /api/invoices/generate - Auto-generate invoices for a motel
export async function POST(request: Request) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'STAFF', 'ADMIN']);
        if (error) return error;

        const body = await request.json();
        const validated = generateInvoicesSchema.parse(body);

        // Verify motel access
        const motel = await prisma.motel.findUnique({
            where: { id: validated.motelId },
            include: {
                services: true,
            },
        });

        if (!motel) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Không tìm thấy nhà trọ' },
                },
                { status: 404 }
            );
        }

        if (user!.role === 'LANDLORD' && motel.ownerId !== user!.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Bạn không có quyền tạo hóa đơn cho nhà trọ này' },
                },
                { status: 403 }
            );
        }

        // Get active contracts for this motel
        const contracts = await prisma.contract.findMany({
            where: {
                status: 'ACTIVE',
                room: { motelId: validated.motelId },
            },
            include: {
                room: {
                    include: {
                        roomServices: {
                            include: { service: true },
                        },
                    },
                },
                tenants: true,
            },
        });

        // Parse billing month
        const [year, monthNum] = validated.billingMonth.split('-').map(Number);
        const billingMonth = new Date(year, monthNum - 1, 1);

        // Build meter readings map
        const meterReadingsMap = new Map(
            validated.meterReadings.map((mr) => [mr.roomId, mr])
        );

        // Generate invoices
        const invoices = [];
        for (const contract of contracts) {
            // Check if invoice already exists for this month
            const existingInvoice = await prisma.invoice.findFirst({
                where: {
                    contractId: contract.id,
                    billingMonth: billingMonth,
                },
            });

            if (existingInvoice) continue;

            const meterReading = meterReadingsMap.get(contract.roomId);
            const items: Array<{
                serviceName: string;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
                oldIndex?: number;
                newIndex?: number;
            }> = [];
            let total = 0;

            // Add room rent
            items.push({
                serviceName: 'Tiền phòng',
                quantity: 1,
                unitPrice: contract.rentPrice,
                totalPrice: contract.rentPrice,
            });
            total += contract.rentPrice;

            // Add services
            const services = contract.room.roomServices.length > 0
                ? contract.room.roomServices.map((rs) => ({
                    ...rs.service,
                    price: rs.customPrice ?? rs.service.price,
                }))
                : motel.services;

            for (const service of services) {
                let quantity = 1;
                let serviceTotal = 0;
                let oldIndex: number | undefined;
                let newIndex: number | undefined;

                if (service.type === 'USAGE' && meterReading) {
                    // Calculate based on meter reading
                    if (service.name.toLowerCase().includes('điện')) {
                        oldIndex = meterReading.electricity.oldIndex;
                        newIndex = meterReading.electricity.newIndex;
                        quantity = newIndex - oldIndex;
                    } else if (service.name.toLowerCase().includes('nước')) {
                        oldIndex = meterReading.water.oldIndex;
                        newIndex = meterReading.water.newIndex;
                        quantity = newIndex - oldIndex;
                    }
                } else if (service.type === 'PEOPLE') {
                    quantity = contract.tenants.length || 1;
                }

                serviceTotal = quantity * service.price;
                total += serviceTotal;

                items.push({
                    serviceName: service.name,
                    quantity,
                    unitPrice: service.price,
                    totalPrice: serviceTotal,
                    oldIndex,
                    newIndex,
                });
            }

            // Create invoice
            const dueDate = new Date(billingMonth);
            dueDate.setDate(contract.paymentDueDay || 5);
            dueDate.setMonth(dueDate.getMonth() + 1);

            const invoice = await prisma.invoice.create({
                data: {
                    invoiceNumber: generateInvoiceNumber(),
                    contractId: contract.id,
                    billingMonth,
                    amountTotal: total,
                    dueDate,
                    items: {
                        create: items,
                    },
                },
                include: {
                    items: true,
                    contract: {
                        select: {
                            room: {
                                select: {
                                    name: true,
                                },
                            },
                            tenant: {
                                select: {
                                    fullName: true,
                                },
                            },
                        },
                    },
                },
            });

            invoices.push(invoice);
        }

        return NextResponse.json({
            success: true,
            data: invoices,
            message: `Đã tạo ${invoices.length} hóa đơn`,
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

        console.error('Generate invoices error:', error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' },
            },
            { status: 500 }
        );
    }
}
