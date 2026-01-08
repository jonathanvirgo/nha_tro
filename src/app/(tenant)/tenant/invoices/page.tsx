"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
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
import { Receipt, Eye, Download, CreditCard, Loader2 } from 'lucide-react';

export default function TenantInvoicesPage() {
    const { data: response, isLoading } = useQuery({
        queryKey: ['my-invoices'],
        queryFn: () => api.getInvoices({ mine: 'true' })
    });

    const invoices = response?.data || [];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ';
    };

    const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '---';

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PAID': return <Badge className="bg-green-500">Đã thanh toán</Badge>;
            case 'PENDING': return <Badge className="bg-orange-500">Chờ thanh toán</Badge>;
            case 'OVERDUE': return <Badge className="bg-red-500">Quá hạn</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Hóa đơn của tôi</h1>
                <p className="text-muted-foreground">Quản lý và thanh toán hóa đơn (API Real Data)</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Receipt className="h-10 w-10 text-blue-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Tổng hóa đơn</p>
                            <p className="text-2xl font-bold">{Array.isArray(invoices) ? invoices.length : 0}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <CreditCard className="h-10 w-10 text-orange-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Chờ thanh toán</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {Array.isArray(invoices) ? invoices.filter((i: any) => i.status === 'PENDING').length : 0}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Receipt className="h-10 w-10 text-green-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Đã thanh toán</p>
                            <p className="text-2xl font-bold">
                                {Array.isArray(invoices) ? invoices.filter((i: any) => i.status === 'PAID').length : 0}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Danh sách hóa đơn
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Số hóa đơn</TableHead>
                                    <TableHead>Kỳ</TableHead>
                                    <TableHead>Tổng tiền</TableHead>
                                    <TableHead>Hạn thanh toán</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.isArray(invoices) && invoices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center p-4">Không có hóa đơn nào</TableCell>
                                    </TableRow>
                                ) : (
                                    Array.isArray(invoices) && invoices.map((invoice: any) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                                            <TableCell>Tháng {invoice.month}/{invoice.year}</TableCell>
                                            <TableCell className="font-semibold text-primary">
                                                {formatPrice(invoice.totalAmount)}
                                            </TableCell>
                                            <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Xem
                                                    </Button>
                                                    {invoice.status === 'PENDING' && (
                                                        <Button size="sm">
                                                            <CreditCard className="h-4 w-4 mr-1" />
                                                            Thanh toán
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
