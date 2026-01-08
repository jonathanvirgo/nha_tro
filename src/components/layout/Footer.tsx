"use client";

import Link from 'next/link';
import { Home, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const aboutLinks = [
    { href: '/about', label: 'Về chúng tôi' },
    { href: '/team', label: 'Đội ngũ' },
    { href: '/careers', label: 'Tuyển dụng' },
    { href: '/press', label: 'Báo chí' },
  ];

  const guideLinks = [
    { href: '/guide/search', label: 'Hướng dẫn tìm phòng' },
    { href: '/guide/booking', label: 'Đặt lịch xem phòng' },
    { href: '/guide/contract', label: 'Ký hợp đồng' },
    { href: '/guide/payment', label: 'Thanh toán' },
  ];

  const policyLinks = [
    { href: '/privacy', label: 'Chính sách bảo mật' },
    { href: '/terms', label: 'Điều khoản sử dụng' },
    { href: '/refund', label: 'Chính sách hoàn tiền' },
    { href: '/support', label: 'Trung tâm hỗ trợ' },
  ];

  const socialLinks = [
    { href: 'https://facebook.com', label: 'Facebook', icon: Facebook },
    { href: 'https://zalo.me', label: 'Zalo', icon: Phone },
    { href: 'mailto:contact@nhatro.vn', label: 'Email', icon: Mail },
  ];

  return (
    <footer className="bg-muted/30 border-t border-border">
      {/* Main Footer Content */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-500">
                <Home className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-2xl gradient-text">NhaTro</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Nền tảng tìm kiếm và đặt lịch xem phòng trọ số 1 Việt Nam.
              Giúp bạn tìm được nơi ở ưng ý một cách nhanh chóng và tiện lợi.
            </p>

            {/* Newsletter */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Đăng ký nhận tin</h4>
              <div className="flex gap-2 max-w-sm">
                <Input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1"
                />
                <Button className="gradient-primary shrink-0">Đăng ký</Button>
              </div>
            </div>
          </div>

          {/* About Links */}
          <div>
            <h4 className="font-semibold mb-4">Về chúng tôi</h4>
            <ul className="space-y-3">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guide Links */}
          <div>
            <h4 className="font-semibold mb-4">Hướng dẫn</h4>
            <ul className="space-y-3">
              {guideLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policy Links */}
          <div>
            <h4 className="font-semibold mb-4">Chính sách</h4>
            <ul className="space-y-3">
              {policyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Info & Social */}
      <div className="border-t border-border">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Contact Info */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>Hotline: 1900 xxxx</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>contact@nhatro.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>TP. Hồ Chí Minh, Việt Nam</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                  size="icon"
                  asChild
                  className="hover:text-primary"
                >
                  <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                    <link.icon className="h-5 w-5" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border bg-muted/50">
        <div className="container py-4">
          <p className="text-center text-sm text-muted-foreground">
            © {currentYear} NhaTro. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
