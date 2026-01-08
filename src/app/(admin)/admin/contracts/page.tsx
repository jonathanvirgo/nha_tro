"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileText, Plus, Search, Eye, Download, Calendar, CheckCircle, AlertCircle, Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const contractSchema = z.object({
    roomId: z.string().min(1, 'Vui lòng chọn phòng'),
    tenantId: z.string().min(1, 'Vui lòng chọn người thuê'),
    startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
    endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
    rentPrice: z.number().min(0, 'Giá thuê phải >= 0'),
    depositAmount: z.number().min(0, 'Tiền cọc phải >= 0'),
});

type ContractFormData = z.infer<typeof contractSchema>;

export default function AdminContractsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const queryClient = useQueryClient();

    const form = useForm<ContractFormData>({
        resolver: zodResolver(contractSchema),
        defaultValues: {
            roomId: '',
            tenantId: '',
            startDate: '',
            endDate: '',
            rentPrice: 0,
            depositAmount: 0,
        },
    });

    const { data: response, isLoading } = useQuery({
        queryKey: ['contracts', statusFilter],
        queryFn: () => api.getContracts(statusFilter !== 'all' ? { status: statusFilter } : undefined)
    });

    // Fetch available rooms
    const { data: roomsResponse } = useQuery({
        queryKey: ['available-rooms'],
        queryFn: () => api.searchRooms({ status: 'AVAILABLE' })
    });

    // Fetch tenants
    const { data: tenantsResponse } = useQuery({
        queryKey: ['tenants-list'],
        queryFn: () => api.getTenants()
    });

    const contracts = response?.data || [];
    const rooms = Array.isArray(roomsResponse?.data) ? roomsResponse.data : [];
    const tenants = Array.isArray(tenantsResponse?.data) ? tenantsResponse.data : [];

    const createMutation = useMutation({
        mutationFn: (data: ContractFormData) => api.createContract(data),
        onSuccess: () => {
            toast.success('Đã tạo hợp đồng mới');
            queryClient.invalidateQueries({ queryKey: ['contracts'] });
            queryClient.invalidateQueries({ queryKey: ['available-rooms'] });
            setIsDialogOpen(false);
            form.reset();
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Lỗi khi tạo hợp đồng');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteContract(id),
        onSuccess: () => {
            toast.success('Đã xóa hợp đồng');
            queryClient.invalidateQueries({ queryKey: ['contracts'] });
        },
        onError: () => toast.error('Lỗi khi xóa')
    });

    const handleDelete = (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa hợp đồng này không?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleAdd = () => {
        form.reset({
            roomId: '',
            tenantId: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            rentPrice: 0,
            depositAmount: 0,
        });
        setIsDialogOpen(true);
    };

    const onSubmit = (data: ContractFormData) => {
        createMutation.mutate(data);
    };

    // When room is selected, update rentPrice
    const handleRoomChange = (roomId: string) => {
        form.setValue('roomId', roomId);
        const selectedRoom: any = rooms.find((r: any) => r.id === roomId);
        if (selectedRoom) {
            form.setValue('rentPrice', selectedRoom.price || 0);
            form.setValue('depositAmount', (selectedRoom.price || 0) * 2);
        }
    };


    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ';
    const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '---';

    const filteredContracts = Array.isArray(contracts) ? contracts.filter((contract: any) => {
        const matchesSearch =
            contract.contractNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contract.tenant?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contract.room?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    }) : [];

    const activeCount = Array.isArray(contracts) ? contracts.filter((c: any) => c.status === 'ACTIVE').length : 0;
    const expiredCount = Array.isArray(contracts) ? contracts.filter((c: any) => c.status === 'EXPIRED' || c.status === 'TERMINATED').length : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý hợp đồng</h1>
                    <p className="text-muted-foreground">Quản lý tất cả hợp đồng thuê phòng</p>
                </div>
                <Button onClick={handleAdd}>
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
                            <p className="text-2xl font-bold">{Array.isArray(contracts) ? contracts.length : 0}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Đang hiệu lực</p>
                            <p className="text-2xl font-bold">{activeCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <AlertCircle className="h-10 w-10 text-orange-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Sắp hết hạn</p>
                            <p className="text-2xl font-bold">-</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Calendar className="h-10 w-10 text-gray-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Đã hết hạn</p>
                            <p className="text-2xl font-bold">{expiredCount}</p>
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
                                <SelectItem value="ACTIVE">Hiệu lực</SelectItem>
                                <SelectItem value="EXPIRED">Hết hạn</SelectItem>
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
                                {filteredContracts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center p-4">Không có dữ liệu</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredContracts.map((contract: any) => (
                                        <TableRow key={contract.id}>
                                            <TableCell className="font-medium">{contract.contractNumber}</TableCell>
                                            <TableCell>{contract.tenant?.fullName || '---'}</TableCell>
                                            <TableCell>{contract.room?.name || '---'}</TableCell>
                                            <TableCell className="text-sm">
                                                {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                                            </TableCell>
                                            <TableCell className="font-semibold text-primary">{formatPrice(contract.rentPrice)}</TableCell>
                                            <TableCell>
                                                <Badge className={contract.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'}>
                                                    {contract.status === 'ACTIVE' ? 'Hiệu lực' : contract.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />Xem</DropdownMenuItem>
                                                        <DropdownMenuItem><Download className="h-4 w-4 mr-2" />PDF</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(contract.id)}>
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

            {/* Create Contract Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Tạo hợp đồng mới</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="roomId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phòng *</FormLabel>
                                        <Select onValueChange={handleRoomChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn phòng còn trống" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {rooms.map((room: any) => (
                                                    <SelectItem key={room.id} value={room.id}>
                                                        {room.name} - {room.motel?.name || 'N/A'} ({formatPrice(room.price)}/tháng)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="tenantId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Người thuê *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn người thuê" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {tenants.filter((t: any) => t.role === 'tenant' || t.role === 'TENANT').map((tenant: any) => (
                                                    <SelectItem key={tenant.id} value={tenant.id}>
                                                        {tenant.fullName} - {tenant.phone || tenant.email}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ngày bắt đầu *</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ngày kết thúc *</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="rentPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Giá thuê (VNĐ/tháng) *</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="depositAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tiền cọc (VNĐ) *</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Hủy
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Tạo hợp đồng
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
