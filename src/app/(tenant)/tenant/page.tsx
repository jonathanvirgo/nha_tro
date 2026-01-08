"use client";

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import {
    Home,
    FileText,
    Receipt,
    Wrench,
    Calendar,
    TrendingUp,
    AlertCircle,
    Loader2,
} from 'lucide-react';

export default function TenantDashboard() {
    const { user } = useAuth();

    // Fetch data từ API
    const { data: contractsRes } = useQuery({
        queryKey: ['my-contracts'],
        queryFn: () => api.getContracts({ mine: 'true' })
    });
    const { data: invoicesRes } = useQuery({
        queryKey: ['my-invoices'],
        queryFn: () => api.getInvoices({ mine: 'true' })
    });
    const { data: maintenanceRes } = useQuery({
        queryKey: ['my-maintenance'],
        queryFn: () => api.getMaintenanceRequests({ mine: 'true' })
    });

    const contracts = Array.isArray(contractsRes?.data) ? contractsRes.data : [];
    const invoices = Array.isArray(invoicesRes?.data) ? invoicesRes.data : [];
    const maintenance = Array.isArray(maintenanceRes?.data) ? maintenanceRes.data : [];

    const pendingInvoices = invoices.filter((i: any) => i.status === 'PENDING');
    const pendingMaintenance = maintenance.filter((m: any) => m.status === 'PENDING');
    const activeContracts = contracts.filter((c: any) => c.status === 'ACTIVE');

    const stats = [
        { label: 'Phòng đang thuê', value: activeContracts.length, icon: Home, color: 'text-blue-500' },
        { label: 'Hợp đồng', value: contracts.length, icon: FileText, color: 'text-green-500' },
        { label: 'Hóa đơn chưa thanh toán', value: pendingInvoices.length, icon: Receipt, color: 'text-orange-500' },
        { label: 'Yêu cầu sửa chữa', value: pendingMaintenance.length, icon: Wrench, color: 'text-purple-500' },
    ];

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price || 0);

    // Get next pending invoice
    const nextInvoice = pendingInvoices[0] as any;

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold">Xin chào, {user?.fullName || 'Người thuê'}! 👋</h1>
                <p className="text-muted-foreground">Chào mừng bạn đến với Tenant Portal (API Real Data)</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    <p className="text-3xl font-bold">{stat.value}</p>
                                </div>
                                <stat.icon className={`h-10 w-10 ${stat.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Room Info - from active contract */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Home className="h-5 w-5" />
                            Thông tin phòng
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {activeContracts.length > 0 ? (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tên phòng</span>
                                    <span className="font-medium">{(activeContracts[0] as any)?.room?.name || '---'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Địa chỉ</span>
                                    <span className="font-medium">{(activeContracts[0] as any)?.room?.motel?.address || '---'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Giá thuê</span>
                                    <span className="font-medium text-primary">{formatPrice((activeContracts[0] as any)?.rentPrice)}đ/tháng</span>
                                </div>
                            </>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">Chưa có hợp đồng nào</p>
                        )}
                    </CardContent>
                </Card>

                {/* Next Payment */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Thanh toán sắp tới
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {nextInvoice ? (
                            <>
                                <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="h-5 w-5 text-orange-500" />
                                        <span className="font-medium text-orange-700 dark:text-orange-300">
                                            Hóa đơn tháng {nextInvoice.month}/{nextInvoice.year}
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold">{formatPrice(nextInvoice.totalAmount)}đ</p>
                                    <p className="text-sm text-muted-foreground">
                                        Hạn thanh toán: {nextInvoice.dueDate ? new Date(nextInvoice.dueDate).toLocaleDateString('vi-VN') : '---'}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">Không có hóa đơn chờ thanh toán</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Maintenance Requests */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Yêu cầu bảo trì gần đây
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {maintenance.length > 0 ? (
                            maintenance.slice(0, 3).map((request: any) => (
                                <div key={request.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
                                            <Wrench className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{request.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {request.createdAt ? new Date(request.createdAt).toLocaleDateString('vi-VN') : '---'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-sm px-2 py-1 rounded ${request.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                            request.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {request.status === 'PENDING' ? 'Chờ xử lý' :
                                            request.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang xử lý'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-4">Chưa có yêu cầu nào</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
