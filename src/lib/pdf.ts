import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface InvoiceData {
    invoiceNumber: string;
    billingMonth: Date;
    dueDate: Date | null;
    contractNumber: string | null;
    tenant: {
        fullName: string | null;
        phone: string | null;
        email: string | null;
    } | null;
    room: {
        name: string;
        motel: {
            name: string;
            address: string;
        };
    };
    items: Array<{
        serviceName: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        notes?: string | null;
    }>;
    amountTotal: number;
    amountPaid: number;
    status: string;
}

interface ContractData {
    contractNumber: string | null;
    startDate: Date;
    endDate: Date | null;
    rentPrice: number;
    depositAmount: number | null;
    tenant: {
        fullName: string | null;
        phone: string | null;
        email: string | null;
        identityCard: string | null;
    } | null;
    room: {
        name: string;
        area: number | null;
        roomType: string;
        motel: {
            name: string;
            address: string;
            owner: {
                fullName: string | null;
                phone: string | null;
            };
        };
    };
    tenants: Array<{
        fullName: string;
        phone: string | null;
        identityCard: string | null;
        relationship: string | null;
    }>;
}

/**
 * Generate Invoice PDF
 */
export async function generateInvoicePDF(data: InvoiceData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();
    let y = height - 50;

    // Header
    page.drawText('HOA DON TIEN PHONG', {
        x: 50,
        y,
        size: 18,
        font: fontBold,
        color: rgb(0, 0.2, 0.6),
    });

    y -= 30;
    page.drawText(`So hoa don: ${data.invoiceNumber || 'N/A'}`, {
        x: 50,
        y,
        size: 12,
        font,
    });

    y -= 20;
    page.drawText(`Thang: ${data.billingMonth.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}`, {
        x: 50,
        y,
        size: 12,
        font,
    });

    // Tenant info
    y -= 40;
    page.drawText('THONG TIN KHACH THUE', {
        x: 50,
        y,
        size: 14,
        font: fontBold,
    });

    y -= 20;
    page.drawText(`Ho ten: ${data.tenant?.fullName || 'N/A'}`, { x: 50, y, size: 11, font });
    y -= 15;
    page.drawText(`Dien thoai: ${data.tenant?.phone || 'N/A'}`, { x: 50, y, size: 11, font });
    y -= 15;
    page.drawText(`Phong: ${data.room.name} - ${data.room.motel.name}`, { x: 50, y, size: 11, font });
    y -= 15;
    page.drawText(`Dia chi: ${data.room.motel.address}`, { x: 50, y, size: 11, font });

    // Items table header
    y -= 40;
    page.drawText('CHI TIET', { x: 50, y, size: 14, font: fontBold });

    y -= 25;
    page.drawRectangle({ x: 45, y: y - 5, width: width - 90, height: 20, color: rgb(0.9, 0.9, 0.9) });
    page.drawText('Dich vu', { x: 50, y, size: 10, font: fontBold });
    page.drawText('SL', { x: 280, y, size: 10, font: fontBold });
    page.drawText('Don gia', { x: 330, y, size: 10, font: fontBold });
    page.drawText('Thanh tien', { x: 430, y, size: 10, font: fontBold });

    // Items
    y -= 20;
    for (const item of data.items) {
        page.drawText(item.serviceName.slice(0, 30), { x: 50, y, size: 10, font });
        page.drawText(item.quantity.toString(), { x: 280, y, size: 10, font });
        page.drawText(item.unitPrice.toLocaleString('vi-VN'), { x: 330, y, size: 10, font });
        page.drawText(item.totalPrice.toLocaleString('vi-VN'), { x: 430, y, size: 10, font });
        y -= 18;
    }

    // Total
    y -= 20;
    page.drawLine({ start: { x: 45, y: y + 10 }, end: { x: width - 45, y: y + 10 }, thickness: 1 });
    page.drawText('TONG CONG:', { x: 330, y, size: 12, font: fontBold });
    page.drawText(`${data.amountTotal.toLocaleString('vi-VN')} VND`, { x: 430, y, size: 12, font: fontBold, color: rgb(0.8, 0, 0) });

    y -= 20;
    page.drawText(`Da thanh toan: ${data.amountPaid.toLocaleString('vi-VN')} VND`, { x: 330, y, size: 11, font });

    y -= 15;
    const remaining = data.amountTotal - data.amountPaid;
    page.drawText(`Con lai: ${remaining.toLocaleString('vi-VN')} VND`, { x: 330, y, size: 11, font: fontBold });

    // Payment info
    y -= 40;
    page.drawText(`Han thanh toan: ${data.dueDate ? data.dueDate.toLocaleDateString('vi-VN') : 'N/A'}`, { x: 50, y, size: 11, font });
    y -= 15;
    page.drawText(`Trang thai: ${data.status}`, { x: 50, y, size: 11, font });

    // Footer
    page.drawText(`Ngay tao: ${new Date().toLocaleDateString('vi-VN')}`, {
        x: 50,
        y: 50,
        size: 9,
        font,
        color: rgb(0.5, 0.5, 0.5),
    });

    return await pdfDoc.save();
}

