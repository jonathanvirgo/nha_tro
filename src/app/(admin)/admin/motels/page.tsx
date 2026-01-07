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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building, Plus, Search, MoreHorizontal, MapPin, Home, Users, Edit, Trash2 } from 'lucide-react';

const mockMotels = [
    {
        id: '1',
        name: 'Nhà Trọ Bình An',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        totalRooms: 15,
        occupiedRooms: 12,
        status: 'active',
    },
    {
        id: '2',
        name: 'Nhà Trọ Hạnh Phúc',
        address: '456 Đường DEF, Quận 3, TP.HCM',
        totalRooms: 10,
        occupiedRooms: 9,
        status: 'active',
    },
    {
        id: '3',
        name: 'Nhà Trọ Thành Công',
        address: '789 Đường GHI, Quận 7, TP.HCM',
        totalRooms: 20,
        occupiedRooms: 17,
        status: 'active',
    },
];

export default function AdminMotelsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMotels = mockMotels.filter(motel =>
        motel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        motel.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalRooms = mockMotels.reduce((sum, m) => sum + m.totalRooms, 0);
    const totalOccupied = mockMotels.reduce((sum, m) => sum + m.occupiedRooms, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý nhà trọ</h1>
                    <p className="text-muted-foreground">Quản lý tất cả các nhà trọ của bạn</p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm nhà trọ
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Building className="h-10 w-10 text-blue-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Tổng nhà trọ</p>
                            <p className="text-2xl font-bold">{mockMotels.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Home className="h-10 w-10 text-green-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Tổng phòng</p>
                            <p className="text-2xl font-bold">{totalRooms}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Users className="h-10 w-10 text-purple-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Đang cho thuê</p>
                            <p className="text-2xl font-bold">{totalOccupied}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Home className="h-10 w-10 text-orange-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Còn trống</p>
                            <p className="text-2xl font-bold">{totalRooms - totalOccupied}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Danh sách nhà trọ</CardTitle>
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
                                <TableHead>Tên nhà trọ</TableHead>
                                <TableHead>Địa chỉ</TableHead>
                                <TableHead>Phòng</TableHead>
                                <TableHead>Tỷ lệ lấp đầy</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMotels.map((motel) => (
                                <TableRow key={motel.id}>
                                    <TableCell className="font-medium">{motel.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            {motel.address}
                                        </div>
                                    </TableCell>
                                    <TableCell>{motel.occupiedRooms}/{motel.totalRooms}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full"
                                                    style={{ width: `${(motel.occupiedRooms / motel.totalRooms) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm">{Math.round((motel.occupiedRooms / motel.totalRooms) * 100)}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-green-500">Hoạt động</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Chỉnh sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Xóa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
