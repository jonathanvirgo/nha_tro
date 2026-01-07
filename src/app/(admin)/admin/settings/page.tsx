"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User, Bell, Shield, Palette, Building } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
        newContract: true,
        payment: true,
        maintenance: true,
    });

    const handleSave = () => {
        toast.success('Cài đặt đã được lưu!');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Cài đặt</h1>
                <p className="text-muted-foreground">Quản lý cài đặt tài khoản và hệ thống</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="h-4 w-4" />
                        Hồ sơ
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="h-4 w-4" />
                        Thông báo
                    </TabsTrigger>
                    <TabsTrigger value="business" className="gap-2">
                        <Building className="h-4 w-4" />
                        Doanh nghiệp
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                        <Shield className="h-4 w-4" />
                        Bảo mật
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cá nhân</CardTitle>
                            <CardDescription>Cập nhật thông tin tài khoản của bạn</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Họ và tên</Label>
                                    <Input id="fullName" defaultValue="Admin" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" defaultValue="admin@nhatro.vn" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <Input id="phone" defaultValue="0901234567" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Địa chỉ</Label>
                                    <Input id="address" defaultValue="TP. Hồ Chí Minh" />
                                </div>
                            </div>
                            <Button onClick={handleSave}>Lưu thay đổi</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cài đặt thông báo</CardTitle>
                            <CardDescription>Quản lý cách bạn nhận thông báo</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="font-medium">Kênh thông báo</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Email</p>
                                            <p className="text-sm text-muted-foreground">Nhận thông báo qua email</p>
                                        </div>
                                        <Switch
                                            checked={notifications.email}
                                            onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Push notification</p>
                                            <p className="text-sm text-muted-foreground">Nhận thông báo trên trình duyệt</p>
                                        </div>
                                        <Switch
                                            checked={notifications.push}
                                            onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">SMS</p>
                                            <p className="text-sm text-muted-foreground">Nhận thông báo qua SMS</p>
                                        </div>
                                        <Switch
                                            checked={notifications.sms}
                                            onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="font-medium">Loại thông báo</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Hợp đồng mới</p>
                                            <p className="text-sm text-muted-foreground">Khi có hợp đồng mới được tạo</p>
                                        </div>
                                        <Switch
                                            checked={notifications.newContract}
                                            onCheckedChange={(checked) => setNotifications({ ...notifications, newContract: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Thanh toán</p>
                                            <p className="text-sm text-muted-foreground">Khi có thanh toán hoặc hóa đơn quá hạn</p>
                                        </div>
                                        <Switch
                                            checked={notifications.payment}
                                            onCheckedChange={(checked) => setNotifications({ ...notifications, payment: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Yêu cầu sửa chữa</p>
                                            <p className="text-sm text-muted-foreground">Khi có yêu cầu bảo trì mới</p>
                                        </div>
                                        <Switch
                                            checked={notifications.maintenance}
                                            onCheckedChange={(checked) => setNotifications({ ...notifications, maintenance: checked })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleSave}>Lưu cài đặt</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Business Tab */}
                <TabsContent value="business">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin doanh nghiệp</CardTitle>
                            <CardDescription>Cài đặt thông tin doanh nghiệp của bạn</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tên doanh nghiệp</Label>
                                    <Input defaultValue="Nhà Trọ Bình An" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mã số thuế</Label>
                                    <Input defaultValue="0123456789" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Địa chỉ</Label>
                                    <Input defaultValue="123 Đường ABC, Quận 1, TP.HCM" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Số tài khoản</Label>
                                    <Input defaultValue="1234567890" />
                                </div>
                            </div>
                            <Button onClick={handleSave}>Lưu thay đổi</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bảo mật tài khoản</CardTitle>
                            <CardDescription>Quản lý mật khẩu và bảo mật</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Mật khẩu hiện tại</Label>
                                    <Input type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mật khẩu mới</Label>
                                    <Input type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Xác nhận mật khẩu</Label>
                                    <Input type="password" />
                                </div>
                            </div>
                            <Button onClick={handleSave}>Đổi mật khẩu</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
