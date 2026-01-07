"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bell, Receipt, FileText, Wrench, Calendar, CheckCheck } from 'lucide-react';

interface Notification {
    id: string;
    type: 'invoice' | 'contract' | 'maintenance' | 'appointment' | 'system';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const mockNotifications: Notification[] = [
    { id: '1', type: 'invoice', title: 'Hóa đơn mới', message: 'Hóa đơn tháng 12/2024 đã được tạo', time: '5 phút trước', read: false },
    { id: '2', type: 'maintenance', title: 'Yêu cầu sửa chữa', message: 'Yêu cầu của bạn đang được xử lý', time: '2 giờ trước', read: false },
    { id: '3', type: 'contract', title: 'Hợp đồng sắp hết hạn', message: 'Hợp đồng của bạn sẽ hết hạn trong 30 ngày', time: '1 ngày trước', read: true },
    { id: '4', type: 'appointment', title: 'Lịch hẹn xác nhận', message: 'Chủ nhà đã xác nhận lịch hẹn xem phòng', time: '2 ngày trước', read: true },
];

export function NotificationsPopover() {
    const [notifications, setNotifications] = useState(mockNotifications);
    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'invoice': return <Receipt className="h-4 w-4 text-blue-500" />;
            case 'contract': return <FileText className="h-4 w-4 text-purple-500" />;
            case 'maintenance': return <Wrench className="h-4 w-4 text-orange-500" />;
            case 'appointment': return <Calendar className="h-4 w-4 text-green-500" />;
            default: return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Thông báo</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                            <CheckCheck className="h-4 w-4 mr-1" />
                            Đọc tất cả
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                            Không có thông báo mới
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${!notification.read ? 'bg-primary/5' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm truncate">{notification.title}</p>
                                                {!notification.read && (
                                                    <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{notification.message}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <Separator />
                <div className="p-2">
                    <Button variant="ghost" className="w-full text-sm">
                        Xem tất cả thông báo
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
