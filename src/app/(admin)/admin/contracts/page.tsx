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
import { FileText, Plus, Search, Eye, Download, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

const mockContracts = [
    { id: '1', number: 'HD-202401-001', tenant: 'Nguyễn Văn A', room: 'Phòng A101', startDate: '01/01/2024', endDate: '01/01/2025', rent: 3500000, status: 'active' },
    { id: '2', number: 'HD-202402-002', tenant: 'Trần Thị B', room: 'Phòng B201', startDate: '15/02/2024', endDate: '15/02/2025', rent: 4000000, status: 'active' },
    { id: '3', number: 'HD-202312-003', tenant: 'Lê Văn C', room: 'Phòng C301', startDate: '01/12/2023', endDate: '01/12/2024', rent: 3800000, status: 'expired' },
];

export default function AdminContractsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

    const filteredContracts = mockContracts.filter(contract => {
        const matchesSearch = contract.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contract.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contract.room.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý hợp đồng</h1>
                    <p className="text-muted-foreground">Quản lý tất cả hợp đồng thuê phòng</p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo hợp đồng
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <FileText className="h-10 w-10 text-blue-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Tổng hợp đồng</p>
                            <p className="text-2xl font-bold">{mockContracts.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Đang hiệu lực</p>
                            <p className="text-2xl font-bold">{mockContracts.filter(c => c.status === 'active').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <AlertCircle className="h-10 w-10 text-orange-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Sắp hết hạn</p>
                            <p className="text-2xl font-bold">3</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Calendar className="h-10 w-10 text-gray-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Đã hết hạn</p>
                            <p className="text-2xl font-bold">{mockContracts.filter(c => c.status === 'expired').length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <CardTitle>Danh sách hợp đồng</CardTitle>
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
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="active">Hiệu lực</SelectItem>
                                <SelectItem value="expired">Hết hạn</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Số hợp đồng</TableHead>
                                <TableHead>Người thuê</TableHead>
                                <TableHead>Phòng</TableHead>
                                <TableHead>Thời hạn</TableHead>
                                <TableHead>Giá thuê</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredContracts.map((contract) => (
                                <TableRow key={contract.id}>
                                    <TableCell className="font-medium">{contract.number}</TableCell>
                                    <TableCell>{contract.tenant}</TableCell>
                                    <TableCell>{contract.room}</TableCell>
                                    <TableCell className="text-sm">
                                        {contract.startDate} - {contract.endDate}
                                    </TableCell>
                                    <TableCell className="font-semibold text-primary">{formatPrice(contract.rent)}</TableCell>
                                    <TableCell>
                                        <Badge className={contract.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                                            {contract.status === 'active' ? 'Hiệu lực' : 'Hết hạn'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4 mr-1" />
                                                Xem
                                            </Button>
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
