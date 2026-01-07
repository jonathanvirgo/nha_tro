"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Receipt, CreditCard, Download, AlertCircle, CheckCircle } from 'lucide-react';

const mockInvoices = [
    {
        id: '1',
        invoiceNumber: 'INV-202412-001',
        period: 'Tháng 12/2024',
        dueDate: '05/01/2025',
        roomRent: 3500000,
        electricity: 450000,
        water: 150000,
        internet: 100000,
        total: 4200000,
        status: 'pending',
        paidAt: null,
    },
    {
        id: '2',
        invoiceNumber: 'INV-202411-001',
        period: 'Tháng 11/2024',
        dueDate: '05/12/2024',
        roomRent: 3500000,
        electricity: 380000,
        water: 120000,
        internet: 100000,
        total: 4100000,
        status: 'paid',
        paidAt: '03/12/2024',
    },
];

export default function TenantInvoicesPage() {
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    };

    const filteredInvoices = mockInvoices.filter(inv =>
        filterStatus === 'all' || inv.status === filterStatus
    );

    const totalPending = mockInvoices
        .filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + inv.total, 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Hóa đơn</h1>
                <p className="text-muted-foreground">Quản lý và thanh toán hóa đơn hàng tháng</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Chưa thanh toán</p>
                                <p className="text-2xl font-bold text-orange-600">{formatPrice(totalPending)}</p>
                            </div>
                            <AlertCircle className="h-10 w-10 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Đã thanh toán</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {mockInvoices.filter(i => i.status === 'paid').length} hóa đơn
                                </p>
                            </div>
                            <CheckCircle className="h-10 w-10 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Tổng hóa đơn</p>
                                <p className="text-2xl font-bold">{mockInvoices.length}</p>
                            </div>
                            <Receipt className="h-10 w-10 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter and Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Danh sách hóa đơn
                    </CardTitle>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Lọc theo trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="pending">Chưa thanh toán</SelectItem>
                            <SelectItem value="paid">Đã thanh toán</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Số hóa đơn</TableHead>
                                <TableHead>Kỳ</TableHead>
                                <TableHead>Hạn thanh toán</TableHead>
                                <TableHead>Tổng tiền</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInvoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                                    <TableCell>{invoice.period}</TableCell>
                                    <TableCell>{invoice.dueDate}</TableCell>
                                    <TableCell className="font-semibold">{formatPrice(invoice.total)}</TableCell>
                                    <TableCell>
                                        <Badge className={invoice.status === 'paid' ? 'bg-green-500' : 'bg-orange-500'}>
                                            {invoice.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {invoice.status === 'pending' && (
                                                <Button size="sm">
                                                    <CreditCard className="h-4 w-4 mr-1" />
                                                    Thanh toán
                                                </Button>
                                            )}
                                            <Button variant="outline" size="sm">
                                                <Download className="h-4 w-4 mr-1" />
                                                PDF
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
