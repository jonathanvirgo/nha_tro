import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import crypto from 'crypto';

// POST /api/payments/online/create - Create online payment request
export async function POST(request: Request) {
    try {
        const { user, error } = await withAuth(request);
        if (error) return error;

        const body = await request.json();
        const { invoiceId, paymentMethod, returnUrl } = body;

        if (!invoiceId || !paymentMethod) {
            return NextResponse.json(
                { success: false, error: { code: 'MISSING_FIELDS', message: 'invoiceId và paymentMethod là bắt buộc' } },
                { status: 400 }
            );
        }

        // Get invoice details
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                contract: {
                    include: {
                        tenant: { select: { id: true, fullName: true, phone: true } },
                        room: {
                            include: {
                                motel: { select: { name: true, owner: { select: { id: true } } } },
                            },
                        },
                    },
                },
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
                { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền thanh toán hóa đơn này' } },
                { status: 403 }
            );
        }

        const amountToPay = invoice.amountTotal - invoice.amountPaid;
        if (amountToPay <= 0) {
            return NextResponse.json(
                { success: false, error: { code: 'ALREADY_PAID', message: 'Hóa đơn đã được thanh toán đầy đủ' } },
                { status: 400 }
            );
        }

        // Generate order ID
        const orderId = `PAY-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

        // Build payment URL based on provider
        let paymentUrl: string;
        let extraInfo: Record<string, unknown> = {};

        switch (paymentMethod.toUpperCase()) {
            case 'MOMO':
                // MoMo Payment URL (demo - in production use actual MoMo API)
                const momoEndpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
                const momoPartnerCode = process.env.MOMO_PARTNER_CODE || 'DEMO';
                const momoAccessKey = process.env.MOMO_ACCESS_KEY || '';
                const momoSecretKey = process.env.MOMO_SECRET_KEY || '';

                const momoRequestId = orderId;
                const momoOrderInfo = `Thanh toan hoa don ${invoice.invoiceNumber || invoice.id}`;
                const momoRedirectUrl = returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/result`;
                const momoIpnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/online/callback`;

                // Create signature
                const rawSignature = `accessKey=${momoAccessKey}&amount=${amountToPay}&extraData=&ipnUrl=${momoIpnUrl}&orderId=${orderId}&orderInfo=${momoOrderInfo}&partnerCode=${momoPartnerCode}&redirectUrl=${momoRedirectUrl}&requestId=${momoRequestId}&requestType=payWithMethod`;
                const signature = crypto.createHmac('sha256', momoSecretKey).update(rawSignature).digest('hex');

                extraInfo = {
                    provider: 'MOMO',
                    orderId,
                    amount: amountToPay,
                    partnerCode: momoPartnerCode,
                    signature,
                    endpoint: momoEndpoint,
                };

                // In production, make actual API call to MoMo and get payUrl
                paymentUrl = `${momoEndpoint}?orderId=${orderId}&amount=${amountToPay}`;
                break;

            case 'VNPAY':
                // VNPay Payment URL (demo)
                const vnpTmnCode = process.env.VNPAY_TMN_CODE || 'DEMO';
                const vnpHashSecret = process.env.VNPAY_HASH_SECRET || '';
                const vnpUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
                const vnpReturnUrl = returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/result`;

                extraInfo = {
                    provider: 'VNPAY',
                    orderId,
                    amount: amountToPay,
                    tmnCode: vnpTmnCode,
                };

                paymentUrl = `${vnpUrl}?vnp_TmnCode=${vnpTmnCode}&vnp_Amount=${amountToPay * 100}&vnp_TxnRef=${orderId}&vnp_ReturnUrl=${encodeURIComponent(vnpReturnUrl)}`;
                break;

            case 'ZALOPAY':
                extraInfo = {
                    provider: 'ZALOPAY',
                    orderId,
                    amount: amountToPay,
                };
                paymentUrl = `https://zalopay.vn/pay?order=${orderId}&amount=${amountToPay}`;
                break;

            default:
                return NextResponse.json(
                    { success: false, error: { code: 'INVALID_METHOD', message: 'Phương thức thanh toán không hợp lệ' } },
                    { status: 400 }
                );
        }

        // Log payment request (in production, store in database for tracking)
        console.log('Payment request created:', {
            orderId,
            invoiceId,
            amount: amountToPay,
            method: paymentMethod,
            userId: user!.id,
        });

        return NextResponse.json({
            success: true,
            data: {
                orderId,
                paymentUrl,
                amount: amountToPay,
                invoiceId,
                method: paymentMethod,
                ...extraInfo,
            },
            message: 'Tạo yêu cầu thanh toán thành công',
        });
    } catch (error) {
        console.error('Create online payment error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' } },
            { status: 500 }
        );
    }
}
