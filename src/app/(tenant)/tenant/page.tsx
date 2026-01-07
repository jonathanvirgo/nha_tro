"use client";

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
} from 'lucide-react';

export default function TenantDashboard() {
    const { user } = useAuth();

    const stats = [
        { label: 'Phòng đang thuê', value: '1', icon: Home, color: 'text-blue-500' },
        { label: 'Hợp đồng', value: '1', icon: FileText, color: 'text-green-500' },
        { label: 'Hóa đơn chưa thanh toán', value: '2', icon: Receipt, color: 'text-orange-500' },
        { label: 'Yêu cầu sửa chữa', value: '0', icon: Wrench, color: 'text-purple-500' },
    ];

    const recentActivities = [
        { type: 'invoice', title: 'Hóa đơn tháng 12/2024', date: '28/12/2024', status: 'pending' },
        { type: 'maintenance', title: 'Sửa điều hòa', date: '25/12/2024', status: 'completed' },
        { type: 'payment', title: 'Thanh toán tiền phòng tháng 11', date: '20/11/2024', status: 'completed' },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold">Xin chào, {user?.fullName || 'Người thuê'}! 👋</h1>
                <p className="text-muted-foreground">Chào mừng bạn đến với Tenant Portal</p>
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
                {/* Room Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Home className="h-5 w-5" />
                            Thông tin phòng
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tên phòng</span>
                            <span className="font-medium">Phòng A101</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Địa chỉ</span>
                            <span className="font-medium">123 Đường ABC, Quận 1</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Giá thuê</span>
                            <span className="font-medium text-primary">3,500,000đ/tháng</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Ngày bắt đầu</span>
                            <span className="font-medium">01/01/2024</span>
                        </div>
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
                        <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-5 w-5 text-orange-500" />
                                <span className="font-medium text-orange-700 dark:text-orange-300">Hóa đơn tháng 12</span>
                            </div>
                            <p className="text-2xl font-bold">4,200,000đ</p>
                            <p className="text-sm text-muted-foreground">Hạn thanh toán: 05/01/2025</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <div className="flex justify-between py-1">
                                <span>Tiền phòng</span>
                                <span>3,500,000đ</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span>Điện</span>
                                <span>450,000đ</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span>Nước</span>
                                <span>150,000đ</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span>Internet</span>
                                <span>100,000đ</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

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
                        {recentActivities.map((activity, index) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${activity.type === 'invoice' ? 'bg-blue-100 text-blue-600' :
                                            activity.type === 'maintenance' ? 'bg-purple-100 text-purple-600' :
                                                'bg-green-100 text-green-600'
                                        }`}>
                                        {activity.type === 'invoice' ? <Receipt className="h-5 w-5" /> :
                                            activity.type === 'maintenance' ? <Wrench className="h-5 w-5" /> :
                                                <TrendingUp className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium">{activity.title}</p>
                                        <p className="text-sm text-muted-foreground">{activity.date}</p>
                                    </div>
                                </div>
                                <span className={`text-sm px-2 py-1 rounded ${activity.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                    {activity.status === 'pending' ? 'Chờ xử lý' : 'Hoàn thành'}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
