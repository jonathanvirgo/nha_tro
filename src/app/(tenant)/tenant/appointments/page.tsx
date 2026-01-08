"use client";

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
import { Calendar, MapPin, Clock, Loader2, Eye } from 'lucide-react';

export default function TenantAppointmentsPage() {
    const { data: response, isLoading } = useQuery({
        queryKey: ['my-appointments'],
        queryFn: () => api.getAppointments({ mine: 'true' })
    });

    const appointments = response?.data || [];

    const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '---';
    const formatTime = (date: string) => date ? new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '---';

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <Badge className="bg-yellow-500">Chờ xác nhận</Badge>;
            case 'CONFIRMED': return <Badge className="bg-blue-500">Đã xác nhận</Badge>;
            case 'COMPLETED': return <Badge className="bg-green-500">Hoàn thành</Badge>;
            case 'CANCELLED': return <Badge className="bg-red-500">Đã hủy</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Lịch hẹn xem phòng</h1>
                <p className="text-muted-foreground">Quản lý các lịch hẹn xem phòng của bạn (API Real Data)</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Calendar className="h-10 w-10 text-blue-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Tổng lịch hẹn</p>
                            <p className="text-2xl font-bold">{Array.isArray(appointments) ? appointments.length : 0}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Clock className="h-10 w-10 text-yellow-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Chờ xác nhận</p>
                            <p className="text-2xl font-bold">
                                {Array.isArray(appointments) ? appointments.filter((a: any) => a.status === 'PENDING').length : 0}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Calendar className="h-10 w-10 text-green-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Đã xác nhận</p>
                            <p className="text-2xl font-bold">
                                {Array.isArray(appointments) ? appointments.filter((a: any) => a.status === 'CONFIRMED').length : 0}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Danh sách lịch hẹn
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Phòng</TableHead>
                                    <TableHead>Địa chỉ</TableHead>
                                    <TableHead>Ngày hẹn</TableHead>
                                    <TableHead>Giờ</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.isArray(appointments) && appointments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center p-4">Không có lịch hẹn nào</TableCell>
                                    </TableRow>
                                ) : (
                                    Array.isArray(appointments) && appointments.map((appointment: any) => (
                                        <TableRow key={appointment.id}>
                                            <TableCell className="font-medium">{appointment.room?.name || '---'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <MapPin className="h-4 w-4" />
                                                    {appointment.room?.motel?.address || '---'}
                                                </div>
                                            </TableCell>
                                            <TableCell>{formatDate(appointment.appointmentDate)}</TableCell>
                                            <TableCell>{formatTime(appointment.appointmentDate)}</TableCell>
                                            <TableCell>{getStatusBadge(appointment.status)}</TableCell>
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
