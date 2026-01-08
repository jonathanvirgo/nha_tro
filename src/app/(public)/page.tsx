"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Search,
    MapPin,
    Calendar,
    Star,
    Shield,
    Clock,
    ChevronRight,
    Users,
    Building,
    CheckCircle,
    Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { RoomCard } from '@/components/room/RoomCard';

// Static data
const districts = [
    'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5',
    'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10',
    'Quận 11', 'Quận 12', 'Quận Bình Thạnh', 'Quận Gò Vấp',
    'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Thủ Đức',
];

const statistics = {
    totalRooms: 5000,
    totalUsers: 10000,
    totalBookings: 15000,
    cities: 20,
};

const mockTestimonials = [
    {
        id: '1',
        name: 'Nguyễn Văn An',
        role: 'Sinh viên',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        content: 'Tìm được phòng trọ gần trường rất nhanh chóng. Giao diện dễ sử dụng, thông tin phòng đầy đủ và chính xác.',
        rating: 5,
    },
    {
        id: '2',
        name: 'Trần Thị Bình',
        role: 'Nhân viên văn phòng',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        content: 'Đặt lịch xem phòng online rất tiện lợi, không cần gọi điện nhiều lần. Chủ nhà phản hồi nhanh.',
        rating: 5,
    },
    {
        id: '3',
        name: 'Lê Văn Cường',
        role: 'Kỹ sư phần mềm',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        content: 'So sánh nhiều phòng cùng lúc giúp tôi đưa ra quyết định tốt hơn. Rất hài lòng với trải nghiệm.',
        rating: 4,
    },
    {
        id: '4',
        name: 'Phạm Thị Dung',
        role: 'Chủ nhà trọ',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        content: 'Đăng tin cho thuê phòng rất dễ dàng. Có nhiều người liên hệ xem phòng hơn so với các kênh khác.',
        rating: 5,
    },
];

const features = [
    {
        icon: Search,
        title: 'Tìm kiếm thông minh',
        description: 'Bộ lọc nâng cao giúp bạn tìm phòng phù hợp nhất với nhu cầu',
    },
    {
        icon: Calendar,
        title: 'Đặt lịch online',
        description: 'Đặt lịch xem phòng trực tiếp, không cần gọi điện nhiều lần',
    },
    {
        icon: Shield,
        title: 'An toàn & Uy tín',
        description: 'Thông tin phòng được xác thực, đánh giá từ người thuê thực',
    },
    {
        icon: Clock,
        title: 'Tiết kiệm thời gian',
        description: 'So sánh nhiều phòng cùng lúc, tìm được phòng ưng ý nhanh chóng',
    },
];

