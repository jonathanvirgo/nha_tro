"use client";

import { useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar, MapPin, Clock, Phone, Eye, XCircle, CheckCircle, AlertCircle } from 'lucide-react';

const mockAppointments = [
    {
        id: '1',
        bookingCode: 'BK1234XYZ',
        roomName: 'Phòng 201 - Studio cao cấp',
        propertyName: 'Nhà Trọ Minh Tâm',
        address: '123 Nguyễn Văn Cừ, Quận 5, TP.HCM',
        date: '02/01/2025',
        time: '10:00',
        status: 'confirmed',
        ownerName: 'Nguyễn Minh Tâm',
        ownerPhone: '0901234567',
    },
    {
        id: '2',
        bookingCode: 'BK5678ABC',
        roomName: 'Phòng 102 - Phòng có ban công',
        propertyName: 'Nhà Trọ Hạnh Phúc',
        address: '456 Lê Văn Sỹ, Quận 3, TP.HCM',
        date: '28/12/2024',
        time: '14:30',
        status: 'completed',
        ownerName: 'Trần Văn B',
        ownerPhone: '0909876543',
    },
    {
        id: '3',
        bookingCode: 'BK9012DEF',
        roomName: 'Phòng 305 - Studio view đẹp',
        propertyName: 'Nhà Trọ An Khang',
        address: '789 Điện Biên Phủ, Quận Bình Thạnh',
        date: '30/12/2024',
        time: '09:00',
        status: 'pending',
        ownerName: 'Lê Thị C',
        ownerPhone: '0911223344',
    },
];

export default function TenantAppointmentsPage() {
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedAppointment, setSelectedAppointment] = useState<typeof mockAppointments[0] | null>(null);

    const filteredAppointments = mockAppointments.filter(apt =>
        statusFilter === 'all' || apt.status === statusFilter
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge className="bg-yellow-500">Chờ xác nhận</Badge>;
            case 'confirmed': return <Badge className="bg-green-500">Đã xác nhận</Badge>;
            case 'completed': return <Badge className="bg-blue-500">Đã hoàn thành</Badge>;
            case 'cancelled': return <Badge className="bg-gray-500">Đã hủy</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            case 'confirmed': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'completed': return <CheckCircle className="h-5 w-5 text-blue-500" />;
            case 'cancelled': return <XCircle className="h-5 w-5 text-gray-500" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Lịch xem phòng</h1>
                <p className="text-muted-foreground">Quản lý các lịch hẹn xem phòng của bạn</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Calendar className="h-10 w-10 text-blue-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Tổng lịch hẹn</p>
                            <p className="text-2xl font-bold">{mockAppointments.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <AlertCircle className="h-10 w-10 text-yellow-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Chờ xác nhận</p>
                            <p className="text-2xl font-bold">{mockAppointments.filter(a => a.status === 'pending').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Đã xác nhận</p>
                            <p className="text-2xl font-bold">{mockAppointments.filter(a => a.status === 'confirmed').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <CheckCircle className="h-10 w-10 text-blue-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
                            <p className="text-2xl font-bold">{mockAppointments.filter(a => a.status === 'completed').length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Danh sách lịch hẹn
                    </CardTitle>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Lọc trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="pending">Chờ xác nhận</SelectItem>
                            <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                            <SelectItem value="completed">Đã hoàn thành</SelectItem>
                            <SelectItem value="cancelled">Đã hủy</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã đặt lịch</TableHead>
                                <TableHead>Phòng</TableHead>
                                <TableHead>Ngày giờ</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAppointments.map((apt) => (
                                <TableRow key={apt.id}>
                                    <TableCell className="font-mono font-medium">{apt.bookingCode}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{apt.roomName}</p>
                                            <p className="text-sm text-muted-foreground">{apt.propertyName}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>{apt.date}</span>
                                            <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                                            <span>{apt.time}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(apt.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={() => setSelectedAppointment(apt)}>
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Chi tiết
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Chi tiết lịch hẹn</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(apt.status)}
                                                            {getStatusBadge(apt.status)}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">Mã đặt lịch</p>
                                                                <p className="font-mono font-bold">{apt.bookingCode}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">Ngày xem</p>
                                                                <p className="font-medium">{apt.date} lúc {apt.time}</p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Phòng</p>
                                                            <p className="font-medium">{apt.roomName}</p>
                                                            <p className="text-sm text-muted-foreground">{apt.propertyName}</p>
                                                        </div>
                                                        <div className="flex items-start gap-2">
                                                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                                            <p className="text-sm">{apt.address}</p>
                                                        </div>
                                                        <div className="pt-4 border-t">
                                                            <p className="text-sm text-muted-foreground mb-2">Liên hệ chủ nhà</p>
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium">{apt.ownerName}</span>
                                                                <Button variant="outline" size="sm">
                                                                    <Phone className="h-4 w-4 mr-1" />
                                                                    {apt.ownerPhone}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        {apt.status === 'pending' && (
                                                            <Button variant="destructive" className="w-full">
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                Hủy lịch hẹn
                                                            </Button>
                                                        )}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            {apt.status === 'confirmed' && (
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={`https://maps.google.com/?q=${encodeURIComponent(apt.address)}`} target="_blank" rel="noopener noreferrer">
                                                        <MapPin className="h-4 w-4 mr-1" />
                                                        Chỉ đường
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
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
