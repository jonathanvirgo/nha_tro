"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    ChevronLeft,
    Calendar as CalendarIcon,
    Clock,
    User,
    Phone,
    Mail,
    CheckCircle,
    MapPin,
    Star,
    Loader2,
} from 'lucide-react';
import { mockRooms } from '@/data/mockData';
import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';

const bookingSchema = z.object({
    fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    phone: z.string().regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ'),
    email: z.string().email('Email không hợp lệ'),
    time: z.string().min(1, 'Vui lòng chọn giờ xem phòng'),
    notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
];

export default function BookingPage() {
    const params = useParams();
    const id = params.id as string;
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [bookingCode, setBookingCode] = useState('');

    const room = mockRooms.find((r) => r.id === id);

    const form = useForm<BookingFormData>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            fullName: '',
            phone: '',
            email: '',
            time: '',
            notes: '',
        },
    });

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

    const generateBookingCode = () => {
        return `BK${Date.now().toString(36).toUpperCase()}`;
    };

    const onSubmit = async (data: BookingFormData) => {
        if (!selectedDate) {
            toast.error('Vui lòng chọn ngày xem phòng');
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const code = generateBookingCode();
        setBookingCode(code);
        setIsSuccess(true);
        setIsSubmitting(false);

        toast.success('Đặt lịch thành công!');
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center">
                    <CardContent className="pt-8 pb-8">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Đặt lịch thành công!</h1>
                        <p className="text-muted-foreground mb-6">
                            Chủ nhà sẽ liên hệ xác nhận trong vòng 24 giờ
                        </p>

                        <Card className="bg-muted/50 mb-6">
                            <CardContent className="p-4 space-y-3 text-left">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Mã đặt lịch:</span>
                                    <span className="font-mono font-bold text-primary">{bookingCode}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Phòng:</span>
                                    <span className="font-medium">{room.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Ngày xem:</span>
                                    <span className="font-medium">
                                        {selectedDate && format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Giờ xem:</span>
                                    <span className="font-medium">{form.getValues('time')}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-2">
                            <Button asChild size="lg" className="w-full">
                                <Link href="/tenant/appointments">Xem lịch hẹn của tôi</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="w-full">
                                <Link href="/rooms">Tiếp tục tìm phòng</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container py-4">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href={`/rooms/${room.id}`}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Quay lại chi tiết phòng
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Đặt lịch xem phòng</h1>
                </div>
            </div>

            <div className="container py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left - Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Date Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5 text-primary" />
                                    Chọn ngày xem phòng
                                </CardTitle>
                                <CardDescription>
                                    Chọn ngày phù hợp để đến xem phòng
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    locale={vi}
                                    disabled={(date) =>
                                        date < new Date() ||
                                        date > addDays(new Date(), 30)
                                    }
                                    className="rounded-md border mx-auto"
                                />
                                {selectedDate && (
                                    <div className="mt-4 p-3 bg-primary/5 rounded-lg text-center">
                                        <span className="text-sm text-muted-foreground">Ngày đã chọn: </span>
                                        <span className="font-semibold text-primary">
                                            {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Time Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" />
                                    Chọn giờ xem phòng
                                </CardTitle>
                                <CardDescription>
                                    Khung giờ làm việc: 8:00 - 18:30
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <FormField
                                        control={form.control}
                                        name="time"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                                        {timeSlots.map((time) => (
                                                            <Button
                                                                key={time}
                                                                type="button"
                                                                variant={field.value === time ? 'default' : 'outline'}
                                                                onClick={() => field.onChange(time)}
                                                            >
                                                                {time}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </Form>
                            </CardContent>
                        </Card>

                        {/* Contact Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    Thông tin liên hệ
                                </CardTitle>
                                <CardDescription>
                                    Điền thông tin để chủ nhà có thể liên lạc với bạn
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="fullName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Họ và tên *</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input placeholder="Nhập họ và tên" className="pl-10" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Số điện thoại *</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                <Input placeholder="0901234567" className="pl-10" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email *</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                <Input placeholder="email@example.com" className="pl-10" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="notes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Ghi chú (không bắt buộc)</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Câu hỏi hoặc yêu cầu đặc biệt..."
                                                            className="min-h-[100px]"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full"
                                            disabled={isSubmitting || !selectedDate}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    <CalendarIcon className="mr-2 h-5 w-5" />
                                                    Xác nhận đặt lịch
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right - Room Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Thông tin phòng</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <img
                                        src={room.images[0]}
                                        alt={room.name}
                                        className="w-full aspect-video object-cover rounded-lg"
                                    />

                                    <div>
                                        <h3 className="font-semibold">{room.name}</h3>
                                        <p className="text-sm text-muted-foreground">{room.propertyName}</p>
                                    </div>

                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{room.address}, {room.district}</span>
                                    </div>

                                    <div className="flex items-center gap-1 text-sm">
                                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                        <span className="font-medium">{room.rating}</span>
                                        <span className="text-muted-foreground">({room.reviewCount} đánh giá)</span>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold text-primary">
                                                {formatPrice(room.price)}đ
                                            </span>
                                            <span className="text-muted-foreground">/tháng</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                        {room.amenities.slice(0, 4).map((amenity, i) => (
                                            <Badge key={i} variant="secondary" className="text-xs">
                                                {amenity}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