export default function LandingPage() {
    const [searchLocation, setSearchLocation] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [priceRange, setPriceRange] = useState('');

    // Fetch API real data cho featured rooms
    const { data: response, isLoading } = useQuery({
        queryKey: ['featured-rooms'],
        queryFn: () => api.searchRooms({ limit: '4', status: 'AVAILABLE' }),
        staleTime: 60000, // Cache for 1 minute
    });

    const featuredRooms = Array.isArray(response?.data) ? response.data.slice(0, 4) : [];

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-blue-500/5" />
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

                <div className="container relative z-10 py-20">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            <Star className="h-4 w-4 fill-primary" />
                            <span>Nền tảng tìm phòng trọ #1 Việt Nam</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                            Tìm phòng trọ
                            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"> hoàn hảo </span>
                            cho bạn
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                            Khám phá hàng nghìn phòng trọ chất lượng. Đặt lịch xem phòng trực tuyến,
                            nhanh chóng và tiện lợi.
                        </p>

                        {/* Search Box */}
                        <div className="mt-8 p-4 md:p-6 rounded-2xl bg-card shadow-xl border">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="relative md:col-span-2">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Nhập địa điểm, đường, quận..."
                                        className="pl-10 h-12"
                                        value={searchLocation}
                                        onChange={(e) => setSearchLocation(e.target.value)}
                                    />
                                </div>

                                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                                    <SelectTrigger className="h-12">
                                        <SelectValue placeholder="Chọn quận" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {districts.map((district) => (
                                            <SelectItem key={district} value={district}>
                                                {district}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={priceRange} onValueChange={setPriceRange}>
                                    <SelectTrigger className="h-12">
                                        <SelectValue placeholder="Mức giá" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0-2000000">Dưới 2 triệu</SelectItem>
                                        <SelectItem value="2000000-4000000">2 - 4 triệu</SelectItem>
                                        <SelectItem value="4000000-6000000">4 - 6 triệu</SelectItem>
                                        <SelectItem value="6000000-10000000">6 - 10 triệu</SelectItem>
                                        <SelectItem value="10000000+">Trên 10 triệu</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="mt-4 flex flex-col sm:flex-row gap-4">
                                <Button asChild size="lg" className="flex-1 h-12 text-lg font-semibold">
                                    <Link href="/rooms">
                                        <Search className="mr-2 h-5 w-5" />
                                        Tìm phòng ngay
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="h-12">
                                    <Link href="/map">
                                        <MapPin className="mr-2 h-5 w-5" />
                                        Xem bản đồ
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-12">
                            {[
                                { value: `${Math.round(statistics.totalRooms / 1000)}K+`, label: 'Phòng trọ' },
                                { value: `${Math.round(statistics.totalUsers / 1000)}K+`, label: 'Người dùng' },
                                { value: `${Math.round(statistics.totalBookings / 1000)}K+`, label: 'Lịch hẹn' },
                                { value: `${statistics.cities}+`, label: 'Tỉnh thành' },
                            ].map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-muted/30">
                <div className="container">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Tại sao chọn <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">NhaTro</span>?
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Chúng tôi mang đến trải nghiệm tìm phòng trọ tốt nhất với các tính năng tiện lợi
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <Card key={index} className="group hover:shadow-lg transition-shadow">
                                <CardContent className="p-6 text-center">
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                                        <feature.icon className="h-7 w-7" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Rooms Section */}
            <section className="py-20">
                <div className="container">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-2">
                                Phòng trọ <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">nổi bật</span>
                            </h2>
                            <p className="text-muted-foreground">
                                Những phòng trọ được đánh giá cao nhất (API Real Data)
                            </p>
                        </div>
                        <Button asChild variant="outline" className="hidden md:flex">
                            <Link href="/rooms">
                                Xem tất cả
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : featuredRooms.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredRooms.map((room: any, index: number) => (
                                <RoomCard key={room.id} room={room} index={index} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            Chưa có phòng trọ nào
                        </div>
                    )}

                    <div className="mt-8 text-center md:hidden">
                        <Button asChild variant="outline">
                            <Link href="/rooms">
                                Xem tất cả phòng
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-gradient-to-br from-primary/5 to-blue-500/5">
                <div className="container">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Cách thức <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">hoạt động</span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Chỉ với 3 bước đơn giản, bạn có thể tìm được phòng trọ ưng ý
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {[
                            {
                                step: '01',
                                icon: Search,
                                title: 'Tìm kiếm',
                                description: 'Nhập địa điểm, lọc theo giá, diện tích và tiện nghi để tìm phòng phù hợp',
                            },
                            {
                                step: '02',
                                icon: Calendar,
                                title: 'Đặt lịch',
                                description: 'Chọn thời gian phù hợp và đặt lịch hẹn xem phòng trực tiếp online',
                            },
                            {
                                step: '03',
                                icon: CheckCircle,
                                title: 'Xem phòng',
                                description: 'Đến xem phòng theo lịch hẹn, thương lượng và ký hợp đồng nếu ưng ý',
                            },
                        ].map((item, index) => (
                            <div key={index} className="relative text-center">
                                <div className="text-6xl font-bold text-primary/10 absolute -top-4 left-1/2 -translate-x-1/2">
                                    {item.step}
                                </div>
                                <div className="relative pt-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white mb-4">
                                        <item.icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
                                    <p className="text-muted-foreground">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20">
                <div className="container">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Người dùng <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">nói gì</span>?
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Hàng nghìn người đã tìm được phòng trọ ưng ý thông qua NhaTro
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {mockTestimonials.map((testimonial) => (
                            <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-1 mb-4">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${i < testimonial.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-muted'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-muted-foreground mb-4 line-clamp-4">
                                        &quot;{testimonial.content}&quot;
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={testimonial.avatar}
                                            alt={testimonial.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <div className="font-medium text-sm">{testimonial.name}</div>
                                            <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary to-blue-600">
                <div className="container">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Bắt đầu tìm phòng ngay hôm nay
                        </h2>
                        <p className="text-white/80 mb-8 text-lg">
                            Đăng ký miễn phí và khám phá hàng nghìn phòng trọ chất lượng
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" variant="secondary" className="text-lg font-semibold">
                                <Link href="/register">
                                    <Users className="mr-2 h-5 w-5" />
                                    Đăng ký ngay
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="text-lg font-semibold border-white/30 text-white hover:bg-white/10">
                                <Link href="/rooms">
                                    <Building className="mr-2 h-5 w-5" />
                                    Xem phòng trọ
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
