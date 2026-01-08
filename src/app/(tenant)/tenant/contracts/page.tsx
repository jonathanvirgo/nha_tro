"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { FileText, Eye, Download, Calendar, Loader2 } from 'lucide-react';

export default function TenantContractsPage() {
    const [selectedContract, setSelectedContract] = useState<any>(null);

    const { data: response, isLoading } = useQuery({
        queryKey: ['my-contracts'],
        queryFn: () => api.getContracts({ mine: 'true' })
    });

    const contracts = response?.data || [];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ';
    };

    const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '---';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Hợp đồng của tôi</h1>
                <p className="text-muted-foreground">Quản lý các hợp đồng thuê phòng (API Real Data)</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Danh sách hợp đồng
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Số hợp đồng</TableHead>
                                    <TableHead>Phòng</TableHead>
                                    <TableHead>Thời hạn</TableHead>
                                    <TableHead>Tiền thuê</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.isArray(contracts) && contracts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center p-4">Không có hợp đồng nào</TableCell>
                                    </TableRow>
                                ) : (
                                    Array.isArray(contracts) && contracts.map((contract: any) => (
                                        <TableRow key={contract.id}>
                                            <TableCell className="font-medium">{contract.contractNumber}</TableCell>
                                            <TableCell>{contract.room?.name || '---'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-primary">
                                                {formatPrice(contract.rentPrice)}/tháng
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={contract.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'}>
                                                    {contract.status === 'ACTIVE' ? 'Đang hiệu lực' : contract.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setSelectedContract(contract)}
                                                            >
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                Xem
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl">
                                                            <DialogHeader>
                                                                <DialogTitle>Chi tiết hợp đồng</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="text-sm text-muted-foreground">Số hợp đồng</p>
                                                                        <p className="font-medium">{contract.contractNumber}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm text-muted-foreground">Phòng</p>
                                                                        <p className="font-medium">{contract.room?.name || '---'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm text-muted-foreground">Ngày bắt đầu</p>
                                                                        <p className="font-medium">{formatDate(contract.startDate)}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm text-muted-foreground">Ngày kết thúc</p>
                                                                        <p className="font-medium">{formatDate(contract.endDate)}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm text-muted-foreground">Tiền thuê</p>
                                                                        <p className="font-medium text-primary">{formatPrice(contract.rentPrice)}/tháng</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm text-muted-foreground">Tiền cọc</p>
                                                                        <p className="font-medium">{formatPrice(contract.deposit)}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Button variant="outline" size="sm">
                                                        <Download className="h-4 w-4 mr-1" />
                                                        PDF
                                                    </Button>
                                                </div>
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
