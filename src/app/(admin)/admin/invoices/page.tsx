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
import { Receipt, Plus, Search, Eye, Download, Send, CheckCircle, AlertCircle, Clock, Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const invoiceSchema = z.object({
    contractId: z.string().min(1, 'Vui lòng chọn hợp đồng'),
    periodStart: z.string().min(1, 'Vui lòng chọn kỳ bắt đầu'),
    periodEnd: z.string().min(1, 'Vui lòng chọn kỳ kết thúc'),
    dueDate: z.string().min(1, 'Vui lòng chọn hạn thanh toán'),
    rentAmount: z.number().min(0, 'Tiền thuê phải >= 0'),
    electricityUsage: z.number().min(0, 'Số điện >= 0'),
    electricityRate: z.number().min(0, 'Giá điện >= 0'),
    waterUsage: z.number().min(0, 'Số nước >= 0'),
    waterRate: z.number().min(0, 'Giá nước >= 0'),
    otherFees: z.number().min(0).optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export default function AdminInvoicesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const queryClient = useQueryClient();

    const form = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            contractId: '',
            periodStart: '',
            periodEnd: '',
            dueDate: '',
            rentAmount: 0,
            electricityUsage: 0,
            electricityRate: 3500,
            waterUsage: 0,
            waterRate: 25000,
            otherFees: 0,
        },
    });

    const { data: response, isLoading } = useQuery({
        queryKey: ['invoices', statusFilter],
        queryFn: () => api.getInvoices(statusFilter !== 'all' ? { status: statusFilter } : undefined)
    });

    // Fetch active contracts for dropdown
    const { data: contractsResponse } = useQuery({
        queryKey: ['active-contracts'],
        queryFn: () => api.getContracts({ status: 'ACTIVE' })
    });

    const invoices = response?.data || [];
    const contracts = Array.isArray(contractsResponse?.data) ? contractsResponse.data : [];

    const createMutation = useMutation({
        mutationFn: (data: InvoiceFormData) => {
            const totalAmount =
                data.rentAmount +
                (data.electricityUsage * data.electricityRate) +
                (data.waterUsage * data.waterRate) +
                (data.otherFees || 0);

            return api.createInvoice({
                ...data,
                totalAmount,
                electricityAmount: data.electricityUsage * data.electricityRate,
                waterAmount: data.waterUsage * data.waterRate,
            });
        },
        onSuccess: () => {
            toast.success('Đã tạo hóa đơn mới');
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            setIsDialogOpen(false);
            form.reset();
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Lỗi khi tạo hóa đơn');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteInvoice(id),
        onSuccess: () => {
            toast.success('Đã xóa hóa đơn');
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
        onError: () => toast.error('Lỗi khi xóa')
    });

    const handleDelete = (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa hóa đơn này không?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleAdd = () => {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const dueDate = new Date(today.getFullYear(), today.getMonth() + 1, 10);

        form.reset({
            contractId: '',
            periodStart: firstDayOfMonth.toISOString().split('T')[0],
            periodEnd: lastDayOfMonth.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            rentAmount: 0,
            electricityUsage: 0,
            electricityRate: 3500,
            waterUsage: 0,
            waterRate: 25000,
            otherFees: 0,
        });
        setIsDialogOpen(true);
    };

    // When contract is selected, update rentAmount
    const handleContractChange = (contractId: string) => {
        form.setValue('contractId', contractId);
        const selectedContract: any = contracts.find((c: any) => c.id === contractId);
        if (selectedContract) {
            form.setValue('rentAmount', selectedContract.rentPrice || 0);
        }
    };


    const onSubmit = (data: InvoiceFormData) => {
        createMutation.mutate(data);
    };

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ';
    const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '---';

    const filteredInvoices = Array.isArray(invoices) ? invoices.filter((invoice: any) => {
        const matchesSearch =
            invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.contract?.tenant?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    }) : [];

    const paidCount = Array.isArray(invoices) ? invoices.filter((i: any) => i.status === 'PAID').length : 0;
    const pendingCount = Array.isArray(invoices) ? invoices.filter((i: any) => i.status === 'PENDING').length : 0;
    const overdueCount = Array.isArray(invoices) ? invoices.filter((i: any) => i.status === 'OVERDUE').length : 0;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PAID': return <Badge className="bg-green-500">Đã thanh toán</Badge>;
            case 'PENDING': return <Badge className="bg-orange-500">Chờ thanh toán</Badge>;
            case 'OVERDUE': return <Badge className="bg-red-500">Quá hạn</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    // Calculate total in form
    const watchedValues = form.watch();
    const calculatedTotal =
        (watchedValues.rentAmount || 0) +
        ((watchedValues.electricityUsage || 0) * (watchedValues.electricityRate || 0)) +
        ((watchedValues.waterUsage || 0) * (watchedValues.waterRate || 0)) +
        (watchedValues.otherFees || 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý hóa đơn</h1>
                    <p className="text-muted-foreground">Quản lý và theo dõi hóa đơn thanh toán</p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo hóa đơn
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Receipt className="h-10 w-10 text-blue-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Tổng hóa đơn</p>
                            <p className="text-2xl font-bold">{Array.isArray(invoices) ? invoices.length : 0}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Đã thanh toán</p>
                            <p className="text-2xl font-bold">{paidCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Clock className="h-10 w-10 text-orange-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Chờ thanh toán</p>
                            <p className="text-2xl font-bold">{pendingCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Quá hạn</p>
                            <p className="text-2xl font-bold">{overdueCount}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <CardTitle>Danh sách hóa đơn</CardTitle>
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
                                <SelectItem value="PAID">Đã thanh toán</SelectItem>
                                <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
                                <SelectItem value="OVERDUE">Quá hạn</SelectItem>
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
                                    <TableHead>Số hóa đơn</TableHead>
                                    <TableHead>Người thuê</TableHead>
                                    <TableHead>Kỳ</TableHead>
                                    <TableHead>Tổng tiền</TableHead>
                                    <TableHead>Hạn thanh toán</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInvoices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center p-4">Không có dữ liệu</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredInvoices.map((invoice: any) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                                            <TableCell>{invoice.contract?.tenant?.fullName || '---'}</TableCell>
                                            <TableCell className="text-sm">
                                                {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                                            </TableCell>
                                            <TableCell className="font-semibold text-primary">{formatPrice(invoice.totalAmount)}</TableCell>
                                            <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />Xem</DropdownMenuItem>
                                                        <DropdownMenuItem><Download className="h-4 w-4 mr-2" />PDF</DropdownMenuItem>
                                                        <DropdownMenuItem><Send className="h-4 w-4 mr-2" />Gửi</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(invoice.id)}>
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

            {/* Create Invoice Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Tạo hóa đơn mới</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="contractId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hợp đồng *</FormLabel>
                                        <Select onValueChange={handleContractChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn hợp đồng" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {contracts.map((contract: any) => (
                                                    <SelectItem key={contract.id} value={contract.id}>
                                                        {contract.contractNumber} - {contract.tenant?.fullName} - {contract.room?.name}
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
                                    name="periodStart"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Kỳ từ ngày *</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="periodEnd"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Đến ngày *</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hạn thanh toán *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="rentAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tiền thuê (VNĐ)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="electricityUsage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Số điện (kWh)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="electricityRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Giá điện (VNĐ/kWh)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="waterUsage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Số nước (m³)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="waterRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Giá nước (VNĐ/m³)</FormLabel>
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
                                name="otherFees"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phí khác (VNĐ)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Total preview */}
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Tổng cộng:</span>
                                    <span className="text-primary">{formatPrice(calculatedTotal)}</span>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Hủy
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Tạo hóa đơn
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
