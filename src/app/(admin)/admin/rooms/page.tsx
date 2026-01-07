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
import { Home, Plus, Search, Edit, Eye, CheckCircle, XCircle } from 'lucide-react';

const mockRooms = [
    { id: '1', name: 'Phòng A101', motel: 'Nhà Trọ Bình An', price: 3500000, area: 25, status: 'occupied', tenant: 'Nguyễn Văn A' },
    { id: '2', name: 'Phòng A102', motel: 'Nhà Trọ Bình An', price: 3200000, area: 22, status: 'available', tenant: null },
    { id: '3', name: 'Phòng B201', motel: 'Nhà Trọ Hạnh Phúc', price: 4000000, area: 30, status: 'occupied', tenant: 'Trần Thị B' },
    { id: '4', name: 'Phòng B202', motel: 'Nhà Trọ Hạnh Phúc', price: 3800000, area: 28, status: 'maintenance', tenant: null },
];

export default function AdminRoomsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

    const filteredRooms = mockRooms.filter(room => {
        const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.motel.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'available': return <Badge className="bg-green-500">Trống</Badge>;
            case 'occupied': return <Badge className="bg-blue-500">Đang thuê</Badge>;
            case 'maintenance': return <Badge className="bg-orange-500">Đang sửa</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý phòng</h1>
                    <p className="text-muted-foreground">Quản lý tất cả các phòng trong hệ thống</p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm phòng
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Home className="h-10 w-10 text-blue-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Tổng phòng</p>
                            <p className="text-2xl font-bold">{mockRooms.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Còn trống</p>
                            <p className="text-2xl font-bold">{mockRooms.filter(r => r.status === 'available').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Home className="h-10 w-10 text-blue-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Đang thuê</p>
                            <p className="text-2xl font-bold">{mockRooms.filter(r => r.status === 'occupied').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <XCircle className="h-10 w-10 text-orange-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Đang sửa</p>
                            <p className="text-2xl font-bold">{mockRooms.filter(r => r.status === 'maintenance').length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <CardTitle>Danh sách phòng</CardTitle>
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
                                <SelectItem value="available">Trống</SelectItem>
                                <SelectItem value="occupied">Đang thuê</SelectItem>
                                <SelectItem value="maintenance">Đang sửa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tên phòng</TableHead>
                                <TableHead>Nhà trọ</TableHead>
                                <TableHead>Giá thuê</TableHead>
                                <TableHead>Diện tích</TableHead>
                                <TableHead>Người thuê</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRooms.map((room) => (
                                <TableRow key={room.id}>
                                    <TableCell className="font-medium">{room.name}</TableCell>
                                    <TableCell>{room.motel}</TableCell>
                                    <TableCell className="font-semibold text-primary">{formatPrice(room.price)}</TableCell>
                                    <TableCell>{room.area}m²</TableCell>
                                    <TableCell>{room.tenant || '-'}</TableCell>
                                    <TableCell>{getStatusBadge(room.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4 mr-1" />
                                                Xem
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4 mr-1" />
                                                Sửa
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
