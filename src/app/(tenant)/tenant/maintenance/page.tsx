"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Wrench, Plus, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const mockRequests = [
    {
        id: '1',
        title: 'Điều hòa không mát',
        description: 'Điều hòa phòng không làm mát được, đã thử vệ sinh bụi nhưng không hiệu quả',
        priority: 'high',
        status: 'in_progress',
        createdAt: '25/12/2024',
        updatedAt: '26/12/2024',
    },
    {
        id: '2',
        title: 'Vòi nước bị rỉ',
        description: 'Vòi nước trong nhà tắm bị rỉ nước',
        priority: 'medium',
        status: 'completed',
        createdAt: '20/12/2024',
        updatedAt: '22/12/2024',
    },
];

const priorityLabels: Record<string, string> = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
    urgent: 'Khẩn cấp',
};

const statusLabels: Record<string, string> = {
    pending: 'Chờ xử lý',
    in_progress: 'Đang xử lý',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
};

export default function TenantMaintenancePage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');

    const handleSubmit = () => {
        if (!title || !description) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }
        toast.success('Yêu cầu sửa chữa đã được gửi!');
        setIsDialogOpen(false);
        setTitle('');
        setDescription('');
        setPriority('medium');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500';
            case 'in_progress': return 'bg-blue-500';
            case 'completed': return 'bg-green-500';
            case 'cancelled': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low': return 'bg-gray-500';
            case 'medium': return 'bg-yellow-500';
            case 'high': return 'bg-orange-500';
            case 'urgent': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Báo hỏng / Sửa chữa</h1>
                    <p className="text-muted-foreground">Gửi yêu cầu sửa chữa và theo dõi tiến độ</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Tạo yêu cầu
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tạo yêu cầu sửa chữa mới</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Tiêu đề</Label>
                                <Input
                                    id="title"
                                    placeholder="VD: Điều hòa không hoạt động"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Mô tả chi tiết</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Mô tả chi tiết vấn đề cần sửa chữa..."
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priority">Mức độ ưu tiên</Label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Thấp</SelectItem>
                                        <SelectItem value="medium">Trung bình</SelectItem>
                                        <SelectItem value="high">Cao</SelectItem>
                                        <SelectItem value="urgent">Khẩn cấp</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Hủy
                                </Button>
                                <Button onClick={handleSubmit}>
                                    Gửi yêu cầu
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Clock className="h-10 w-10 text-blue-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Đang xử lý</p>
                            <p className="text-2xl font-bold">
                                {mockRequests.filter(r => r.status === 'in_progress').length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Hoàn thành</p>
                            <p className="text-2xl font-bold">
                                {mockRequests.filter(r => r.status === 'completed').length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Wrench className="h-10 w-10 text-purple-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Tổng yêu cầu</p>
                            <p className="text-2xl font-bold">{mockRequests.length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        Lịch sử yêu cầu
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tiêu đề</TableHead>
                                <TableHead>Mức độ</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                                <TableHead>Cập nhật</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockRequests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{request.title}</p>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {request.description}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getPriorityColor(request.priority)}>
                                            {priorityLabels[request.priority]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(request.status)}>
                                            {statusLabels[request.status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{request.createdAt}</TableCell>
                                    <TableCell>{request.updatedAt}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
