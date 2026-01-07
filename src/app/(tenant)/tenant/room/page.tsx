"use client";

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
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

export default function TenantRoomPage() {
    // Mock data - phòng đang thuê
    const room = {
        id: '1',
        name: 'Phòng 101 - Studio cao cấp',
        propertyName: 'Nhà Trọ Minh Tâm',
        address: '123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh',
        price: 4500000,
        area: 25,
        floor: 1,
        maxOccupants: 2,
        amenities: ['Wifi miễn phí', 'Điều hòa', 'Tủ lạnh', 'WC riêng', 'Ban công', 'Giường', 'Tủ quần áo'],
        utilities: {
            electricity: 3500,
            water: 100000,
            internet: 0,
            parking: 200000,
        },
        images: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        ],
        ownerName: 'Nguyễn Minh Tâm',
        ownerPhone: '0901234567',
        ownerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    const utilities = [
        { icon: Zap, label: 'Điện', value: `${formatPrice(room.utilities.electricity)}đ/kWh` },
        { icon: Droplets, label: 'Nước', value: `${formatPrice(room.utilities.water)}đ/tháng` },
        { icon: Wifi, label: 'Internet', value: room.utilities.internet === 0 ? 'Miễn phí' : `${formatPrice(room.utilities.internet)}đ/tháng` },
        { icon: Car, label: 'Gửi xe', value: room.utilities.parking === 0 ? 'Miễn phí' : `${formatPrice(room.utilities.parking)}đ/tháng` },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Phòng của tôi</h1>
                <p className="text-muted-foreground">Thông tin chi tiết về phòng bạn đang thuê</p>
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
                                        src={room.images[0]}
                                        alt={room.name}
                                        className="w-full h-full object-cover rounded-lg aspect-video"
                                    />
                                </div>
                                {room.images.slice(1, 3).map((image, index) => (
                                    <img
                                        key={index}
                                        src={image}
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
                                    <p className="text-muted-foreground">{room.propertyName}</p>
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
                                <span>{room.address}</span>
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
                                        <div className="font-semibold">Tối đa {room.maxOccupants}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                    <Building className="h-5 w-5 text-primary" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Tầng</div>
                                        <div className="font-semibold">Tầng {room.floor}</div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Amenities */}
                            <div>
                                <h3 className="font-semibold mb-3">Tiện nghi</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {room.amenities.map((amenity, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span className="text-sm">{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

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
                                    <AvatarImage src={room.ownerAvatar} />
                                    <AvatarFallback>{room.ownerName[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold">{room.ownerName}</div>
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
