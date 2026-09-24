"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Home,
  TrendingUp,
  Coffee,
  ChevronRight,
  ArrowDownLeft,
  ArrowRight,
  X,
  Check,
} from "lucide-react";
import { parseNaturalCurrency, formatVND } from "@/src/utils/currencyParser";

export default function DashboardPage() {
  // Input thử nghiệm Smart Parser
  const [quickInput, setQuickInput] = useState("1tr4");
  const parsedValue = parseNaturalCurrency(quickInput);

  // State điều khiển Bottom Sheet Modal
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [parsedAmount, setParsedAmount] = useState(0);
  const [note, setNote] = useState("");
  const [selectedFund, setSelectedFund] = useState<"essential" | "investment" | "lifestyle">("essential");

  // Mock data 3 quỹ thể hiện 3 trạng thái Xanh (45%), Vàng (85%), Đỏ (110%)
  const [budgetFunds, setBudgetFunds] = useState([
    {
      id: "essential" as const,
      name: "Quỹ Thiết yếu",
      ratio: "50%",
      allocated: 20000000,
      spent: 9000000, // 45% (Còn 11.000.000 ₫)
    },
    {
      id: "investment" as const,
      name: "Quỹ Đầu tư & Tiết kiệm",
      ratio: "30%",
      allocated: 12000000,
      spent: 10200000, // 85% (Còn 1.800.000 ₫)
    },
    {
      id: "lifestyle" as const,
      name: "Quỹ Hưởng thụ",
      ratio: "20%",
      allocated: 8000000,
      spent: 8800000, // 110% (Vượt 800.000 ₫, tháng sau: 7.200.000 ₫)
    },
  ]);

  // Tính tổng số dư khả dụng toàn cục
  const totalAllocated = budgetFunds.reduce((sum, f) => sum + f.allocated, 0);
  const totalSpent = budgetFunds.reduce((sum, f) => sum + f.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;

  // Helper Dynamic RGB Alert với Subtitle tối giản icon
  function getBudgetStatus(spent: number, allocated: number) {
    const percent = Math.round((spent / allocated) * 100);
    const remaining = allocated - spent;
    const deficit = spent - allocated;
    const nextMonthAllowance = allocated - deficit;

    // 1. Xanh (< 80%): "✅ Còn {remaining}"
    if (percent < 80) {
      return {
        level: "safe" as const,
        percent,
        cardBg: "bg-emerald-500/[0.05]",
        accent: "text-emerald-400",
        subColor: "text-emerald-300/90",
        progressBg: "bg-emerald-400",
        subtitle: `✅ Còn ${formatVND(remaining)}`,
      };
    }

    // 2. Vàng (80% - 99%): "⚠️ Còn {remaining}"
    if (percent < 100) {
      return {
        level: "warning" as const,
        percent,
        cardBg: "bg-amber-500/[0.05]",
        accent: "text-amber-400",
        subColor: "text-amber-300/90",
        progressBg: "bg-amber-400",
        subtitle: `⚠️ Còn ${formatVND(remaining)}`,
      };
    }

    // 3. Đỏ (>= 100%): "❌ Vượt {deficit} (Tháng sau: {nextMonthAllowance})"
    return {
      level: "danger" as const,
      percent,
      cardBg: "bg-rose-500/[0.05]",
      accent: "text-rose-400",
      subColor: "text-rose-300/90",
      progressBg: "bg-rose-500",
      subtitle: `❌ Vượt ${formatVND(deficit)} (Tháng sau: ${formatVND(nextMonthAllowance)})`,
    };
  }

  // Danh sách giao dịch gần đây
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      title: "Thanh toán hóa đơn ăn tối tại nhà hàng Pizza 4P's Saigon Centre kèm đồ uống",
      category: "Hưởng thụ",
      time: "Hôm nay, 19:30",
      amount: -1850000,
      icon: Coffee,
      iconBg: "bg-rose-500/10 text-rose-400",
    },
    {
      id: 2,
      title: "Chuyển khoản Tích sản cổ phiếu",
      category: "Đầu tư",
      time: "Hôm nay, 14:20",
      amount: -10200000,
      icon: TrendingUp,
      iconBg: "bg-amber-500/10 text-amber-400",
    },
    {
      id: 3,
      title: "Tiền thuê căn hộ Vinhomes Central Park",
      category: "Thiết yếu",
      time: "Hôm qua, 09:15",
      amount: -7500000,
      icon: Home,
      iconBg: "bg-emerald-500/10 text-emerald-400",
    },
    {
      id: 4,
      title: "Tiền thưởng Dự án Công nghệ",
      category: "Thu nhập",
      time: "20 Th09, 18:30",
      amount: 15000000,
      icon: ArrowDownLeft,
      iconBg: "bg-teal-500/10 text-teal-300",
    },
    {
      id: 5,
      title: "Vé máy bay du lịch khứ hồi Đà Nẵng Vietjet Air",
      category: "Hưởng thụ",
      time: "19 Th09, 21:00",
      amount: -3200000,
      icon: ShoppingBag,
      iconBg: "bg-rose-500/10 text-rose-400",
    },
  ]);

  // Mở Bottom Sheet khi gõ xong số tiền và nhấn Enter hoặc nút mũi tên ->
  const handleTriggerInput = (amountInput?: string) => {
    const val = parseNaturalCurrency(amountInput ?? quickInput);
    if (val > 0) {
      setParsedAmount(val);
      setIsSheetOpen(true);
    } else {
      alert("Vui lòng nhập số tiền hợp lệ (ví dụ: 50k, 1tr4, 350)!");
    }
  };

  // Xác nhận lưu giao dịch từ Bottom Sheet
  const handleConfirmTransaction = () => {
    if (parsedAmount <= 0) return;

    const fundNameMap = {
      essential: "Thiết yếu",
      investment: "Đầu tư",
      lifestyle: "Hưởng thụ",
    };

    const iconMap = {
      essential: Home,
      investment: TrendingUp,
      lifestyle: Coffee,
    };

    const colorMap = {
      essential: "bg-emerald-500/10 text-emerald-400",
      investment: "bg-amber-500/10 text-amber-400",
      lifestyle: "bg-rose-500/10 text-rose-400",
    };

    const newTx = {
      id: Date.now(),
      title: note.trim() || `Chi tiêu ${fundNameMap[selectedFund]}`,
      category: fundNameMap[selectedFund],
      time: "Vừa xong",
      amount: -parsedAmount,
      icon: iconMap[selectedFund],
      iconBg: colorMap[selectedFund],
    };

    // 1. Thêm giao dịch mới lên đầu danh sách
    setTransactions((prev) => [newTx, ...prev]);

    // 2. Trừ tiền ở Quỹ tương ứng (tăng spent)
    setBudgetFunds((prev) =>
      prev.map((f) =>
        f.id === selectedFund ? { ...f, spent: f.spent + parsedAmount } : f
      )
    );

    // 3. Đóng Sheet và reset input
    setIsSheetOpen(false);
    setQuickInput("");
    setNote("");
  };

  return (
    <div className="space-y-5 pt-1 pb-4">
      {/* 
        ========================================================================
        1. HERO SECTION: SỐ DƯ KHẢ DỤNG (APPLE HIG MINIMALISM)
        ========================================================================
      */}
      <motion.section
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="pt-2 px-1"
      >
        <div className="flex items-center justify-between text-neutral-400 text-xs font-normal">
          <span>Số dư khả dụng</span>
          <span className="text-[11px] text-neutral-500 font-mono">Tháng 9, 2026</span>
        </div>

        <div className="mt-1 flex items-baseline gap-2 min-w-0">
          <span className="text-5xl font-light tracking-tight text-white font-sans drop-shadow-sm whitespace-nowrap truncate">
            {formatVND(totalRemaining).replace("₫", "").trim()}
          </span>
          <span className="text-2xl font-extralight text-neutral-400 shrink-0">₫</span>
        </div>

        <div className="mt-2.5 flex items-center gap-3 text-xs text-neutral-400 font-light min-w-0">
          <div className="whitespace-nowrap truncate">
            Hạn mức <span className="text-neutral-300 font-normal font-mono">{formatVND(totalAllocated)}</span>
          </div>
          <span className="text-neutral-600 shrink-0">·</span>
          <div className="whitespace-nowrap truncate">
            Đã chi <span className="text-neutral-300 font-normal font-mono">{formatVND(totalSpent)}</span>
          </div>
        </div>
      </motion.section>

      {/* 
        ========================================================================
        2. FORM NHẬP LIỆU: PILL SHAPE & TRIGGER MỞ BOTTOM SHEET
        Nhấn Enter hoặc nút mũi tên -> để mở Sheet xác nhận
        ========================================================================
      */}
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="space-y-2"
      >
        <div className="relative flex items-center rounded-full bg-white/[0.06] hover:bg-white/[0.08] focus-within:bg-white/[0.09] focus-within:ring-1 focus-within:ring-white/20 transition-all p-1.5 pl-5 pr-2">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleTriggerInput();
              }
            }}
            placeholder="Nhập số tiền (vd: 50k, 1tr2)..."
            className="w-full bg-transparent text-base font-light text-white placeholder-neutral-500 focus:outline-none"
          />
          {parsedValue > 0 && (
            <span className="shrink-0 text-xs font-mono font-medium text-emerald-400 mr-2 whitespace-nowrap">
              {formatVND(parsedValue)}
            </span>
          )}
          <button
            onClick={() => handleTriggerInput()}
            className="w-9 h-9 rounded-full bg-white text-black hover:bg-neutral-200 active:scale-90 flex items-center justify-center shrink-0 transition-transform shadow-md"
            title="Mở bảng phân bổ chi tiêu"
          >
            <ArrowRight className="w-4 h-4 text-neutral-900" />
          </button>
        </div>

        {/* Nút bấm mẫu nhanh */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] px-1">
          {[
            { label: "1tr4", val: "1tr4" },
            { label: "350", val: "350" },
            { label: "50k", val: "50k" },
            { label: "1t4", val: "1t4" },
            { label: "135398", val: "135398" },
          ].map((sample) => (
            <button
              key={sample.val}
              onClick={() => {
                setQuickInput(sample.val);
                handleTriggerInput(sample.val);
              }}
              className="px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-all whitespace-nowrap active:scale-95 shrink-0"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </motion.section>

      {/* 
        ========================================================================
        3. THẺ QUỸ NGÂN SÁCH: MỎNG, KHÔNG VIỀN CỨNG, CHỐNG RỚT DÒNG SUBTITLE
        ========================================================================
      */}
      <section className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-medium tracking-wider text-neutral-400 uppercase">
            3 Quỹ ngân sách
          </span>
          <span className="text-[10px] text-neutral-400 shrink-0">50 / 30 / 20</span>
        </div>

        <div className="space-y-2">
          {budgetFunds.map((fund, idx) => {
            const status = getBudgetStatus(fund.spent, fund.allocated);

            return (
              <motion.div
                key={fund.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + idx * 0.04 }}
                className={`p-3.5 rounded-2xl ${status.cardBg} backdrop-blur-sm transition-all`}
              >
                <div className="flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-medium text-white truncate">{fund.name}</span>
                    <span className="text-[10px] text-neutral-400 shrink-0">({fund.ratio})</span>
                  </div>
                  <div className="font-mono text-xs text-neutral-300 shrink-0 whitespace-nowrap text-right">
                    <span className={status.accent}>{formatVND(fund.spent)}</span>
                    <span className="text-neutral-500"> / {formatVND(fund.allocated)}</span>
                  </div>
                </div>

                {/* Progress bar siêu mỏng h-1.5 */}
                <div className="mt-2.5 w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${status.progressBg} transition-all duration-500`}
                    style={{ width: `${Math.min(100, status.percent)}%` }}
                  />
                </div>

                {/* Subtitle rút gọn icon */}
                <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
                  <span
                    className={`font-medium min-w-0 flex-1 truncate whitespace-nowrap tracking-tight ${status.subColor}`}
                    title={status.subtitle}
                  >
                    {status.subtitle}
                  </span>
                  <span className={`font-mono text-[11px] font-medium shrink-0 ${status.accent}`}>
                    {status.percent}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 
        ========================================================================
        4. LỊCH SỬ THU CHI: PHẲNG TRÊN NỀN ĐEN OLED, XỬ LÝ CHUỖI DÀI TRUNCATE
        ========================================================================
      */}
      <section className="space-y-1 pt-1">
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-[11px] font-medium tracking-wider text-neutral-400 uppercase">
            Giao dịch gần đây
          </span>
          <button className="text-[11px] text-neutral-400 hover:text-white flex items-center transition-colors shrink-0">
            Tất cả <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        <div className="max-h-[220px] overflow-y-auto no-scrollbar overscroll-contain px-1 divide-y divide-white/[0.04]">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="py-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <div className="min-w-0 flex-1 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${tx.iconBg}`}>
                  <tx.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-normal text-white truncate" title={tx.title}>
                    {tx.title}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5 truncate">
                    {tx.time} · {tx.category}
                  </div>
                </div>
              </div>

              <div className="shrink-0 whitespace-nowrap text-right">
                <div
                  className={`text-xs font-mono font-medium ${
                    tx.amount > 0 ? "text-emerald-400" : "text-white"
                  }`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {formatVND(tx.amount)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 
        ========================================================================
        5. BOTTOM SHEET MODAL (FRAMER MOTION - APPLE HIG)
      {/* 
        ========================================================================
        5. BOTTOM SHEET MODAL (FLEXBOX WRAPPER - APPLE HIG)
        Backdrop cha (z-50 flex justify-end items-center) bọc Sheet con (max-w-[430px])
        ========================================================================
      */}
      <AnimatePresence>
        {isSheetOpen && (
          /* Lớp Backdrop: Phủ kín màn hình, căn giữa trục ngang và ép sát đáy trục dọc */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSheetOpen(false)}
            className="fixed inset-0 z-50 flex flex-col justify-end items-center bg-black/60 backdrop-blur-sm"
          >
            {/* Lớp Bottom Sheet: Nằm trong khung 430px, trượt lò xo từ đáy lên, bám sát mép dưới */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[430px] bg-neutral-900 border-t border-white/10 rounded-t-3xl p-5 pb-safe relative mb-0 shadow-[0_-16px_40px_rgba(0,0,0,0.8)] select-none"
            >
              {/* Thanh kéo nhỏ (Drag handle) ở đỉnh sheet */}
              <div className="w-10 h-1 rounded-full bg-neutral-600 mx-auto mb-3" />

              {/* Nút đóng góc phải */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  Xác nhận chi tiêu
                </span>
                <button
                  onClick={() => setIsSheetOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Hiển thị số tiền to rõ nét */}
              <div className="my-3 text-center">
                <span className="text-3xl font-light text-white font-mono tracking-tight">
                  {formatVND(parsedAmount)}
                </span>
              </div>

              {/* Segmented Control: 3 nút chọn Quỹ Ngân Sách */}
              <div className="space-y-1.5 my-3">
                <label className="text-[11px] text-neutral-400 font-medium">
                  Phân bổ vào quỹ:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: "essential" as const,
                      label: "Thiết yếu",
                      sub: "50%",
                      activeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.2)]",
                    },
                    {
                      id: "investment" as const,
                      label: "Đầu tư",
                      sub: "30%",
                      activeClass: "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_12px_rgba(251,191,36,0.2)]",
                    },
                    {
                      id: "lifestyle" as const,
                      label: "Hưởng thụ",
                      sub: "20%",
                      activeClass: "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]",
                    },
                  ].map((fund) => {
                    const isSelected = selectedFund === fund.id;
                    return (
                      <button
                        key={fund.id}
                        type="button"
                        onClick={() => setSelectedFund(fund.id)}
                        className={`py-2 px-2 rounded-2xl text-center border transition-all active:scale-95 ${
                          isSelected
                            ? fund.activeClass
                            : "bg-white/[0.04] text-neutral-400 border-transparent hover:text-white"
                        }`}
                      >
                        <div className="text-xs font-semibold leading-tight">{fund.label}</div>
                        <div className="text-[10px] opacity-70 mt-0.5">{fund.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ô Ghi chú không viền */}
              <div className="my-3 space-y-1.5">
                <label className="text-[11px] text-neutral-400 font-medium">
                  Ghi chú chi tiêu:
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú (vd: Tiền cà phê, ăn trưa)..."
                  className="w-full bg-white/[0.05] border border-transparent focus:border-white/20 rounded-2xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                />
              </div>

              {/* Nút Xác nhận to tràn viền, tối ưu cho ngón cái */}
              <button
                type="button"
                onClick={handleConfirmTransaction}
                className="w-full mt-2 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm tracking-wide active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Xác nhận giao dịch
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
