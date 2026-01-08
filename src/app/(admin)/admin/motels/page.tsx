'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
import { ImageUpload } from '@/components/ui/image-upload';
import { Plus, Search, MapPin, MoreHorizontal, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const motelSchema = z.object({
    name: z.string().min(2, 'Tên nhà trọ phải có ít nhất 2 ký tự'),
    address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']),
    images: z.array(z.string()).optional(),
});

type MotelFormData = z.infer<typeof motelSchema>;

export default function MotelsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMotel, setEditingMotel] = useState<any>(null);
    const [images, setImages] = useState<string[]>([]);
    const queryClient = useQueryClient();

    const form = useForm<MotelFormData>({
        resolver: zodResolver(motelSchema),
        defaultValues: {
            name: '',
            address: '',
            description: '',
            status: 'ACTIVE',
            images: [],
        },
    });

    const { data: response, isLoading } = useQuery({
        queryKey: ['motels'],
        queryFn: () => api.getMotels()
    });

    const motels = response?.data || [];

    const createMutation = useMutation({
        mutationFn: (data: MotelFormData) => api.createMotel({ ...data, images }),
        onSuccess: () => {
            toast.success('Đã tạo nhà trọ mới');
            queryClient.invalidateQueries({ queryKey: ['motels'] });
            setIsDialogOpen(false);
            form.reset();
            setImages([]);
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Lỗi khi tạo nhà trọ');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: MotelFormData }) => api.updateMotel(id, { ...data, images }),
        onSuccess: () => {
            toast.success('Đã cập nhật nhà trọ');
            queryClient.invalidateQueries({ queryKey: ['motels'] });
            setIsDialogOpen(false);
            setEditingMotel(null);
            form.reset();
            setImages([]);
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Lỗi khi cập nhật');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteMotel(id),
        onSuccess: () => {
            toast.success('Đã xóa nhà trọ');
            queryClient.invalidateQueries({ queryKey: ['motels'] });
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Lỗi khi xóa');
        }
    });

    const handleDelete = (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa không?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleEdit = (motel: any) => {
        setEditingMotel(motel);
        form.reset({
            name: motel.name || '',
            address: motel.address || '',
            description: motel.description || '',
            status: motel.status || 'ACTIVE',
        });
        // Extract image URLs from motel.images array
        const motelImages = Array.isArray(motel.images)
            ? motel.images.map((img: any) => img.url || img)
            : [];
        setImages(motelImages);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingMotel(null);
        form.reset({
            name: '',
            address: '',
            description: '',
            status: 'ACTIVE',
        });
        setImages([]);
        setIsDialogOpen(true);
    };

    const onSubmit = (data: MotelFormData) => {
        if (editingMotel) {
            updateMutation.mutate({ id: editingMotel.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    // Filter
    const filteredMotels = Array.isArray(motels) ? motels.filter((motel: any) =>
        motel.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        motel.address?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold tracking-tight'>Quản lý nhà trọ</h1>
                    <p className='text-muted-foreground'>Quản lý danh sách nhà trọ và phòng của bạn</p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className='h-4 w-4 mr-2' />
                    Thêm nhà trọ
                </Button>
            </div>

            <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                    <CardTitle>Danh sách nhà trọ</CardTitle>
                    <div className='relative w-64'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder='Tìm kiếm...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='pl-10'
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className='flex justify-center p-8'><Loader2 className='animate-spin' /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tên nhà trọ</TableHead>
                                    <TableHead>Địa chỉ</TableHead>
                                    <TableHead>Quy mô</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className='text-right'>Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMotels.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className='text-center p-4'>Không có dữ liệu</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredMotels.map((motel: any) => (
                                        <TableRow key={motel.id}>
                                            <TableCell className='font-medium'>{motel.name}</TableCell>
                                            <TableCell>
                                                <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                                                    <MapPin className='h-4 w-4' />
                                                    {motel.address}
                                                </div>
                                            </TableCell>
                                            <TableCell>{motel.totalRooms || motel._count?.rooms || 0} phòng</TableCell>
                                            <TableCell>
                                                <Badge variant={motel.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                    {motel.status === 'ACTIVE' ? 'Hoạt động' : 'Ngưng'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant='ghost' size='icon'>
                                                            <MoreHorizontal className='h-4 w-4' />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align='end'>
                                                        <DropdownMenuItem onClick={() => handleEdit(motel)}>
                                                            <Edit className='h-4 w-4 mr-2' />
                                                            Chỉnh sửa
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className='text-red-600' onClick={() => handleDelete(motel.id)}>
                                                            <Trash2 className='h-4 w-4 mr-2' />
                                                            Xóa
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingMotel ? 'Chỉnh sửa nhà trọ' : 'Thêm nhà trọ mới'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tên nhà trọ *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="VD: Nhà trọ Sunshine" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Địa chỉ *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="VD: 123 Nguyễn Văn Cừ, Quận 5" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mô tả</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Mô tả về nhà trọ..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <FormLabel>Hình ảnh</FormLabel>
                                <ImageUpload
                                    images={images}
                                    onChange={setImages}
                                    maxImages={10}
                                    folder="nhatro/motels"
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Trạng thái</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn trạng thái" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                                                <SelectItem value="INACTIVE">Ngưng hoạt động</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Hủy
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    {editingMotel ? 'Cập nhật' : 'Tạo mới'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
