"use client";

import React, { useState } from "react";
import { Home, PieChart, Plus, BarChart3, Settings } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: "home", label: "Tổng quan", icon: Home },
  { id: "budget", label: "Ngân sách", icon: PieChart },
  { id: "analytics", label: "Báo cáo", icon: BarChart3 },
  { id: "settings", label: "Cài đặt", icon: Settings },
];

export default function BottomNav() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 select-none"
      aria-label="Thanh điều hướng ứng dụng"
    >
      {/* 
        Glassmorphism bar theo yêu cầu:
        bg-white/10 backdrop-blur-md border-t border-white/20
        Chừa khoảng an toàn pb-safe cho thanh Home Indicator của Apple iOS
      */}
      <div className="bg-white/10 backdrop-blur-md border-t border-white/20 px-6 pt-2 pb-safe shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between relative h-14">
          {/* Tab 1: Tổng quan */}
          <button
            onClick={() => setActiveTab(navItems[0].id)}
            className={`flex flex-col items-center justify-center w-12 transition-all duration-200 active:scale-90 ${
              activeTab === navItems[0].id
                ? "text-emerald-400 font-medium"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {React.createElement(navItems[0].icon, { className: "w-5 h-5 mb-1" })}
            <span className="text-[10px] tracking-tight">{navItems[0].label}</span>
          </button>

          {/* Tab 2: Ngân sách */}
          <button
            onClick={() => setActiveTab(navItems[1].id)}
            className={`flex flex-col items-center justify-center w-12 transition-all duration-200 active:scale-90 ${
              activeTab === navItems[1].id
                ? "text-emerald-400 font-medium"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {React.createElement(navItems[1].icon, { className: "w-5 h-5 mb-1" })}
            <span className="text-[10px] tracking-tight">{navItems[1].label}</span>
          </button>

          {/* Floating Action Button (FAB) chính giữa */}
          <div className="relative -top-5 flex justify-center items-center">
            <button
              onClick={() => {
                const event = new CustomEvent("open-add-transaction");
                window.dispatchEvent(event);
              }}
              aria-label="Thêm giao dịch mới"
              className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-black shadow-[0_8px_20px_rgba(16,185,129,0.45)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.65)] transition-all duration-300 active:scale-95 active:rotate-90 border-2 border-white/30"
            >
              <Plus className="w-7 h-7 stroke-[2.5] text-neutral-950 transition-transform duration-300 group-hover:scale-110" />
              {/* Vòng sáng viền mờ kiểu Apple */}
              <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse pointer-events-none" />
            </button>
          </div>

          {/* Tab 3: Báo cáo */}
          <button
            onClick={() => setActiveTab(navItems[2].id)}
            className={`flex flex-col items-center justify-center w-12 transition-all duration-200 active:scale-90 ${
              activeTab === navItems[2].id
                ? "text-emerald-400 font-medium"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {React.createElement(navItems[2].icon, { className: "w-5 h-5 mb-1" })}
            <span className="text-[10px] tracking-tight">{navItems[2].label}</span>
          </button>

          {/* Tab 4: Cài đặt */}
          <button
            onClick={() => setActiveTab(navItems[3].id)}
            className={`flex flex-col items-center justify-center w-12 transition-all duration-200 active:scale-90 ${
              activeTab === navItems[3].id
                ? "text-emerald-400 font-medium"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {React.createElement(navItems[3].icon, { className: "w-5 h-5 mb-1" })}
            <span className="text-[10px] tracking-tight">{navItems[3].label}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
