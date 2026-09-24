import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

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
  description: "PWA Quản lý Chi tiêu tối ưu chuẩn Apple iPhone & Safari",
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
    <html lang="vi" className="dark bg-[#0a0a0c]">
      <body className="bg-[#0a0a0c] text-white antialiased min-h-screen flex justify-center items-start selection:bg-emerald-500/20">
        {/*
          Khung Mobile-First Container:
          - Khống chế chiều rộng tối đa 430px (chuẩn iPhone 14/15 Pro)
          - Căn giữa màn hình trên Desktop
          - Nền ngoài tối (Dark Gray #0a0a0c), nền trong đen OLED chân thực (bg-black)
          - Ẩn toàn bộ thanh cuộn (no-scrollbar)
        */}
        <div className="w-full max-w-[430px] min-h-screen bg-black relative flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.85)] border-x border-neutral-900/60 no-scrollbar overflow-x-hidden">
          {/* Vùng an toàn phía trên (Tai thỏ / Dynamic Island) */}
          <div className="pt-safe w-full bg-black/40 backdrop-blur-md sticky top-0 z-40" />

          {/* Nội dung chính của trang (chừa khoảng trống dưới cho Bottom Nav + Safe Area) */}
          <main className="flex-1 pb-[calc(env(safe-area-inset-bottom,0px)+6rem)] px-4 pt-2">
            {children}
          </main>

          {/* Thanh điều hướng cố định đáy Glassmorphism có FAB */}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
