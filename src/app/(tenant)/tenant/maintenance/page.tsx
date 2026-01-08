"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Wrench, Plus, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TenantMaintenancePage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newRequest, setNewRequest] = useState({ title: '', description: '', priority: 'MEDIUM' });
    const queryClient = useQueryClient();

    const { data: response, isLoading } = useQuery({
        queryKey: ['my-maintenance'],
        queryFn: () => api.getMaintenanceRequests({ mine: 'true' })
    });

    const requests = response?.data || [];

    const createMutation = useMutation({
        mutationFn: (data: any) => api.createMaintenanceRequest(data),
        onSuccess: () => {
            toast.success('Đã gửi yêu cầu sửa chữa');
            queryClient.invalidateQueries({ queryKey: ['my-maintenance'] });
            setIsDialogOpen(false);
            setNewRequest({ title: '', description: '', priority: 'MEDIUM' });
        },
        onError: () => toast.error('Lỗi khi gửi yêu cầu')
    });

    const handleSubmit = () => {
        if (!newRequest.title) {
            toast.error('Vui lòng nhập tiêu đề');
            return;
        }
        createMutation.mutate(newRequest);
    };

    const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '---';

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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Yêu cầu sửa chữa</h1>
                    <p className="text-muted-foreground">Gửi và theo dõi yêu cầu bảo trì (API Real Data)</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Gửi yêu cầu
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Gửi yêu cầu sửa chữa</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Tiêu đề</Label>
                                <Input
                                    placeholder="VD: Điều hòa không mát"
                                    value={newRequest.title}
                                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Mô tả chi tiết</Label>
                                <Textarea
                                    placeholder="Mô tả vấn đề cần sửa chữa..."
                                    value={newRequest.description}
                                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Mức độ ưu tiên</Label>
                                <Select value={newRequest.priority} onValueChange={(value) => setNewRequest({ ...newRequest, priority: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Thấp</SelectItem>
                                        <SelectItem value="MEDIUM">Trung bình</SelectItem>
                                        <SelectItem value="HIGH">Cao</SelectItem>
                                        <SelectItem value="URGENT">Khẩn cấp</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleSubmit} disabled={createMutation.isPending} className="w-full">
                                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Gửi yêu cầu
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        Danh sách yêu cầu
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tiêu đề</TableHead>
                                    <TableHead>Mức độ</TableHead>
                                    <TableHead>Ngày gửi</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.isArray(requests) && requests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center p-4">Không có yêu cầu nào</TableCell>
                                    </TableRow>
                                ) : (
                                    Array.isArray(requests) && requests.map((request: any) => (
                                        <TableRow key={request.id}>
                                            <TableCell className="font-medium">{request.title}</TableCell>
                                            <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                                            <TableCell>{formatDate(request.createdAt)}</TableCell>
                                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Chi tiết
                                                </Button>
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
