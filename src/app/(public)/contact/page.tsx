"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Send,
    MessageCircle,
    Building,
    HelpCircle,
    FileText,
    Users,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const contactSchema = z.object({
    fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ'),
    subject: z.string().min(1, 'Vui lòng chọn chủ đề'),
    message: z.string().min(10, 'Nội dung phải có ít nhất 10 ký tự'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
        },
    });

    const onSubmit = async (data: ContactFormData) => {
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        toast.success('Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi trong 24 giờ.');
        form.reset();
        setIsSubmitting(false);
    };

    const contactInfo = [
        { icon: Phone, title: 'Hotline', content: '1900 xxxx', description: 'Hỗ trợ 24/7' },
        { icon: Mail, title: 'Email', content: 'support@nhatro.vn', description: 'Phản hồi trong 24 giờ' },
        { icon: MapPin, title: 'Địa chỉ', content: '123 Nguyễn Văn Linh', description: 'Quận 7, TP.HCM' },
        { icon: Clock, title: 'Giờ làm việc', content: '8:00 - 18:00', description: 'Thứ 2 - Thứ 7' },
    ];

    const subjects = [
        { value: 'general', label: 'Câu hỏi chung' },
        { value: 'support', label: 'Hỗ trợ kỹ thuật' },
        { value: 'complaint', label: 'Khiếu nại' },
        { value: 'partnership', label: 'Hợp tác kinh doanh' },
        { value: 'feedback', label: 'Góp ý cải thiện' },
    ];

    const faqs = [
        { icon: HelpCircle, question: 'Làm sao để đăng tin cho thuê phòng?', answer: 'Bạn cần đăng ký tài khoản chủ nhà, sau đó vào mục "Đăng tin" để tạo tin cho thuê.' },
        { icon: FileText, question: 'Phí đăng tin là bao nhiêu?', answer: 'Đăng tin cơ bản miễn phí. Các gói tin nổi bật có phí từ 50,000đ/tuần.' },
        { icon: Users, question: 'Làm sao để liên hệ chủ nhà?', answer: 'Bạn có thể gọi điện, nhắn tin hoặc đặt lịch xem phòng trực tiếp trên trang chi tiết phòng.' },
        { icon: Building, question: 'NhaTro có hoạt động ở tỉnh khác không?', answer: 'Có, chúng tôi đang mở rộng ra hơn 20 tỉnh thành trên cả nước.' },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-20 bg-gradient-to-br from-primary/5 via-background to-blue-500/5 overflow-hidden">
                <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

                <div className="container relative z-10 text-center">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        Liên hệ với <span className="text-primary">chúng tôi</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Bạn có câu hỏi hoặc cần hỗ trợ? Đội ngũ NhaTro luôn sẵn sàng giúp đỡ bạn.
                    </p>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-12 -mt-8">
                <div className="container">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {contactInfo.map((info, index) => (
                            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                                        <info.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold mb-1">{info.title}</h3>
                                    <p className="text-primary font-medium">{info.content}</p>
                                    <p className="text-sm text-muted-foreground">{info.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form & FAQ */}
            <section className="py-12">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Contact Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5 text-primary" />
                                    Gửi tin nhắn cho chúng tôi
                                </CardTitle>
                                <CardDescription>
                                    Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại trong thời gian sớm nhất
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="fullName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Họ và tên</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Nguyễn Văn A" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Số điện thoại</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="0901234567" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="email@example.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="subject"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Chủ đề</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Chọn chủ đề" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {subjects.map((subject) => (
                                                                <SelectItem key={subject.value} value={subject.value}>
                                                                    {subject.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="message"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nội dung</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="Nhập nội dung tin nhắn..." rows={5} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Đang gửi...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-5 w-5" />
                                                    Gửi tin nhắn
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>

                        {/* FAQ */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Câu hỏi thường gặp</h2>
                                <p className="text-muted-foreground">
                                    Tìm câu trả lời nhanh cho các thắc mắc phổ biến
                                </p>
                            </div>

                            <div className="space-y-4">
                                {faqs.map((faq, index) => (
                                    <Card key={index}>
                                        <CardContent className="p-4">
                                            <div className="flex gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <faq.icon className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium mb-1">{faq.question}</h4>
                                                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <Card className="bg-gradient-to-br from-primary/10 to-blue-500/10 border-primary/20">
                                <CardContent className="p-6 text-center">
                                    <h3 className="font-semibold mb-2">Vẫn cần hỗ trợ?</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Gọi ngay hotline để được tư vấn trực tiếp
                                    </p>
                                    <Button>
                                        <Phone className="mr-2 h-4 w-4" />
                                        1900 xxxx
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="py-12 bg-muted/30">
                <div className="container">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-2">Văn phòng của chúng tôi</h2>
                        <p className="text-muted-foreground">Ghé thăm văn phòng NhaTro để được hỗ trợ trực tiếp</p>
                    </div>
                    <Card className="overflow-hidden">
                        <div className="aspect-[2/1] bg-muted flex items-center justify-center">
                            <div className="text-center p-8">
                                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh
                                </p>
                                <Button variant="outline" className="mt-4" asChild>
                                    <a
                                        href="https://maps.google.com/?q=10.7769,106.6927"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Xem trên Google Maps
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </section>
        </div>
    );
}