/**
 * Generate Contract PDF
 */
export async function generateContractPDF(data: ContractData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();
    let y = height - 50;

    // Header
    page.drawText('HOP DONG THUE PHONG', {
        x: (width - 200) / 2,
        y,
        size: 20,
        font: fontBold,
        color: rgb(0, 0.2, 0.6),
    });

    y -= 25;
    page.drawText(`So hop dong: ${data.contractNumber || 'N/A'}`, {
        x: (width - 150) / 2,
        y,
        size: 12,
        font,
    });

    // Party A - Landlord
    y -= 40;
    page.drawText('BEN CHO THUE (BEN A):', { x: 50, y, size: 14, font: fontBold });
    y -= 20;
    page.drawText(`Ho ten: ${data.room.motel.owner.fullName || 'N/A'}`, { x: 50, y, size: 11, font });
    y -= 15;
    page.drawText(`Dien thoai: ${data.room.motel.owner.phone || 'N/A'}`, { x: 50, y, size: 11, font });
    y -= 15;
    page.drawText(`Dia chi nha tro: ${data.room.motel.address}`, { x: 50, y, size: 11, font });

    // Party B - Tenant
    y -= 30;
    page.drawText('BEN THUE (BEN B):', { x: 50, y, size: 14, font: fontBold });
    y -= 20;
    page.drawText(`Ho ten: ${data.tenant?.fullName || 'N/A'}`, { x: 50, y, size: 11, font });
    y -= 15;
    page.drawText(`CMND/CCCD: ${data.tenant?.identityCard || 'N/A'}`, { x: 50, y, size: 11, font });
    y -= 15;
    page.drawText(`Dien thoai: ${data.tenant?.phone || 'N/A'}`, { x: 50, y, size: 11, font });

    // Additional tenants
    if (data.tenants.length > 0) {
        y -= 20;
        page.drawText('Nguoi o cung:', { x: 50, y, size: 11, font: fontBold });
        for (const tenant of data.tenants) {
            y -= 15;
            page.drawText(`- ${tenant.fullName} (${tenant.relationship || 'N/A'})`, { x: 60, y, size: 10, font });
        }
    }

    // Room info
    y -= 30;
    page.drawText('THONG TIN PHONG:', { x: 50, y, size: 14, font: fontBold });
    y -= 20;
    page.drawText(`Phong: ${data.room.name}`, { x: 50, y, size: 11, font });
    y -= 15;
    page.drawText(`Dien tich: ${data.room.area || 'N/A'} m2`, { x: 50, y, size: 11, font });
    y -= 15;
    page.drawText(`Loai phong: ${data.room.roomType}`, { x: 50, y, size: 11, font });

    // Contract terms
    y -= 30;
    page.drawText('DIEU KHOAN HOP DONG:', { x: 50, y, size: 14, font: fontBold });
    y -= 20;
    page.drawText(`Thoi han: ${data.startDate.toLocaleDateString('vi-VN')} - ${data.endDate?.toLocaleDateString('vi-VN') || 'Khong xac dinh'}`, { x: 50, y, size: 11, font });
    y -= 15;
    page.drawText(`Gia thue: ${data.rentPrice.toLocaleString('vi-VN')} VND/thang`, { x: 50, y, size: 11, font, color: rgb(0.8, 0, 0) });
    y -= 15;
    page.drawText(`Tien coc: ${(data.depositAmount || 0).toLocaleString('vi-VN')} VND`, { x: 50, y, size: 11, font });

    // Signatures
    y -= 60;
    page.drawText('BEN A', { x: 100, y, size: 12, font: fontBold });
    page.drawText('BEN B', { x: width - 150, y, size: 12, font: fontBold });
    y -= 15;
    page.drawText('(Ky, ghi ro ho ten)', { x: 70, y, size: 10, font });
    page.drawText('(Ky, ghi ro ho ten)', { x: width - 180, y, size: 10, font });

    // Footer
    page.drawText(`Ngay tao: ${new Date().toLocaleDateString('vi-VN')}`, {
        x: 50,
        y: 50,
        size: 9,
        font,
        color: rgb(0.5, 0.5, 0.5),
    });

    return await pdfDoc.save();
}
