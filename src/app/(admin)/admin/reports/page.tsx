"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { BarChart3, Download, TrendingUp, DollarSign, Users, Home, Calendar } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

const revenueChartData = [
    { month: 'T1', revenue: 120000000, collected: 110000000 },
    { month: 'T2', revenue: 125000000, collected: 120000000 },
    { month: 'T3', revenue: 130000000, collected: 125000000 },
    { month: 'T4', revenue: 128000000, collected: 128000000 },
    { month: 'T5', revenue: 135000000, collected: 130000000 },
    { month: 'T6', revenue: 140000000, collected: 138000000 },
    { month: 'T7', revenue: 138000000, collected: 135000000 },
    { month: 'T8', revenue: 142000000, collected: 140000000 },
    { month: 'T9', revenue: 145000000, collected: 142000000 },
    { month: 'T10', revenue: 148000000, collected: 145000000 },
    { month: 'T11', revenue: 150000000, collected: 148000000 },
    { month: 'T12', revenue: 152500000, collected: 139900000 },
];

const occupancyChartData = [
    { name: 'Đã thuê', value: 38, color: '#22c55e' },
    { name: 'Còn trống', value: 7, color: '#94a3b8' },
];

export default function AdminReportsPage() {
    const [period, setPeriod] = useState('month');
    const [year, setYear] = useState('2024');

    const revenueData = {
        total: 152500000,
        collected: 139900000,
        pending: 12600000,
        growth: 8.5,
    };

    const occupancyData = {
        totalRooms: 45,
        occupied: 38,
        rate: 84.4,
    };

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    const formatTooltip = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Báo cáo & Thống kê</h1>
                    <p className="text-muted-foreground">Xem báo cáo doanh thu và hoạt động</p>
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
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2023">2023</SelectItem>
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
                                <p className="text-2xl font-bold text-primary">{formatPrice(revenueData.total)}</p>
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
                                <p className="text-2xl font-bold text-green-600">{formatPrice(revenueData.collected)}</p>
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
                                <p className="text-2xl font-bold text-orange-600">{formatPrice(revenueData.pending)}</p>
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
                                <p className="text-2xl font-bold text-blue-600">+{revenueData.growth}%</p>
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
                            <p className="text-4xl font-bold text-green-600">{occupancyData.rate}%</p>
                            <p className="text-muted-foreground">Tỷ lệ lấp đầy</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold">{occupancyData.totalRooms}</p>
                                <p className="text-sm text-muted-foreground">Tổng phòng</p>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{occupancyData.occupied}</p>
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
