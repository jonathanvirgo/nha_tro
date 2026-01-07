import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// POST /api/payments/online/callback - Handle payment gateway callbacks (IPN)
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Log callback for debugging
        console.log('Payment callback received:', body);

        // Determine provider based on callback content
        let isValid = false;
        let orderId: string | null = null;
        let resultCode: number | null = null;
        let amount: number | null = null;
        let transactionId: string | null = null;
        let provider: string = 'UNKNOWN';

        // MoMo callback
        if (body.partnerCode && body.orderId && body.resultCode !== undefined) {
            provider = 'MOMO';
            orderId = body.orderId;
            resultCode = body.resultCode;
            amount = body.amount;
            transactionId = body.transId;

            // Verify signature
            const momoSecretKey = process.env.MOMO_SECRET_KEY || '';
            const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY || ''}&amount=${amount}&extraData=${body.extraData || ''}&message=${body.message || ''}&orderId=${orderId}&orderInfo=${body.orderInfo || ''}&orderType=${body.orderType || ''}&partnerCode=${body.partnerCode}&payType=${body.payType || ''}&requestId=${body.requestId || ''}&responseTime=${body.responseTime || ''}&resultCode=${resultCode}&transId=${transactionId}`;
            const expectedSignature = crypto.createHmac('sha256', momoSecretKey).update(rawSignature).digest('hex');

            isValid = body.signature === expectedSignature || process.env.NODE_ENV === 'development';
        }
        // VNPay callback
        else if (body.vnp_TxnRef && body.vnp_ResponseCode !== undefined) {
            provider = 'VNPAY';
            orderId = body.vnp_TxnRef;
            resultCode = parseInt(body.vnp_ResponseCode);
            amount = parseInt(body.vnp_Amount) / 100; // VNPay amount is in VND * 100
            transactionId = body.vnp_TransactionNo;

            // Verify signature (simplified - in production do full verification)
            isValid = true; // Should verify vnp_SecureHash
        }
        // ZaloPay callback
        else if (body.app_trans_id && body.return_code !== undefined) {
            provider = 'ZALOPAY';
            orderId = body.app_trans_id;
            resultCode = body.return_code;
            amount = body.amount;
            transactionId = body.zp_trans_id;

            isValid = true; // Should verify mac
        }

        if (!orderId) {
            console.error('Invalid callback: missing orderId');
            return NextResponse.json({ return_code: 0, return_message: 'Invalid callback' });
        }

        // Check if payment already processed
        const existingPayment = await prisma.payment.findFirst({
            where: { transactionId: orderId },
        });

        if (existingPayment) {
            console.log('Payment already processed:', orderId);
            return NextResponse.json({ return_code: 1, return_message: 'Already processed' });
        }

        // Payment success (resultCode 0 for MoMo, 00 for VNPay, 1 for ZaloPay)
        const isSuccess =
            (provider === 'MOMO' && resultCode === 0) ||
            (provider === 'VNPAY' && resultCode === 0) ||
            (provider === 'ZALOPAY' && resultCode === 1);

        if (isSuccess && amount) {
            // Extract invoice ID from orderId (format: PAY-timestamp-random)
            // In production, store orderId -> invoiceId mapping in a separate table

            // For this demo, we'll use a simplified approach where invoiceId is passed in extraData
            const invoiceId = body.extraData || body.vnp_OrderInfo?.split('|')[0];

            if (invoiceId) {
                const invoice = await prisma.invoice.findUnique({
                    where: { id: invoiceId },
                });

                if (invoice) {
                    // Record payment
                    await prisma.$transaction(async (tx) => {
                        // Create payment record
                        await tx.payment.create({
                            data: {
                                invoiceId: invoice.id,
                                amount,
                                paymentMethod: provider as 'MOMO' | 'VNPAY' | 'ZALOPAY',
                                transactionId: transactionId || orderId,
                                notes: `Online payment via ${provider}`,
                            },
                        });

                        // Update invoice
                        const newAmountPaid = invoice.amountPaid + amount;
                        const newStatus = newAmountPaid >= invoice.amountTotal ? 'PAID' : 'PARTIAL';

                        await tx.invoice.update({
                            where: { id: invoice.id },
                            data: {
                                amountPaid: newAmountPaid,
                                status: newStatus,
                                paidDate: newStatus === 'PAID' ? new Date() : invoice.paidDate,
                            },
                        });

                        // Create notification for landlord
                        const contract = await tx.contract.findUnique({
                            where: { id: invoice.contractId },
                            include: { room: { include: { motel: { select: { ownerId: true } } } } },
                        });

                        if (contract) {
                            await tx.notification.create({
                                data: {
                                    userId: contract.room.motel.ownerId,
                                    type: 'PAYMENT_RECEIVED',
                                    title: 'Nhận thanh toán online',
                                    content: `Đã nhận ${amount.toLocaleString('vi-VN')} VND cho hóa đơn ${invoice.invoiceNumber || invoice.id} qua ${provider}`,
                                    data: { invoiceId: invoice.id, amount, transactionId },
                                },
                            });
                        }
                    });

                    console.log('Payment recorded successfully:', { orderId, invoiceId, amount });
                }
            }
        }

        // Return success response for payment gateway
        return NextResponse.json({
            return_code: 1,
            return_message: 'Success',
            // MoMo format
            resultCode: 0,
            message: 'Success',
        });
    } catch (error) {
        console.error('Payment callback error:', error);
        return NextResponse.json({
            return_code: 0,
            return_message: 'Error',
            resultCode: 99,
            message: 'Internal error',
        });
    }
}

// GET endpoint for VNPay return URL
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const vnpResponseCode = searchParams.get('vnp_ResponseCode');
    const vnpTxnRef = searchParams.get('vnp_TxnRef');
    const vnpAmount = searchParams.get('vnp_Amount');

    // Redirect to result page
    const resultUrl = new URL('/payment/result', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    resultUrl.searchParams.set('orderId', vnpTxnRef || '');
    resultUrl.searchParams.set('status', vnpResponseCode === '00' ? 'success' : 'failed');
    resultUrl.searchParams.set('amount', String((parseInt(vnpAmount || '0') / 100)));

    return NextResponse.redirect(resultUrl.toString());
}
