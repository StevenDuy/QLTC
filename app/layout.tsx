import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import DesktopHeader from "@/components/DesktopHeader";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "QLTC - Quản Lý Chi Tiêu Cá Nhân",
  description: "PWA Quản lý Chi tiêu tối ưu chuẩn Apple iPhone, iPad & Desktop",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "QLTC",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark bg-[#07080a]">
      <body className="bg-[#07080a] text-white antialiased min-h-screen flex flex-col selection:bg-emerald-500/20">
        {/*
          1. Desktop Navigation Header:
          - Tự động hiển thị trên Desktop (md:block) và ẩn hoàn toàn trên Mobile
        */}
        <DesktopHeader />

        {/* 2. Vùng an toàn phía trên cho iPhone (Tai thỏ / Dynamic Island) */}
        <div className="md:hidden pt-safe w-full bg-black/40 backdrop-blur-md sticky top-0 z-40" />

        {/*
          3. Nội dung chính của trang (Full-Width Fluid Elastic Layout - Chuẩn Facebook):
          - Mobile: Tự do co giãn theo chiều ngang điện thoại
          - Desktop: Tràn viền 100% không giới hạn trần max-w, tự động mở rộng theo màn hình từ FHD, 2K, 4K đến Ultrawide
        */}
        <main className="flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pt-2 sm:pt-6 pb-[calc(env(safe-area-inset-bottom,0px)+6rem)] md:pb-12">
          {children}
        </main>

        {/* 4. Thanh điều hướng cố định đáy Glassmorphism (Chỉ hiện trên thiết bị di động) */}
        <BottomNav />
      </body>
    </html>
  );
}
