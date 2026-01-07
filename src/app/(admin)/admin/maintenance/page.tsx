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
import { Wrench, Search, CheckCircle, Clock, AlertTriangle, User } from 'lucide-react';

const mockRequests = [
    { id: '1', title: 'Điều hòa không mát', room: 'Phòng A101', tenant: 'Nguyễn Văn A', priority: 'high', status: 'in_progress', createdAt: '25/12/2024', assignee: 'Kỹ thuật viên A' },
    { id: '2', title: 'Vòi nước bị rỉ', room: 'Phòng B201', tenant: 'Trần Thị B', priority: 'medium', status: 'pending', createdAt: '27/12/2024', assignee: null },
    { id: '3', title: 'Bóng đèn hỏng', room: 'Phòng C301', tenant: 'Lê Văn C', priority: 'low', status: 'completed', createdAt: '20/12/2024', assignee: 'Kỹ thuật viên B' },
    { id: '4', title: 'Ống nước bể', room: 'Phòng A102', tenant: 'Phạm Thị D', priority: 'urgent', status: 'pending', createdAt: '28/12/2024', assignee: null },
];

export default function AdminMaintenancePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredRequests = mockRequests.filter(req => {
        const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.tenant.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge className="bg-yellow-500">Chờ xử lý</Badge>;
            case 'in_progress': return <Badge className="bg-blue-500">Đang xử lý</Badge>;
            case 'completed': return <Badge className="bg-green-500">Hoàn thành</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'low': return <Badge variant="outline">Thấp</Badge>;
            case 'medium': return <Badge className="bg-yellow-500">Trung bình</Badge>;
            case 'high': return <Badge className="bg-orange-500">Cao</Badge>;
            case 'urgent': return <Badge className="bg-red-500">Khẩn cấp</Badge>;
            default: return <Badge>{priority}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Quản lý sửa chữa</h1>
                <p className="text-muted-foreground">Theo dõi và xử lý yêu cầu bảo trì</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Wrench className="h-10 w-10 text-blue-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Tổng yêu cầu</p>
                            <p className="text-2xl font-bold">{mockRequests.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <AlertTriangle className="h-10 w-10 text-yellow-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Chờ xử lý</p>
                            <p className="text-2xl font-bold">{mockRequests.filter(r => r.status === 'pending').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Clock className="h-10 w-10 text-blue-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Đang xử lý</p>
                            <p className="text-2xl font-bold">{mockRequests.filter(r => r.status === 'in_progress').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Hoàn thành</p>
                            <p className="text-2xl font-bold">{mockRequests.filter(r => r.status === 'completed').length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <CardTitle>Danh sách yêu cầu</CardTitle>
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
                                <SelectItem value="pending">Chờ xử lý</SelectItem>
                                <SelectItem value="in_progress">Đang xử lý</SelectItem>
                                <SelectItem value="completed">Hoàn thành</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tiêu đề</TableHead>
                                <TableHead>Phòng</TableHead>
                                <TableHead>Người yêu cầu</TableHead>
                                <TableHead>Mức độ</TableHead>
                                <TableHead>Người xử lý</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRequests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell className="font-medium">{request.title}</TableCell>
                                    <TableCell>{request.room}</TableCell>
                                    <TableCell>{request.tenant}</TableCell>
                                    <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                                    <TableCell>
                                        {request.assignee ? (
                                            <div className="flex items-center gap-1">
                                                <User className="h-4 w-4" />
                                                {request.assignee}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">Chưa phân công</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                                    <TableCell>{request.createdAt}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm">
                                            Xử lý
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
