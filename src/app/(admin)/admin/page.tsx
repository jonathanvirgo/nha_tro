"use client";

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
} from 'lucide-react';

export default function AdminDashboard() {
    const { user } = useAuth();

    const stats = [
        { label: 'Tổng nhà trọ', value: '5', icon: Building, color: 'text-blue-500', change: '+1', trend: 'up' },
        { label: 'Tổng phòng', value: '45', icon: Home, color: 'text-green-500', change: '+3', trend: 'up' },
        { label: 'Người thuê', value: '38', icon: Users, color: 'text-purple-500', change: '+5', trend: 'up' },
        { label: 'Tỷ lệ lấp đầy', value: '84%', icon: TrendingUp, color: 'text-orange-500', change: '+2%', trend: 'up' },
    ];

    const financialStats = [
        { label: 'Doanh thu tháng này', value: '152,500,000đ', icon: DollarSign, color: 'text-green-600' },
        { label: 'Chưa thu', value: '12,600,000đ', icon: AlertCircle, color: 'text-orange-600' },
        { label: 'Đã thu', value: '139,900,000đ', icon: CheckCircle, color: 'text-blue-600' },
    ];

    const recentActivities = [
        { type: 'contract', title: 'Hợp đồng mới - Phòng B203', time: '2 giờ trước', status: 'success' },
        { type: 'payment', title: 'Thanh toán - Nguyễn Văn A', time: '3 giờ trước', status: 'success' },
        { type: 'maintenance', title: 'Yêu cầu sửa chữa - Phòng A101', time: '5 giờ trước', status: 'pending' },
        { type: 'invoice', title: 'Tạo hóa đơn tháng 12', time: 'Hôm qua', status: 'success' },
    ];

    const upcomingExpirations = [
        { room: 'Phòng A102', tenant: 'Trần Thị B', expiresIn: '15 ngày' },
        { room: 'Phòng C301', tenant: 'Lê Văn C', expiresIn: '23 ngày' },
        { room: 'Phòng B205', tenant: 'Phạm Thị D', expiresIn: '30 ngày' },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Xin chào, {user?.fullName || 'Admin'}! Đây là tổng quan hệ thống.</p>
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
                            {recentActivities.map((activity, index) => (
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
                            ))}
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
                            {upcomingExpirations.map((item, index) => (
                                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                                    <div>
                                        <p className="font-medium">{item.room}</p>
                                        <p className="text-sm text-muted-foreground">{item.tenant}</p>
                                    </div>
                                    <span className="text-sm px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                                        Còn {item.expiresIn}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
