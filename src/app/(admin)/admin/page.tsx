"use client";

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import {
    Building,
    Home,
    Users,
    Receipt,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle,
    DollarSign,
    Calendar,
    Loader2,
} from 'lucide-react';

export default function AdminDashboard() {
    const { user } = useAuth();

    // Fetch dashboard stats từ API
    const { data: statsResponse, isLoading: isLoadingStats } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: () => api.getDashboardStats(),
        staleTime: 60000,
    });

    // Fetch contracts để lấy hợp đồng sắp hết hạn
    const { data: contractsResponse } = useQuery({
        queryKey: ['expiring-contracts'],
        queryFn: () => api.getContracts({ status: 'ACTIVE' }),
        staleTime: 60000,
    });

    // Fetch recent maintenance requests
    const { data: maintenanceResponse } = useQuery({
        queryKey: ['recent-maintenance'],
        queryFn: () => api.getMaintenanceRequests({ limit: '5' }),
        staleTime: 60000,
    });

    // Parse data
    const dashboardStats = statsResponse?.data as any || {};
    const contracts = Array.isArray(contractsResponse?.data) ? contractsResponse.data : [];
    const maintenanceRequests = Array.isArray(maintenanceResponse?.data) ? maintenanceResponse.data : [];

    // Calculate stats
    const totalMotels = dashboardStats.totalMotels || 0;
    const totalRooms = dashboardStats.totalRooms || 0;
    const totalTenants = dashboardStats.totalTenants || 0;
    const occupancyRate = dashboardStats.occupancyRate || 0;
    const monthlyRevenue = dashboardStats.monthlyRevenue || 0;
    const pendingAmount = dashboardStats.pendingAmount || 0;
    const paidAmount = dashboardStats.paidAmount || 0;

    const stats = [
        { label: 'Tổng nhà trọ', value: totalMotels.toString(), icon: Building, color: 'text-blue-500', change: '+0', trend: 'up' },
        { label: 'Tổng phòng', value: totalRooms.toString(), icon: Home, color: 'text-green-500', change: '+0', trend: 'up' },
        { label: 'Người thuê', value: totalTenants.toString(), icon: Users, color: 'text-purple-500', change: '+0', trend: 'up' },
        { label: 'Tỷ lệ lấp đầy', value: `${Math.round(occupancyRate)}%`, icon: TrendingUp, color: 'text-orange-500', change: '+0%', trend: 'up' },
    ];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ';
    };

    const financialStats = [
        { label: 'Doanh thu tháng này', value: formatPrice(monthlyRevenue), icon: DollarSign, color: 'text-green-600' },
        { label: 'Chưa thu', value: formatPrice(pendingAmount), icon: AlertCircle, color: 'text-orange-600' },
        { label: 'Đã thu', value: formatPrice(paidAmount), icon: CheckCircle, color: 'text-blue-600' },
    ];

    // Get expiring contracts (within 30 days)
    const expiringContracts = contracts
        .filter((c: any) => {
            if (!c.endDate) return false;
            const endDate = new Date(c.endDate);
            const now = new Date();
            const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return daysLeft > 0 && daysLeft <= 30;
        })
        .slice(0, 3)
        .map((c: any) => {
            const endDate = new Date(c.endDate);
            const now = new Date();
            const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return {
                room: c.room?.name || 'N/A',
                tenant: c.tenant?.fullName || 'N/A',
                expiresIn: `${daysLeft} ngày`
            };
        });

    // Map recent activities from maintenance
    const recentActivities = maintenanceRequests.slice(0, 4).map((m: any) => ({
        type: 'maintenance',
        title: m.title || 'Yêu cầu sửa chữa',
        time: m.createdAt ? new Date(m.createdAt).toLocaleDateString('vi-VN') : 'N/A',
        status: m.status === 'COMPLETED' ? 'success' : 'pending'
    }));

    if (isLoadingStats) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Xin chào, {user?.fullName || 'Admin'}! Đây là tổng quan hệ thống (API Real Data).</p>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    <p className="text-3xl font-bold">{stat.value}</p>
                                    <p className={`text-sm flex items-center gap-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                        {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                        {stat.change} so với tháng trước
                                    </p>
                                </div>
                                <stat.icon className={`h-12 w-12 ${stat.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Financial Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {financialStats.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Hoạt động gần đây
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.length > 0 ? recentActivities.map((activity: any, index: number) => (
                                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${activity.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                            {activity.type === 'contract' ? <Users className="h-5 w-5" /> :
                                                activity.type === 'payment' ? <DollarSign className="h-5 w-5" /> :
                                                    activity.type === 'maintenance' ? <AlertCircle className="h-5 w-5" /> :
                                                        <Receipt className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium">{activity.title}</p>
                                            <p className="text-sm text-muted-foreground">{activity.time}</p>
                                        </div>
                                    </div>
                                    <span className={`text-sm px-2 py-1 rounded ${activity.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {activity.status === 'success' ? 'Hoàn thành' : 'Đang xử lý'}
                                    </span>
                                </div>
                            )) : (
                                <p className="text-muted-foreground text-center py-4">Chưa có hoạt động nào</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Expirations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Hợp đồng sắp hết hạn
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {expiringContracts.length > 0 ? expiringContracts.map((item: any, index: number) => (
                                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                                    <div>
                                        <p className="font-medium">{item.room}</p>
                                        <p className="text-sm text-muted-foreground">{item.tenant}</p>
                                    </div>
                                    <span className="text-sm px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                                        Còn {item.expiresIn}
                                    </span>
                                </div>
                            )) : (
                                <p className="text-muted-foreground text-center py-4">Không có hợp đồng nào sắp hết hạn</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
