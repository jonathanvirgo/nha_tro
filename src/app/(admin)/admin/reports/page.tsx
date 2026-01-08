"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { BarChart3, Download, TrendingUp, DollarSign, Users, Home, Calendar, Loader2 } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

export default function AdminReportsPage() {
    const [period, setPeriod] = useState('month');
    const [year, setYear] = useState('2024');

    // Fetch financial report
    const { data: financialRes, isLoading: isLoadingFinancial } = useQuery({
        queryKey: ['financial-report', year],
        queryFn: () => api.getFinancialReport({ year }),
        staleTime: 60000,
    });

    // Fetch dashboard occupancy
    const { data: occupancyRes, isLoading: isLoadingOccupancy } = useQuery({
        queryKey: ['occupancy-report'],
        queryFn: () => api.getDashboardOccupancy(),
        staleTime: 60000,
    });

    // Fetch dashboard stats for overview
    const { data: statsRes } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: () => api.getDashboardStats(),
        staleTime: 60000,
    });

    // Parse data with fallbacks
    const financialData = financialRes?.data as any || {};
    const occupancyData = occupancyRes?.data as any || {};
    const statsData = statsRes?.data as any || {};

    // Revenue data
    const totalRevenue = financialData.totalRevenue || statsData.monthlyRevenue || 0;
    const collectedAmount = financialData.collectedAmount || statsData.paidAmount || 0;
    const pendingAmount = financialData.pendingAmount || statsData.pendingAmount || 0;
    const growth = financialData.growth || 0;

    // Occupancy data
    const totalRooms = occupancyData.totalRooms || statsData.totalRooms || 0;
    const occupiedRooms = occupancyData.occupiedRooms || 0;
    const vacantRooms = occupancyData.vacantRooms || totalRooms - occupiedRooms;
    const occupancyRate = occupancyData.rate || statsData.occupancyRate || (totalRooms > 0 ? (occupiedRooms / totalRooms * 100) : 0);

    // Monthly revenue chart data (fallback to sample if no API data)
    const revenueChartData = financialData.monthlyData || [
        { month: 'T1', revenue: 0, collected: 0 },
        { month: 'T2', revenue: 0, collected: 0 },
        { month: 'T3', revenue: 0, collected: 0 },
        { month: 'T4', revenue: 0, collected: 0 },
        { month: 'T5', revenue: 0, collected: 0 },
        { month: 'T6', revenue: 0, collected: 0 },
        { month: 'T7', revenue: 0, collected: 0 },
        { month: 'T8', revenue: 0, collected: 0 },
        { month: 'T9', revenue: 0, collected: 0 },
        { month: 'T10', revenue: 0, collected: 0 },
        { month: 'T11', revenue: 0, collected: 0 },
        { month: 'T12', revenue: totalRevenue, collected: collectedAmount },
    ];

    const occupancyChartData = [
        { name: 'Đã thuê', value: occupiedRooms || 0, color: '#22c55e' },
        { name: 'Còn trống', value: vacantRooms || 0, color: '#94a3b8' },
    ];

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ';
    const formatTooltip = (value: number) => new Intl.NumberFormat('vi-VN').format(value || 0) + 'đ';

    const isLoading = isLoadingFinancial || isLoadingOccupancy;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Báo cáo & Thống kê</h1>
                    <p className="text-muted-foreground">Xem báo cáo doanh thu và hoạt động (API Real Data)</p>
                </div>
                <div className="flex gap-2">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="month">Tháng</SelectItem>
                            <SelectItem value="quarter">Quý</SelectItem>
                            <SelectItem value="year">Năm</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2026">2026</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2024">2024</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Xuất Excel
                    </Button>
                </div>
            </div>

            {/* Revenue Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
                                <p className="text-2xl font-bold text-primary">{formatPrice(totalRevenue)}</p>
                            </div>
                            <DollarSign className="h-10 w-10 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Đã thu</p>
                                <p className="text-2xl font-bold text-green-600">{formatPrice(collectedAmount)}</p>
                            </div>
                            <TrendingUp className="h-10 w-10 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Chưa thu</p>
                                <p className="text-2xl font-bold text-orange-600">{formatPrice(pendingAmount)}</p>
                            </div>
                            <Calendar className="h-10 w-10 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Tăng trưởng</p>
                                <p className="text-2xl font-bold text-blue-600">+{growth.toFixed(1)}%</p>
                            </div>
                            <BarChart3 className="h-10 w-10 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Biểu đồ doanh thu theo tháng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueChartData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="month" className="text-xs" />
                                    <YAxis
                                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                                        className="text-xs"
                                    />
                                    <Tooltip
                                        formatter={(value) => value !== undefined ? formatTooltip(value as number) : ''}
                                        labelFormatter={(label) => `Tháng ${String(label).replace('T', '')}`}
                                    />
                                    <Bar dataKey="revenue" name="Doanh thu" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="collected" name="Đã thu" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Occupancy Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Home className="h-5 w-5" />
                            Tỷ lệ lấp đầy
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={occupancyChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {occupancyChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-green-600">{occupancyRate.toFixed(1)}%</p>
                            <p className="text-muted-foreground">Tỷ lệ lấp đầy</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold">{totalRooms}</p>
                                <p className="text-sm text-muted-foreground">Tổng phòng</p>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{occupiedRooms}</p>
                                <p className="text-sm text-muted-foreground">Đang cho thuê</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Reports */}
            <Card>
                <CardHeader>
                    <CardTitle>Báo cáo nhanh</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button variant="outline" className="h-24 flex flex-col gap-2">
                            <DollarSign className="h-6 w-6" />
                            <span>Báo cáo tài chính</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2">
                            <Users className="h-6 w-6" />
                            <span>Báo cáo người thuê</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2">
                            <Home className="h-6 w-6" />
                            <span>Báo cáo phòng</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2">
                            <Calendar className="h-6 w-6" />
                            <span>Báo cáo hợp đồng</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
