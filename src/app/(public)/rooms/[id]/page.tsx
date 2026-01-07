"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Heart,
    Share2,
    MapPin,
    Star,
    Maximize,
    Users,
    Building,
    Phone,
    MessageCircle,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Zap,
    Droplets,
    Wifi,
    Car,
    CheckCircle,
    Clock,
    Shield,
} from 'lucide-react';
import { mockRooms, mockReviews } from '@/data/mockData';
import { cn } from '@/lib/utils';

export default function RoomDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    const room = mockRooms.find((r) => r.id === id);
    const reviews = mockReviews.filter((r) => r.roomId === id);

    if (!room) {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Không tìm thấy phòng</h1>
                <Button asChild>
                    <Link href="/rooms">Quay lại danh sách</Link>
                </Button>
            </div>
        );
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
    };

    const utilities = [
        { icon: Zap, label: 'Điện', value: `${formatPrice(room.utilities.electricity)}đ/kWh` },
        { icon: Droplets, label: 'Nước', value: `${formatPrice(room.utilities.water)}đ/tháng` },
        { icon: Wifi, label: 'Internet', value: room.utilities.internet === 0 ? 'Miễn phí' : `${formatPrice(room.utilities.internet)}đ/tháng` },
        { icon: Car, label: 'Gửi xe', value: room.utilities.parking === 0 ? 'Miễn phí' : `${formatPrice(room.utilities.parking)}đ/tháng` },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Image Gallery */}
            <section className="relative bg-muted">
                <div className="container py-4">
                    <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
                        <DialogTrigger asChild>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 cursor-pointer group">
                                <div className="md:col-span-2 md:row-span-2 relative aspect-[4/3] md:aspect-auto md:h-[400px] rounded-lg overflow-hidden">
                                    <img
                                        src={room.images[0]}
                                        alt={room.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                {room.images.slice(1, 5).map((image, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "relative aspect-[4/3] rounded-lg overflow-hidden hidden md:block",
                                            index === 3 && room.images.length > 5 && "relative"
                                        )}
                                    >
                                        <img
                                            src={image}
                                            alt={`${room.name} ${index + 2}`}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        {index === 3 && room.images.length > 5 && (
                                            <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                                                <span className="text-background font-semibold text-lg">
                                                    +{room.images.length - 5} ảnh
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </DialogTrigger>

                        <DialogContent className="max-w-4xl p-0">
                            <DialogHeader className="p-4 border-b">
                                <DialogTitle>Hình ảnh phòng</DialogTitle>
                            </DialogHeader>
                            <div className="relative">
                                <img
                                    src={room.images[currentImageIndex]}
                                    alt={`${room.name} ${currentImageIndex + 1}`}
                                    className="w-full aspect-video object-cover"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur"
                                    onClick={prevImage}
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur"
                                    onClick={nextImage}
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </section>

            {/* Main Content */}
            <section className="container py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <div>
                                    <Badge className="mb-2 bg-green-500 text-white">Còn trống</Badge>
                                    <h1 className="text-2xl md:text-3xl font-bold">{room.name}</h1>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setIsFavorite(!isFavorite)}
                                    >
                                        <Heart className={cn("h-5 w-5", isFavorite && "fill-red-500 text-red-500")} />
                                    </Button>
                                    <Button variant="outline" size="icon">
                                        <Share2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{room.address}, {room.district}, {room.city}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium text-foreground">{room.rating}</span>
                                    <span>({room.reviewCount} đánh giá)</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Quick Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                                <Maximize className="h-5 w-5 text-primary" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Diện tích</div>
                                    <div className="font-semibold">{room.area} m²</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                                <Users className="h-5 w-5 text-primary" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Số người</div>
                                    <div className="font-semibold">Tối đa {room.maxOccupants}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                                <Building className="h-5 w-5 text-primary" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Tầng</div>
                                    <div className="font-semibold">Tầng {room.floor}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                                <Clock className="h-5 w-5 text-primary" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Đặt cọc</div>
                                    <div className="font-semibold">{formatPrice(room.deposit)}đ</div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-xl font-semibold mb-3">Mô tả</h2>
                            <p className="text-muted-foreground leading-relaxed">{room.description}</p>
                        </div>

                        <Separator />

                        {/* Amenities */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Tiện nghi</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {room.amenities.map((amenity, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Utilities */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Chi phí dịch vụ</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {utilities.map((utility, index) => (
                                    <Card key={index}>
                                        <CardContent className="p-4 text-center">
                                            <utility.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                                            <div className="text-sm text-muted-foreground">{utility.label}</div>
                                            <div className="font-semibold">{utility.value}</div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Reviews */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Đánh giá</h2>
                                <div className="flex items-center gap-1">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-bold text-lg">{room.rating}</span>
                                    <span className="text-muted-foreground">({room.reviewCount})</span>
                                </div>
                            </div>

                            {reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <Card key={review.id}>
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={review.userAvatar} />
                                                        <AvatarFallback>{review.userName[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-medium">{review.userName}</span>
                                                            <span className="text-sm text-muted-foreground">{review.createdAt}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 mb-2">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={cn(
                                                                        "h-3 w-3",
                                                                        i < review.rating
                                                                            ? "fill-yellow-400 text-yellow-400"
                                                                            : "text-muted"
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                        <p className="text-muted-foreground">{review.comment}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="p-8 text-center">
                                        <p className="text-muted-foreground">Chưa có đánh giá nào</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            <Card className="border-2 border-primary/20">
                                <CardHeader>
                                    <CardTitle className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-primary">
                                            {formatPrice(room.price)}đ
                                        </span>
                                        <span className="text-muted-foreground font-normal">/tháng</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button asChild size="lg" className="w-full text-lg">
                                        <Link href={`/rooms/${room.id}/booking`}>
                                            <Calendar className="mr-2 h-5 w-5" />
                                            Đặt lịch xem phòng
                                        </Link>
                                    </Button>

                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" size="lg">
                                            <Phone className="mr-2 h-4 w-4" />
                                            Gọi điện
                                        </Button>
                                        <Button variant="outline" size="lg">
                                            <MessageCircle className="mr-2 h-4 w-4" />
                                            Nhắn tin
                                        </Button>
                                    </div>

                                    <Separator />

                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={room.ownerAvatar} />
                                                <AvatarFallback>{room.ownerName[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{room.ownerName}</div>
                                                <div className="text-sm text-muted-foreground">Chủ nhà</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Shield className="h-4 w-4 text-green-500" />
                                            <span>Đã xác thực danh tính</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Building className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{room.propertyName}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {room.district}, {room.city}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
