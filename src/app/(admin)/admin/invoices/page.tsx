"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Receipt, Plus, Search, Eye, Download, Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const mockInvoices = [
    { id: '1', number: 'INV-202412-001', tenant: 'Nguyễn Văn A', room: 'Phòng A101', period: 'Tháng 12/2024', total: 4200000, status: 'pending', dueDate: '05/01/2025' },
    { id: '2', number: 'INV-202412-002', tenant: 'Trần Thị B', room: 'Phòng B201', period: 'Tháng 12/2024', total: 4800000, status: 'paid', dueDate: '05/01/2025' },
    { id: '3', number: 'INV-202411-001', tenant: 'Nguyễn Văn A', room: 'Phòng A101', period: 'Tháng 11/2024', total: 4100000, status: 'paid', dueDate: '05/12/2024' },
    { id: '4', number: 'INV-202411-002', tenant: 'Lê Văn C', room: 'Phòng C301', period: 'Tháng 11/2024', total: 4500000, status: 'overdue', dueDate: '05/12/2024' },
];

export default function AdminInvoicesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

    const filteredInvoices = mockInvoices.filter(invoice => {
        const matchesSearch = invoice.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.number.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPending = mockInvoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.total, 0);
    const totalOverdue = mockInvoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.total, 0);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid': return <Badge className="bg-green-500">Đã thanh toán</Badge>;
            case 'pending': return <Badge className="bg-orange-500">Chờ thanh toán</Badge>;
            case 'overdue': return <Badge className="bg-red-500">Quá hạn</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý hóa đơn</h1>
                    <p className="text-muted-foreground">Quản lý và theo dõi hóa đơn thanh toán</p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo hóa đơn
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Receipt className="h-10 w-10 text-blue-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Tổng hóa đơn</p>
                            <p className="text-2xl font-bold">{mockInvoices.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Clock className="h-10 w-10 text-orange-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Chờ thanh toán</p>
                            <p className="text-2xl font-bold text-orange-600">{formatPrice(totalPending)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Quá hạn</p>
                            <p className="text-2xl font-bold text-red-600">{formatPrice(totalOverdue)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Đã thanh toán</p>
                            <p className="text-2xl font-bold">{mockInvoices.filter(i => i.status === 'paid').length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <CardTitle>Danh sách hóa đơn</CardTitle>
                    <div className="flex gap-2">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="pending">Chờ TT</SelectItem>
                                <SelectItem value="paid">Đã TT</SelectItem>
                                <SelectItem value="overdue">Quá hạn</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Số hóa đơn</TableHead>
                                <TableHead>Người thuê</TableHead>
                                <TableHead>Phòng</TableHead>
                                <TableHead>Kỳ</TableHead>
                                <TableHead>Tổng tiền</TableHead>
                                <TableHead>Hạn TT</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInvoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.number}</TableCell>
                                    <TableCell>{invoice.tenant}</TableCell>
                                    <TableCell>{invoice.room}</TableCell>
                                    <TableCell>{invoice.period}</TableCell>
                                    <TableCell className="font-semibold">{formatPrice(invoice.total)}</TableCell>
                                    <TableCell>{invoice.dueDate}</TableCell>
                                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Send className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Download className="h-4 w-4" />
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
