"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Users, Plus, Search, Eye, Mail, Phone } from 'lucide-react';

const mockTenants = [
    { id: '1', name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', phone: '0901234567', room: 'Phòng A101', motel: 'Nhà Trọ Bình An', status: 'active' },
    { id: '2', name: 'Trần Thị B', email: 'tranthib@email.com', phone: '0909876543', room: 'Phòng B201', motel: 'Nhà Trọ Hạnh Phúc', status: 'active' },
    { id: '3', name: 'Lê Văn C', email: 'levanc@email.com', phone: '0911223344', room: 'Phòng C301', motel: 'Nhà Trọ Thành Công', status: 'active' },
];

export default function AdminTenantsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTenants = mockTenants.filter(tenant =>
        tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.phone.includes(searchQuery)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý người thuê</h1>
                    <p className="text-muted-foreground">Quản lý tất cả người thuê trong hệ thống</p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm người thuê
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Users className="h-10 w-10 text-blue-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Tổng người thuê</p>
                            <p className="text-2xl font-bold">{mockTenants.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Users className="h-10 w-10 text-green-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Đang hoạt động</p>
                            <p className="text-2xl font-bold">{mockTenants.filter(t => t.status === 'active').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Users className="h-10 w-10 text-orange-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Mới trong tháng</p>
                            <p className="text-2xl font-bold">2</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Danh sách người thuê</CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Người thuê</TableHead>
                                <TableHead>Liên hệ</TableHead>
                                <TableHead>Phòng</TableHead>
                                <TableHead>Nhà trọ</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTenants.map((tenant) => (
                                <TableRow key={tenant.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>{tenant.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{tenant.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-sm">
                                                <Mail className="h-3 w-3" />
                                                {tenant.email}
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Phone className="h-3 w-3" />
                                                {tenant.phone}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{tenant.room}</TableCell>
                                    <TableCell>{tenant.motel}</TableCell>
                                    <TableCell>
                                        <Badge className="bg-green-500">Hoạt động</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm">
                                            <Eye className="h-4 w-4 mr-1" />
                                            Chi tiết
                                        </Button>
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
