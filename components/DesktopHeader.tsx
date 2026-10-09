"use client";

import React, { useState } from "react";
import { Wallet, Home, PieChart, BarChart3, Settings } from "lucide-react";

export default function DesktopHeader() {
  const [activeTab, setActiveTab] = useState("home");

  const navLinks = [
    { id: "home", label: "Tổng quan", icon: Home },
    { id: "budget", label: "Ngân sách", icon: PieChart },
    { id: "analytics", label: "Báo cáo", icon: BarChart3 },
    { id: "settings", label: "Cài đặt", icon: Settings },
  ];

  return (
    <header className="hidden md:block sticky top-0 z-40 w-full bg-black/70 backdrop-blur-2xl border-b border-white/[0.08] transition-all">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.35)]">
            <Wallet className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white font-sans">
                QLTC
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Personal PWA
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-none">
              Quản lý chi tiêu tối giản
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/[0.06]">
          {navLinks.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: Hiển thị thời gian & trạng thái tối giản (Không trùng lặp nút Thêm giao dịch) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px]">Tháng 10, 2026</span>
          </div>
        </div>
      </div>
    </header>
  );
}
