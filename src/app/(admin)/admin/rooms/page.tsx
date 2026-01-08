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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { Plus, Search, Edit, Trash2, Loader2, Filter, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

const roomSchema = z.object({
    name: z.string().min(2, 'Tên phòng phải có ít nhất 2 ký tự'),
    motelId: z.string().min(1, 'Vui lòng chọn nhà trọ'),
    price: z.number().min(0, 'Giá phải >= 0'),
    area: z.number().min(0, 'Diện tích phải >= 0'),
    description: z.string().optional(),
    status: z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE']),
});

type RoomFormData = z.infer<typeof roomSchema>;

export default function RoomsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<any>(null);
    const [images, setImages] = useState<string[]>([]);
    const queryClient = useQueryClient();

    const form = useForm<RoomFormData>({
        resolver: zodResolver(roomSchema),
        defaultValues: {
            name: '',
            motelId: '',
            price: 0,
            area: 0,
            description: '',
            status: 'AVAILABLE',
        },
    });

    // Fetch rooms
    const { data: response, isLoading } = useQuery({
        queryKey: ['rooms', statusFilter, searchQuery],
        queryFn: async () => {
            const params: any = {};
            if (searchQuery) params.keyword = searchQuery;
            if (statusFilter !== 'ALL') params.status = statusFilter;
            return api.searchRooms(params);
        }
    });

    // Fetch motels for dropdown
    const { data: motelsResponse } = useQuery({
        queryKey: ['motels-list'],
        queryFn: () => api.getMotels()
    });

    // API trả về { success: true, data: { rooms: [...] } }
    const responseData = response?.data as { rooms?: unknown[] } | undefined;
    const rooms = Array.isArray(responseData?.rooms) ? responseData.rooms : [];
    const motels = Array.isArray(motelsResponse?.data) ? motelsResponse.data : [];

    const createMutation = useMutation({
        mutationFn: ({ motelId, data }: { motelId: string; data: any }) => api.createRoom(motelId, { ...data, images }),
        onSuccess: () => {
            toast.success('Đã tạo phòng mới');
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            setIsDialogOpen(false);
            form.reset();
            setImages([]);
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Lỗi khi tạo phòng');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.updateRoom(id, { ...data, images }),
        onSuccess: () => {
            toast.success('Đã cập nhật phòng');
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            setIsDialogOpen(false);
            setEditingRoom(null);
            form.reset();
            setImages([]);
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Lỗi khi cập nhật');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteRoom(id),
        onSuccess: () => {
            toast.success('Đã xóa phòng');
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Lỗi khi xóa');
        }
    });

    const handleDelete = (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa phòng này không?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleEdit = (room: any) => {
        setEditingRoom(room);
        form.reset({
            name: room.name || '',
            motelId: room.motelId || '',
            price: room.price || 0,
            area: room.area || 0,
            description: room.description || '',
            status: room.status || 'AVAILABLE',
        });
        // Extract image URLs from room.images array
        const roomImages = Array.isArray(room.images)
            ? room.images.map((img: any) => img.url || img)
            : [];
        setImages(roomImages);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingRoom(null);
        form.reset({
            name: '',
            motelId: '',
            price: 0,
            area: 0,
            description: '',
            status: 'AVAILABLE',
        });
        setImages([]);
        setIsDialogOpen(true);
    };

    const onSubmit = (data: RoomFormData) => {
        const { motelId, ...roomData } = data;
        if (editingRoom) {
            updateMutation.mutate({ id: editingRoom.id, data: roomData });
        } else {
            createMutation.mutate({ motelId, data: roomData });
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold tracking-tight'>Quản lý phòng</h1>
                    <p className='text-muted-foreground'>Quản lý danh sách phòng trọ</p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className='h-4 w-4 mr-2' />
                    Thêm phòng
                </Button>
            </div>

            <Card>
                <CardHeader className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                    <CardTitle>Danh sách phòng</CardTitle>
                    <div className='flex items-center gap-2'>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className='w-[180px]'>
                                <Filter className='w-4 h-4 mr-2' />
                                <SelectValue placeholder='Trạng thái' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='ALL'>Tất cả trạng thái</SelectItem>
                                <SelectItem value='AVAILABLE'>Còn trống</SelectItem>
                                <SelectItem value='RENTED'>Đã thuê</SelectItem>
                                <SelectItem value='MAINTENANCE'>Bảo trì</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className='relative w-64'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                            <Input
                                placeholder='Tìm phòng...'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='pl-10'
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className='flex justify-center p-8'><Loader2 className='animate-spin' /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tên phòng</TableHead>
                                    <TableHead>Nhà trọ</TableHead>
                                    <TableHead>Giá thuê</TableHead>
                                    <TableHead>Diện tích</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className='text-right'>Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.isArray(rooms) && rooms.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className='text-center p-4'>Không tìm thấy phòng nào</TableCell>
                                    </TableRow>
                                ) : (
                                    Array.isArray(rooms) && rooms.map((room: any) => (
                                        <TableRow key={room.id}>
                                            <TableCell className='font-medium'>{room.name}</TableCell>
                                            <TableCell>{room.motel?.name || '---'}</TableCell>
                                            <TableCell>{formatPrice(room.price)}</TableCell>
                                            <TableCell>{room.area} m²</TableCell>
                                            <TableCell>
                                                <Badge className={room.status === 'AVAILABLE' ? 'bg-green-500' : (room.status === 'RENTED' ? 'bg-gray-500' : 'bg-yellow-500')}>
                                                    {room.status === 'AVAILABLE' ? 'Còn trống' : (room.status === 'RENTED' ? 'Đã thuê' : 'Bảo trì')}
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
                                                        <DropdownMenuItem onClick={() => handleEdit(room)}>
                                                            <Edit className='h-4 w-4 mr-2' />
                                                            Sửa
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className='text-red-600' onClick={() => handleDelete(room.id)}>
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
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingRoom ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="motelId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nhà trọ *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingRoom}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn nhà trọ" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {motels.map((motel: any) => (
                                                    <SelectItem key={motel.id} value={motel.id}>{motel.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tên phòng *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="VD: Phòng 101" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Giá thuê (VNĐ) *</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="area"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Diện tích (m²) *</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mô tả</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Mô tả về phòng..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <FormLabel>Hình ảnh phòng</FormLabel>
                                <ImageUpload
                                    images={images}
                                    onChange={setImages}
                                    maxImages={10}
                                    folder="nhatro/rooms"
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
                                                <SelectItem value="AVAILABLE">Còn trống</SelectItem>
                                                <SelectItem value="RENTED">Đã thuê</SelectItem>
                                                <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
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
                                    {editingRoom ? 'Cập nhật' : 'Tạo mới'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

        </div>
    );
}
