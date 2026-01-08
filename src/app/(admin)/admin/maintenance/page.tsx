"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
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
import { Wrench, Search, CheckCircle, Clock, AlertTriangle, User, Loader2, MoreHorizontal, Trash2, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function AdminMaintenancePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const queryClient = useQueryClient();

    const { data: response, isLoading } = useQuery({
        queryKey: ['maintenance-requests', statusFilter],
        queryFn: () => api.getMaintenanceRequests(statusFilter !== 'all' ? { status: statusFilter } : undefined)
    });

    const requests = response?.data || [];

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteMaintenanceRequest(id),
        onSuccess: () => {
            toast.success('Đã xóa yêu cầu');
            queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
        },
        onError: () => toast.error('Lỗi khi xóa')
    });

    const handleDelete = (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa yêu cầu này không?')) {
            deleteMutation.mutate(id);
        }
    };

    const filteredRequests = Array.isArray(requests) ? requests.filter((req: any) => {
        const matchesSearch = req.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.room?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.requestedBy?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    }) : [];

    const pendingCount = Array.isArray(requests) ? requests.filter((r: any) => r.status === 'PENDING').length : 0;
    const inProgressCount = Array.isArray(requests) ? requests.filter((r: any) => r.status === 'IN_PROGRESS').length : 0;
    const completedCount = Array.isArray(requests) ? requests.filter((r: any) => r.status === 'COMPLETED').length : 0;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <Badge className="bg-yellow-500">Chờ xử lý</Badge>;
            case 'IN_PROGRESS': return <Badge className="bg-blue-500">Đang xử lý</Badge>;
            case 'COMPLETED': return <Badge className="bg-green-500">Hoàn thành</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'LOW': return <Badge variant="outline">Thấp</Badge>;
            case 'MEDIUM': return <Badge className="bg-yellow-500">Trung bình</Badge>;
            case 'HIGH': return <Badge className="bg-orange-500">Cao</Badge>;
            case 'URGENT': return <Badge className="bg-red-500">Khẩn cấp</Badge>;
            default: return <Badge>{priority}</Badge>;
        }
    };

    const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '---';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Quản lý sửa chữa</h1>
                <p className="text-muted-foreground">Theo dõi và xử lý yêu cầu bảo trì (API Real Data)</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Wrench className="h-10 w-10 text-blue-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Tổng yêu cầu</p>
                            <p className="text-2xl font-bold">{Array.isArray(requests) ? requests.length : 0}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <AlertTriangle className="h-10 w-10 text-yellow-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Chờ xử lý</p>
                            <p className="text-2xl font-bold">{pendingCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Clock className="h-10 w-10 text-blue-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Đang xử lý</p>
                            <p className="text-2xl font-bold">{inProgressCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Hoàn thành</p>
                            <p className="text-2xl font-bold">{completedCount}</p>
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
                                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                                <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
                                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tiêu đề</TableHead>
                                    <TableHead>Phòng</TableHead>
                                    <TableHead>Người yêu cầu</TableHead>
                                    <TableHead>Mức độ</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Ngày tạo</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center p-4">Không có dữ liệu</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRequests.map((request: any) => (
                                        <TableRow key={request.id}>
                                            <TableCell className="font-medium">{request.title}</TableCell>
                                            <TableCell>{request.room?.name || '---'}</TableCell>
                                            <TableCell>{request.requestedBy?.fullName || '---'}</TableCell>
                                            <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                                            <TableCell>{formatDate(request.createdAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />Xem</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(request.id)}>
                                                            <Trash2 className="h-4 w-4 mr-2" />Xóa
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
