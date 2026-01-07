"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Home,
    FileText,
    Receipt,
    Wrench,
    Calendar,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import { useState } from 'react';

const sidebarLinks = [
    { href: '/tenant', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tenant/room', label: 'Phòng của tôi', icon: Home },
    { href: '/tenant/contracts', label: 'Hợp đồng', icon: FileText },
    { href: '/tenant/invoices', label: 'Hóa đơn', icon: Receipt },
    { href: '/tenant/maintenance', label: 'Báo hỏng', icon: Wrench },
    { href: '/tenant/appointments', label: 'Lịch xem phòng', icon: Calendar },
];

export default function TenantLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Header */}
            <header className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                    <span className="font-semibold">Tenant Portal</span>
                </div>
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl || undefined} />
                    <AvatarFallback>{user?.fullName?.[0] || user?.email[0].toUpperCase()}</AvatarFallback>
                </Avatar>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform lg:translate-x-0",
                        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <div className="flex flex-col h-full">
                        {/* Logo */}
                        <div className="p-6 border-b hidden lg:block">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                                    <span className="text-lg font-bold text-primary-foreground">N</span>
                                </div>
                                <span className="text-xl font-bold">NhaTro</span>
                            </Link>
                        </div>

                        {/* User Info */}
                        <div className="p-4 border-b">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={user?.avatarUrl || undefined} />
                                    <AvatarFallback>{user?.fullName?.[0] || user?.email[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{user?.fullName || 'Người thuê'}</div>
                                    <div className="text-sm text-muted-foreground truncate">{user?.email}</div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-1">
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
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 lg:p-6 p-4">{children}</main>
            </div>
        </div>
    );
}
