import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Nhà Trọ - Tìm Phòng Trọ Nhanh Chóng",
  description: "Nền tảng tìm kiếm và quản lý nhà trọ, phòng trọ hàng đầu Việt Nam",
  keywords: ["nhà trọ", "phòng trọ", "thuê phòng", "cho thuê phòng", "tìm phòng trọ"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
