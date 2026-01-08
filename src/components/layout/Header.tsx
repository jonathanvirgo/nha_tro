"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Search,
  Menu,
  User,
  Bell,
  Heart,
  Calendar,
  LogOut,
  Home,
  MapPin,
  Phone,
  Building,
  FileText,
  Wrench,
  Receipt,
  ChevronDown,
  LayoutDashboard,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationsPopover } from '@/components/notifications-popover';

export function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  // Determine if user is a tenant
  const isTenant = user?.role === 'TENANT';
  const isLandlordOrAdmin = user?.role === 'LANDLORD' || user?.role === 'ADMIN';

  const mainNavItems = [
    { href: '/', label: 'Trang chủ', icon: Home },
    { href: '/rooms', label: 'Tìm phòng', icon: Search },
    { href: '/map', label: 'Bản đồ', icon: MapPin },
    { href: '/contact', label: 'Liên hệ', icon: Phone },
  ];

  const rentalManagementItems = [
    { href: '/tenant', label: 'Tổng quan', icon: LayoutDashboard },
    { href: '/tenant/room', label: 'Phòng của tôi', icon: Home },
    { href: '/tenant/contracts', label: 'Hợp đồng', icon: FileText },
    { href: '/tenant/invoices', label: 'Hóa đơn', icon: Receipt },
    { href: '/tenant/maintenance', label: 'Yêu cầu sửa chữa', icon: Wrench },
    { href: '/tenant/reviews', label: 'Đánh giá', icon: Star },
  ];

  const isRentalManagementActive = rentalManagementItems.some(
    item => pathname === item.href
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-500">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden font-bold text-xl gradient-text sm:inline-block">
            NhaTro
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Tenant Navigation (Desktop) */}
        {isTenant && (
          <nav className="hidden lg:flex items-center gap-1 ml-4 pl-4 border-l border-border">
            {/* Quản lý thuê Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-1",
                    isRentalManagementActive && "bg-primary/10 text-primary"
                  )}
                >
                  <Building className="h-4 w-4" />
                  Quản lý thuê
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-popover border border-border shadow-lg">
                {rentalManagementItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link 
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        pathname === item.href && "bg-accent"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        )}

        {/* Search Bar (Desktop - Hidden on home page) */}
        {!isHomePage && (
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm phòng trọ..."
                className="w-full pl-10 bg-muted/50"
              />
            </div>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Search Toggle (Tablet) */}
          {!isHomePage && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {isAuthenticated && user ? (
            <>
              {/* Notifications */}
              <NotificationsPopover />

              {/* Favorites */}
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Heart className="h-5 w-5" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName || ''} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <span className="hidden sm:inline-block text-sm font-medium">
                      {user.fullName || user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Thông tin cá nhân
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-bookings" className="cursor-pointer">
                      <Calendar className="mr-2 h-4 w-4" />
                      Lịch hẹn của tôi
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      Phòng yêu thích
                    </Link>
                  </DropdownMenuItem>
                  {isTenant && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/tenant" className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {isLandlordOrAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Quản lý
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button asChild className="gradient-primary">
                <Link href="/register">Đăng ký</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-4 mt-8">
                <nav className="flex flex-col gap-2">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                        pathname === item.href
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {isTenant && (
                  <>
                    <div className="h-px bg-border" />
                    <div className="px-4 text-xs text-muted-foreground font-medium">
                      Quản lý thuê
                    </div>
                    <nav className="flex flex-col gap-2">
                      {rentalManagementItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                            pathname === item.href
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                  </>
                )}

                {!isAuthenticated && (
                  <>
                    <div className="h-px bg-border" />
                    <div className="flex flex-col gap-2 px-4">
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/login">Đăng nhập</Link>
                      </Button>
                      <Button asChild className="w-full gradient-primary">
                        <Link href="/register">Đăng ký</Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && !isHomePage && (
        <div className="border-t border-border p-4 lg:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm phòng trọ..."
              className="w-full pl-10"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
