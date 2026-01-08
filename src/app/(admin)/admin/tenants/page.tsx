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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Users, Plus, Search, Eye, Mail, Phone, Loader2, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const tenantSchema = z.object({
    fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ').optional().or(z.literal('')),
    idNumber: z.string().optional(),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional(),
});

type TenantFormData = z.infer<typeof tenantSchema>;

export default function AdminTenantsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<any>(null);
    const queryClient = useQueryClient();

    const form = useForm<TenantFormData>({
        resolver: zodResolver(tenantSchema),
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            idNumber: '',
            password: '',
        },
    });

    const { data: response, isLoading } = useQuery({
        queryKey: ['tenants'],
        queryFn: () => api.getTenants()
    });

    const tenants = response?.data || [];

    // Register mutation (for creating new tenant)
    const createMutation = useMutation({
        mutationFn: (data: TenantFormData) => api.register({
            email: data.email,
            password: data.password || '',
            fullName: data.fullName,
            phone: data.phone,
            role: 'tenant',
        }),

        onSuccess: () => {
            toast.success('Đã tạo người thuê mới');
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            setIsDialogOpen(false);
            form.reset();
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Lỗi khi tạo người thuê');
        }
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<TenantFormData> }) =>
            api.updateTenant(id, data),
        onSuccess: () => {
            toast.success('Đã cập nhật người thuê');
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            setIsDialogOpen(false);
            setEditingTenant(null);
            form.reset();
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Lỗi khi cập nhật');
        }
    });

    const handleAdd = () => {
        setEditingTenant(null);
        form.reset({
            fullName: '',
            email: '',
            phone: '',
            idNumber: '',
            password: '',
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (tenant: any) => {
        setEditingTenant(tenant);
        form.reset({
            fullName: tenant.fullName || '',
            email: tenant.email || '',
            phone: tenant.phone || '',
            idNumber: tenant.idNumber || '',
            password: '', // Don't show password
        });
        setIsDialogOpen(true);
    };

    const onSubmit = (data: TenantFormData) => {
        if (editingTenant) {
            // Remove password if empty (not updating)
            const updateData = { ...data };
            if (!updateData.password) {
                delete updateData.password;
            }
            updateMutation.mutate({ id: editingTenant.id, data: updateData });
        } else {
            createMutation.mutate(data);
        }
    };

    const filteredTenants = Array.isArray(tenants) ? tenants.filter((tenant: any) =>
        tenant.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.phone?.includes(searchQuery)
    ) : [];

    const activeCount = Array.isArray(tenants) ? tenants.filter((t: any) =>
        t.role === 'TENANT' || t.role === 'tenant'
    ).length : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý người thuê</h1>
                    <p className="text-muted-foreground">Quản lý tất cả người thuê trong hệ thống</p>
                </div>
                <Button onClick={handleAdd}>
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
                            <p className="text-2xl font-bold">{Array.isArray(tenants) ? tenants.length : 0}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Users className="h-10 w-10 text-green-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Đang hoạt động</p>
                            <p className="text-2xl font-bold">{activeCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Users className="h-10 w-10 text-orange-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Mới trong tháng</p>
                            <p className="text-2xl font-bold">-</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
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
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Người thuê</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Điện thoại</TableHead>
                                    <TableHead>CCCD/CMND</TableHead>
                                    <TableHead>Vai trò</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTenants.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center p-4">Không có dữ liệu</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTenants.map((tenant: any) => (
                                        <TableRow key={tenant.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={tenant.avatar} />
                                                        <AvatarFallback>{tenant.fullName?.charAt(0) || 'U'}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{tenant.fullName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    {tenant.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    {tenant.phone || '---'}
                                                </div>
                                            </TableCell>
                                            <TableCell>{tenant.idNumber || '---'}</TableCell>
                                            <TableCell>
                                                <Badge variant={tenant.role === 'TENANT' || tenant.role === 'tenant' ? 'default' : 'secondary'}>
                                                    {tenant.role === 'TENANT' || tenant.role === 'tenant' ? 'Người thuê' : tenant.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />Xem chi tiết</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEdit(tenant)}>
                                                            <Edit className="h-4 w-4 mr-2" />Chỉnh sửa
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

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingTenant ? 'Chỉnh sửa người thuê' : 'Thêm người thuê mới'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Họ và tên *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nguyễn Văn A" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email *</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="email@example.com" {...field} disabled={!!editingTenant} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Số điện thoại</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0901234567" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="idNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CCCD/CMND</FormLabel>
                                        <FormControl>
                                            <Input placeholder="079123456789" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {!editingTenant && (
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mật khẩu *</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Hủy
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    {editingTenant ? 'Cập nhật' : 'Tạo mới'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
