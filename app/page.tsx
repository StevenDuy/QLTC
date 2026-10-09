"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Car,
  Coffee,
  Home,
  MoreHorizontal,
  PiggyBank,
  Plus,
  Receipt,
  ShoppingBasket,
  Sparkles,
  TrendingUp,
  Trash2,
  ShieldCheck,
  Percent,
  ChevronRight,
} from "lucide-react";
import { formatVND } from "@/src/utils/currencyParser";
import TransactionBottomSheet from "@/components/TransactionBottomSheet";
import {
  getAllTransactions,
  deleteTransaction,
  Transaction,
} from "@/src/db/schema";
import { FUND_METADATA, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/src/db/categories";

export default function DashboardPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [period, setPeriod] = useState<"month" | "day">("month");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tải danh sách giao dịch thực tế từ IndexedDB
  const loadTransactions = useCallback(async () => {
    try {
      const data = await getAllTransactions();
      setTransactions(data);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu giao dịch:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();

    // Lắng nghe sự kiện mở modal từ BottomNav
    const handleOpenModal = () => setIsSheetOpen(true);
    window.addEventListener("open-add-transaction", handleOpenModal);

    return () => {
      window.removeEventListener("open-add-transaction", handleOpenModal);
    };
  }, [loadTransactions]);

  // Xóa một giao dịch
  const handleDeleteTx = async (id?: number) => {
    if (!id) return;
    try {
      await deleteTransaction(id);
      await loadTransactions();
    } catch (err) {
      console.error("Lỗi xóa giao dịch:", err);
    }
  };

  // Tính toán số liệu tổng hợp
  const { totalIncome, totalExpense, fundSpent } = useMemo(() => {
    let income = 15000000; // Ngân sách cơ bản mặc định
    let expense = 0;
    const spentByFund = {
      essential: 0,
      lifestyle: 0,
      investment: 0,
    };

    transactions.forEach((tx) => {
      if (tx.type === "income") {
        income += tx.amount;
      } else {
        expense += tx.amount;
        if (tx.fundId in spentByFund) {
          spentByFund[tx.fundId as keyof typeof spentByFund] += tx.amount;
        }
      }
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      fundSpent: spentByFund,
    };
  }, [transactions]);

  // 3 Quỹ tài chính theo phương pháp 50/30/20
  const funds = useMemo(() => {
    const essentialLimit = Math.round(totalIncome * 0.5);
    const lifestyleLimit = Math.round(totalIncome * 0.3);
    const investmentLimit = Math.round(totalIncome * 0.2);

    return [
      {
        id: "essential",
        name: "Chi tiêu thiết yếu",
        ratio: "50%",
        limit: essentialLimit,
        spent: fundSpent.essential + 4200000,
        icon: Home,
        color: "emerald",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        bar: "from-emerald-400 to-teal-400",
      },
      {
        id: "lifestyle",
        name: "Tận hưởng đời sống",
        ratio: "30%",
        limit: lifestyleLimit,
        spent: fundSpent.lifestyle + 1950000,
        icon: Sparkles,
        color: "amber",
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        bar: "from-amber-400 to-orange-400",
      },
      {
        id: "investment",
        name: "Tích lũy & Đầu tư",
        ratio: "20%",
        limit: investmentLimit,
        spent: fundSpent.investment + 2500000,
        icon: PiggyBank,
        color: "sky",
        badge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
        bar: "from-sky-400 to-blue-500",
      },
    ];
  }, [totalIncome, fundSpent]);

  // Số dư an toàn có thể chi tiêu
  const totalAllocated = funds.reduce((acc, f) => acc + f.spent, 0);
  const safeToSpend = Math.max(0, totalIncome - totalAllocated);
  const spentRatio = Math.min(100, Math.round((totalAllocated / totalIncome) * 100));

  // Tìm biểu tượng hoặc tên danh mục
  const getCategoryDetails = (catId: string, type: string) => {
    const list = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const found = list.find((c) => c.id === catId);
    return {
      name: found?.name || catId,
      Icon: found?.icon || Receipt,
      color: found?.color || "text-neutral-300",
      bgLight: found?.bgLight || "bg-neutral-800",
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="w-full flex flex-col gap-6 sm:gap-8"
    >
      {/* 
        1. HERO HEADER SECTION
        - Chống rớt chữ trên Mobile bằng whitespace-nowrap và truncate
        - Nút ghi chép chính duy nhất đặt nổi bật trên trang
      */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent border border-white/10 p-5 sm:p-7 xl:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 xl:gap-8">
          {/* Cụm Số Dư Khả Dụng */}
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 whitespace-nowrap">
                Ngân sách tức thì
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>

            {/* Typography co giãn tự do, không bao giờ gãy dòng số tiền */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white leading-none whitespace-nowrap">
              {formatVND(safeToSpend)}
            </h1>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Số tiền an toàn có thể chi tiêu trong tháng không lo thâm hụt
            </p>
          </div>

          {/* Các thẻ chỉ số nhanh - Cố định dòng trên Mobile */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 flex-1 lg:max-w-xl">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] sm:text-[11px] text-neutral-400 font-medium whitespace-nowrap truncate">Thu nhập</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap truncate">
                {formatVND(totalIncome)}
              </p>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] sm:text-[11px] text-neutral-400 font-medium whitespace-nowrap truncate">Đã phân bổ</span>
                <Receipt className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap truncate">
                {formatVND(totalAllocated)}
              </p>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] sm:text-[11px] text-neutral-400 font-medium whitespace-nowrap truncate">Đã dùng</span>
                <Percent className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap truncate">
                {spentRatio}%
              </p>
            </div>
          </div>

          {/* NÚT THÊM GIAO DỊCH DUY NHẤT (NẰM TRÊN TRANG) */}
          <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={() => setIsSheetOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-bold text-xs sm:text-sm shadow-[0_4px_25px_rgba(16,185,129,0.35)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.55)] transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Ghi chép giao dịch</span>
            </button>
          </div>
        </div>
      </section>

      {/* 
        2. RESPONSIVE FULL-WIDTH GRID (12-Column Grid)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start w-full">
        {/* === CỘT TRÁI (LEFT COLUMN): 3 QUỸ & KHOẢN LINH HOẠT === */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6 sm:gap-8">
          {/* LÁ CHẮN TÀI CHÍNH: 3 Quỹ 50/30/20 */}
          <section className="w-full">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white whitespace-nowrap">
                  Lá chắn tài chính (Quy tắc 50/30/20)
                </h2>
                <p className="text-xs text-neutral-400">
                  Tự động phân bổ theo tỷ lệ vàng chuẩn mực bảo vệ tài chính cá nhân
                </p>
              </div>
            </div>

            {/* Lưới 3 quỹ: Khóa chuẩn chiều cao và chống gãy chữ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 xl:gap-4">
              {funds.map((fund, index) => {
                const Icon = fund.icon;
                const percent = Math.min(100, Math.round((fund.spent / fund.limit) * 100));
                const remaining = Math.max(0, fund.limit - fund.spent);

                return (
                  <Link
                    key={fund.id}
                    href={`/fund/${fund.id}`}
                    className="group flex flex-col"
                  >
                    <div
                      className="relative overflow-hidden rounded-2xl bg-white/[0.04] group-hover:bg-white/[0.07] border border-white/[0.08] group-hover:border-white/20 p-4 transition-all duration-200 flex flex-col justify-between flex-1 cursor-pointer shadow-sm group-hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-9 h-9 rounded-xl bg-white/10 group-hover:bg-white/15 flex items-center justify-center text-white shrink-0 transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${fund.badge}`}>
                              {fund.ratio}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-all group-hover:translate-x-0.5" />
                          </div>
                        </div>

                        <h3 className="text-xs sm:text-sm font-semibold text-neutral-200 group-hover:text-white mb-1 whitespace-nowrap truncate transition-colors">
                          {fund.name}
                        </h3>

                        <div className="flex items-baseline justify-between text-xs mb-2.5">
                          <span className="font-bold text-white text-xs sm:text-sm whitespace-nowrap">
                            {formatVND(fund.spent)}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-neutral-400 whitespace-nowrap">
                            / {formatVND(fund.limit)}
                          </span>
                        </div>
                      </div>

                      <div>
                        {/* Progress Bar */}
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${fund.bar} transition-all duration-500`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-neutral-400">
                          <span className="whitespace-nowrap">Đã chi {percent}%</span>
                          <span className="whitespace-nowrap">Còn {formatVND(remaining)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* KHOẢN LINH HOẠT HÀNG NGÀY */}
          <section className="w-full">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white whitespace-nowrap">
                  Hạn mức linh hoạt hàng ngày
                </h2>
                <p className="text-xs text-neutral-400">
                  Kiểm soát chi tiêu nhỏ giọt hàng ngày tránh thâm hụt
                </p>
              </div>

              {/* Bộ lọc Ngày / Tháng */}
              <div className="flex rounded-full border border-white/10 bg-white/5 p-0.5 text-xs shrink-0">
                {(["month", "day"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPeriod(mode)}
                    className={`rounded-full px-3 py-1 font-medium transition-colors whitespace-nowrap ${
                      period === mode
                        ? "bg-white text-neutral-950 shadow-sm"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {mode === "month" ? "Theo tháng" : "Theo ngày"}
                  </button>
                ))}
              </div>
            </div>

            {/* Lưới các danh mục linh hoạt: Nhãn ngắn gọn, không bao giờ rớt dòng */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
              {[
                { name: "Ăn uống", icon: ShoppingBasket, spent: 1450000, limit: 3000000, color: "text-emerald-400" },
                { name: "Cà phê", icon: Coffee, spent: 480000, limit: 1000000, color: "text-amber-400" },
                { name: "Đi lại", icon: Car, spent: 320000, limit: 800000, color: "text-sky-400" },
                { name: "Linh tinh", icon: MoreHorizontal, spent: 250000, limit: 500000, color: "text-purple-400" },
              ].map((item, idx) => {
                const Icon = item.icon;
                const factor = period === "day" ? 30 : 1;
                const curSpent = Math.round(item.spent / factor);
                const curLimit = Math.round(item.limit / factor);
                const pct = Math.min(100, Math.round((curSpent / curLimit) * 100));

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                          <Icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <span className="text-[10px] text-neutral-400 font-mono font-medium whitespace-nowrap">{pct}%</span>
                      </div>
                      <div className="text-xs font-semibold text-neutral-200 truncate whitespace-nowrap mb-1">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-neutral-400 whitespace-nowrap">
                        {formatVND(curSpent)} <span className="text-neutral-600">/</span> {formatVND(curLimit)}
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-2.5">
                      <div className="h-full bg-white/60 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* === CỘT PHẢI (RIGHT COLUMN): NHẬT KÝ GIAO DỊCH GẦN ĐÂY === */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 w-full">
          <section className="rounded-3xl bg-white/[0.03] border border-white/[0.08] p-5 sm:p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white whitespace-nowrap">
                    Giao dịch thực tế
                  </h3>
                  <p className="text-[11px] text-neutral-400 whitespace-nowrap">
                    Lưu trữ cục bộ IndexedDB Dexie
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10 whitespace-nowrap">
                {transactions.length} bản ghi
              </span>
            </div>

            {/* Danh sách giao dịch */}
            {isLoading ? (
              <div className="py-10 text-center text-xs text-neutral-500">
                Đang tải dữ liệu từ cơ sở dữ liệu...
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-neutral-500 mb-2.5">
                  <Receipt className="w-5 h-5 stroke-[1.5]" />
                </div>
                <p className="text-xs font-medium text-neutral-300 mb-1">
                  Chưa có giao dịch nào
                </p>
                <p className="text-[11px] text-neutral-500 mb-4 max-w-[200px]">
                  Bắt đầu ghi chép các khoản chi tiêu hoặc thu nhập của bạn
                </p>
                <button
                  type="button"
                  onClick={() => setIsSheetOpen(true)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  + Thêm giao dịch đầu tiên
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto no-scrollbar pr-0.5">
                {transactions.map((tx) => {
                  const details = getCategoryDetails(tx.categoryId, tx.type);
                  const Icon = details.Icon;
                  const isExpense = tx.type === "expense";
                  const fundMeta = FUND_METADATA[tx.fundId] || FUND_METADATA.essential;

                  return (
                    <div
                      key={tx.id}
                      className="group flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${details.bgLight} ${details.color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate whitespace-nowrap">
                            {details.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 whitespace-nowrap">
                            <span>{new Date(tx.timestamp).toLocaleDateString("vi-VN")}</span>
                            <span>•</span>
                            <span className={fundMeta.color}>{fundMeta.name}</span>
                            {tx.note && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[90px] text-neutral-300">{tx.note}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-semibold whitespace-nowrap ${
                            isExpense ? "text-red-400" : "text-emerald-400"
                          }`}
                        >
                          {isExpense ? "-" : "+"} {formatVND(tx.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteTx(tx.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-white/5 transition-all cursor-pointer"
                          title="Xóa giao dịch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Quy chuẩn tài chính Zero-based */}
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-neutral-400 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-200 whitespace-nowrap">Nguyên tắc Zero-Based Budgeting</p>
              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                Mọi đồng tiền thu nhập đều được phân bổ chính xác vào 3 lá chắn (Thiết yếu 50%, Tận hưởng 30%, Đầu tư 20%) ngay khi phát sinh.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 
        3. HỘP THOẠI GIAO DỊCH (TRANSACTION BOTTOM SHEET / MODAL)
        - Vững chãi, không bị trượt lệch bố cục khi chuyển Thu/Chi
      */}
      <TransactionBottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSuccess={loadTransactions}
      />
    </motion.div>
  );
}
