"use client";

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Home,
    MapPin,
    Star,
    Maximize,
    Users,
    Building,
    Zap,
    Droplets,
    Wifi,
    Car,
    CheckCircle,
    Phone,
    MessageCircle,
    FileText,
    Wrench,
    Loader2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

export default function TenantRoomPage() {
    // Lấy hợp đồng đang active của tenant
    const { data: contractsRes, isLoading } = useQuery({
        queryKey: ['my-contracts'],
        queryFn: () => api.getContracts({ mine: 'true', status: 'ACTIVE' })
    });

    const contracts = Array.isArray(contractsRes?.data) ? contractsRes.data : [];
    const activeContract = contracts.find((c: any) => c.status === 'ACTIVE');
    const room = (activeContract as any)?.room;
    const motel = room?.motel;
    const landlord = motel?.landlord;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price || 0);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!room) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Phòng của tôi</h1>
                    <p className="text-muted-foreground">Thông tin chi tiết về phòng bạn đang thuê</p>
                </div>
                <Card>
                    <CardContent className="p-8 text-center">
                        <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Bạn chưa có hợp đồng thuê phòng nào</p>
                        <Button asChild className="mt-4">
                            <Link href="/rooms">Tìm phòng</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const utilities = [
        { icon: Zap, label: 'Điện', value: room.electricityPrice ? `${formatPrice(room.electricityPrice)}đ/kWh` : '---' },
        { icon: Droplets, label: 'Nước', value: room.waterPrice ? `${formatPrice(room.waterPrice)}đ/tháng` : '---' },
        { icon: Wifi, label: 'Internet', value: '---' },
        { icon: Car, label: 'Gửi xe', value: '---' },
    ];

    // Build amenities from room.utilities
    const amenities = room.utilities?.map((u: any) => u.name) || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Phòng của tôi</h1>
                <p className="text-muted-foreground">Thông tin chi tiết về phòng bạn đang thuê (API Real Data)</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Images */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2 row-span-2">
                                    <img
                                        src={room.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'}
                                        alt={room.name}
                                        className="w-full h-full object-cover rounded-lg aspect-video"
                                    />
                                </div>
                                {(room.images?.slice(1, 3) || []).map((image: any, index: number) => (
                                    <img
                                        key={index}
                                        src={image.url || image}
                                        alt={`${room.name} ${index + 2}`}
                                        className="w-full h-full object-cover rounded-lg aspect-square"
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Room Info */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <Badge className="mb-2 bg-green-500">Đang thuê</Badge>
                                    <CardTitle className="text-xl">{room.name}</CardTitle>
                                    <p className="text-muted-foreground">{motel?.name || 'Nhà trọ'}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-primary">{formatPrice(room.price)}đ</span>
                                    <span className="text-muted-foreground">/tháng</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{motel?.address || '---'}</span>
                            </div>

                            {/* Quick Info */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                    <Maximize className="h-5 w-5 text-primary" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Diện tích</div>
                                        <div className="font-semibold">{room.area} m²</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                    <Users className="h-5 w-5 text-primary" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Số người</div>
                                        <div className="font-semibold">Tối đa {room.maxOccupants || 2}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                    <Building className="h-5 w-5 text-primary" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Tầng</div>
                                        <div className="font-semibold">Tầng {room.floor || 1}</div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Amenities */}
                            {amenities.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-3">Tiện nghi</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {amenities.map((amenity: string, index: number) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="text-sm">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Separator />

                            {/* Utilities */}
                            <div>
                                <h3 className="font-semibold mb-3">Chi phí dịch vụ</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {utilities.map((utility, index) => (
                                        <div key={index} className="p-3 rounded-lg bg-muted/50 text-center">
                                            <utility.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                                            <div className="text-xs text-muted-foreground">{utility.label}</div>
                                            <div className="text-sm font-semibold">{utility.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Owner Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Thông tin chủ nhà</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-14 w-14">
                                    <AvatarImage src={landlord?.avatarUrl} />
                                    <AvatarFallback>{landlord?.fullName?.[0] || 'C'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold">{landlord?.fullName || 'Chủ nhà'}</div>
                                    <div className="text-sm text-muted-foreground">Chủ nhà</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" className="w-full">
                                    <Phone className="mr-2 h-4 w-4" />
                                    Gọi điện
                                </Button>
                                <Button variant="outline" className="w-full">
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    Nhắn tin
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href="/tenant/contracts">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Xem hợp đồng
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href="/tenant/maintenance">
                                    <Wrench className="mr-2 h-4 w-4" />
                                    Gửi yêu cầu sửa chữa
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Star className="mr-2 h-4 w-4" />
                                Đánh giá phòng
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
