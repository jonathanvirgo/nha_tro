"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Building,
    Home,
    Users,
    FileText,
    Receipt,
    Wrench,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
} from 'lucide-react';
import { useState } from 'react';

const sidebarLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/motels', label: 'Nhà trọ', icon: Building },
    { href: '/admin/rooms', label: 'Phòng', icon: Home },
    { href: '/admin/tenants', label: 'Người thuê', icon: Users },
    { href: '/admin/contracts', label: 'Hợp đồng', icon: FileText },
    { href: '/admin/invoices', label: 'Hóa đơn', icon: Receipt },
    { href: '/admin/maintenance', label: 'Sửa chữa', icon: Wrench },
    { href: '/admin/reports', label: 'Báo cáo', icon: BarChart3 },
    { href: '/admin/settings', label: 'Cài đặt', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Top Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-lg font-bold text-primary-foreground">N</span>
                        </div>
                        <span className="text-xl font-bold hidden sm:inline">NhaTro Admin</span>
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            3
                        </span>
                    </Button>
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatarUrl || undefined} />
                        <AvatarFallback>{user?.fullName?.[0] || 'A'}</AvatarFallback>
                    </Avatar>
                </div>
            </header>

            <div className="flex pt-16">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r pt-16 lg:pt-0 transition-transform lg:translate-x-0",
                        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <div className="flex flex-col h-full">
                        {/* User Info */}
                        <div className="p-4 border-b">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={user?.avatarUrl || undefined} />
                                    <AvatarFallback>{user?.fullName?.[0] || 'A'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{user?.fullName || 'Admin'}</div>
                                    <div className="text-sm text-muted-foreground truncate">Quản trị viên</div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                            {sidebarLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        pathname === link.href
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <link.icon className="h-5 w-5" />
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Footer */}
                        <div className="p-4 border-t">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-muted-foreground"
                                onClick={logout}
                            >
                                <LogOut className="h-5 w-5 mr-3" />
                                Đăng xuất
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 lg:p-6 p-4 min-h-[calc(100vh-4rem)]">{children}</main>
            </div>
        </div>
    );
}
