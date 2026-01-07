import Link from 'next/link';
import { Home, Phone, Mail, MapPin, Facebook, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-lg font-bold">N</span>
              </div>
              <span className="text-xl font-bold">NhaTro</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Nền tảng tìm kiếm và quản lý nhà trọ hàng đầu Việt Nam.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Liên kết</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-white">Trang chủ</Link></li>
              <li><Link href="/rooms" className="hover:text-white">Tìm phòng</Link></li>
              <li><Link href="/map" className="hover:text-white">Bản đồ</Link></li>
              <li><Link href="/contact" className="hover:text-white">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Dịch vụ</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/landlord" className="hover:text-white">Đăng phòng</Link></li>
              <li><Link href="/tenant" className="hover:text-white">Quản lý thuê</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Bảng giá</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>1900 xxxx</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contact@nhatro.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} NhaTro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
