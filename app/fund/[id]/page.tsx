"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Home,
  Sparkles,
  PiggyBank,
  Plus,
  Receipt,
  Trash2,
  Calendar,
  Wallet,
  TrendingDown,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { formatVND } from "@/src/utils/currencyParser";
import TransactionBottomSheet from "@/components/TransactionBottomSheet";
import {
  getTransactionsByFund,
  deleteTransaction,
  Transaction,
  FundId,
} from "@/src/db/schema";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  Category,
} from "@/src/db/categories";

// Cấu hình metadata cho 3 Quỹ tài chính
const FUND_CONFIG: Record<
  string,
  {
    name: string;
    ratio: string;
    percentage: number;
    icon: typeof Home;
    color: string;
    badge: string;
    gradient: string;
    bar: string;
    description: string;
    baseSpent: number;
  }
> = {
  essential: {
    name: "Chi tiêu thiết yếu",
    ratio: "50%",
    percentage: 0.5,
    icon: Home,
    color: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    gradient: "from-emerald-500/15 via-teal-500/5 to-transparent",
    bar: "from-emerald-400 to-teal-400",
    description: "Các khoản chi bắt buộc để duy trì cuộc sống: Ăn uống, Nhà cửa, Điện nước, Đi lại, Y tế.",
    baseSpent: 4200000,
  },
  lifestyle: {
    name: "Tận hưởng đời sống",
    ratio: "30%",
    percentage: 0.3,
    icon: Sparkles,
    color: "amber",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    gradient: "from-amber-500/15 via-orange-500/5 to-transparent",
    bar: "from-amber-400 to-orange-400",
    description: "Các khoản chi phục vụ tinh thần và sở thích: Cà phê, Xem phim, Du lịch, Mua sắm cá nhân.",
    baseSpent: 1950000,
  },
  investment: {
    name: "Tích lũy & Đầu tư",
    ratio: "20%",
    percentage: 0.2,
    icon: PiggyBank,
    color: "sky",
    badge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    gradient: "from-sky-500/15 via-blue-500/5 to-transparent",
    bar: "from-sky-400 to-blue-500",
    description: "Xây dựng tài sản và phát triển tương lai: Tiết kiệm khẩn cấp, Đầu tư chứng khoán, Học tập.",
    baseSpent: 2500000,
  },
};

export default function FundDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fundId = (params?.id as string) || "essential";

  const config = FUND_CONFIG[fundId] || FUND_CONFIG.essential;
  const FundIcon = config.icon;

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tải các giao dịch thuộc riêng quỹ này từ IndexedDB
  const loadFundData = useCallback(async () => {
    try {
      const data = await getTransactionsByFund(fundId as FundId);
      setTransactions(data);
    } catch (err) {
      console.error("Lỗi khi tải lịch sử quỹ:", err);
    } finally {
      setIsLoading(false);
    }
  }, [fundId]);

  useEffect(() => {
    loadFundData();
  }, [loadFundData]);

  // Xóa giao dịch
  const handleDeleteTx = async (id?: number) => {
    if (!id) return;
    try {
      await deleteTransaction(id);
      await loadFundData();
    } catch (err) {
      console.error("Lỗi xóa giao dịch:", err);
    }
  };

  // Tính toán số liệu quỹ
  const totalIncome = 15000000; // Mặc định thu nhập tháng
  const limitAmount = Math.round(totalIncome * config.percentage);

  // Tổng tiền giao dịch thực tế đã ghi chép thuộc quỹ này
  const recordedSpent = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + (tx.type === "expense" ? tx.amount : 0), 0);
  }, [transactions]);

  const totalSpent = config.baseSpent + recordedSpent;
  const remainingAmount = Math.max(0, limitAmount - totalSpent);
  const percentUsed = Math.min(100, Math.round((totalSpent / limitAmount) * 100));

  // Giả định 20 ngày còn lại trong tháng để tính ngân sách ngày
  const daysLeftInMonth = 21;
  const safeDailySpend = Math.round(remainingAmount / daysLeftInMonth);

  // Danh mục chi tiêu thuộc riêng quỹ này
  const fundCategories = useMemo(() => {
    return EXPENSE_CATEGORIES.filter((c) => c.fundId === fundId);
  }, [fundId]);

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
        1. NÚT ĐIỀU HƯỚNG QUAY LẠI TỔNG QUAN
      */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-neutral-300 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Quay lại Tổng quan</span>
        </button>

        {/* Nhãn định danh quỹ */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${config.badge}`}>
            Tỷ lệ {config.ratio}
          </span>
        </div>
      </div>

      {/* 
        2. MINI-HOME HERO SECTION: Bảng điều khiển thu nhỏ của riêng Quỹ
        - Chỉ tập trung hiển thị các thông số của quỹ này
      */}
      <section className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${config.gradient} border border-white/10 p-5 sm:p-7 xl:p-8 backdrop-blur-2xl shadow-2xl`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <FundIcon className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                  {config.name}
                </h1>
                <p className="text-[11px] text-neutral-400">
                  {config.description}
                </p>
              </div>
            </div>

            {/* Typography Lớn: Số dư còn lại của quỹ */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Ngân sách còn lại
              </span>
              <p className="text-3xl sm:text-5xl font-light tracking-tight text-white leading-none mt-1 whitespace-nowrap">
                {formatVND(remainingAmount)}
              </p>
            </div>

            {/* Thanh tiến độ sử dụng quỹ */}
            <div className="pt-2 space-y-1.5 max-w-md">
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${config.bar} transition-all duration-500`}
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span className="whitespace-nowrap">Đã chi {percentUsed}%</span>
                <span className="whitespace-nowrap">Hạn mức {formatVND(limitAmount)}</span>
              </div>
            </div>
          </div>

          {/* Các thẻ chỉ số thu nhỏ (Mini Stats) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 lg:max-w-md">
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col justify-between">
              <span className="text-[11px] text-neutral-400 font-medium whitespace-nowrap">Hạn mức tháng</span>
              <p className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap mt-1">
                {formatVND(limitAmount)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col justify-between">
              <span className="text-[11px] text-neutral-400 font-medium whitespace-nowrap">Đã sử dụng</span>
              <p className="text-xs sm:text-sm font-semibold text-rose-400 whitespace-nowrap mt-1">
                {formatVND(totalSpent)}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col justify-between">
              <span className="text-[11px] text-neutral-400 font-medium whitespace-nowrap">Khuyến nghị/ngày</span>
              <p className="text-xs sm:text-sm font-semibold text-emerald-400 whitespace-nowrap mt-1">
                ~{formatVND(safeDailySpend)}
              </p>
            </div>
          </div>

          {/* Nút thêm giao dịch cho quỹ này */}
          <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
            <button
              type="button"
              onClick={() => setIsSheetOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-bold text-xs sm:text-sm shadow-[0_4px_20px_rgba(16,185,129,0.35)] transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Ghi chép cho quỹ này</span>
            </button>
          </div>
        </div>
      </section>

      {/* 
        3. PHÂN VÙNG RIÊNG: BỐ CỤC ĐA CỘT
        - Cột trái: Các danh mục cấu thành nên quỹ này
        - Cột phải: LỊCH SỬ GIAO DỊCH RIÊNG CỦA QUỸ NÀY (Đúng yêu cầu đặt riêng biệt)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start w-full">
        {/* CỘT TRÁI (5/12): DANH MỤC THUỘC QUỸ */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <section className="rounded-3xl bg-white/[0.03] border border-white/[0.08] p-5 sm:p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Danh mục thuộc {config.name}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {fundCategories.length} danh mục chính được ánh xạ tự động
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {fundCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.id}
                    className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${cat.bgLight} ${cat.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">{cat.name}</p>
                        <p className="text-[10px] text-neutral-400">
                          {cat.subCategories.length} mục con: {cat.subCategories.map((s) => s.name).slice(0, 2).join(", ")}...
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Gợi ý quy chuẩn Zero-based */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-neutral-400 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-neutral-400">
              Khi chi tiêu vượt quá hạn mức quỹ này, số tiền thâm hụt sẽ được tự động bù trừ từ quỹ Tận hưởng ở chu kỳ tiếp theo để giữ tài chính an toàn.
            </p>
          </div>
        </div>

        {/* CỘT PHẢI (7/12): PHÂN VÙNG LỊCH SỬ GIAO DỊCH RIÊNG CỦA QUỸ NÀY */}
        <div className="lg:col-span-7 flex flex-col gap-6 w-full">
          <section className="rounded-3xl bg-white/[0.03] border border-white/[0.08] p-5 sm:p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-white whitespace-nowrap">
                    Lịch sử giao dịch của {config.name}
                  </h2>
                  <p className="text-[11px] text-neutral-400">
                    Chỉ hiển thị các khoản chi tiêu thuộc quỹ này
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10 whitespace-nowrap">
                {transactions.length} bản ghi
              </span>
            </div>

            {/* Danh sách giao dịch của riêng quỹ */}
            {isLoading ? (
              <div className="py-12 text-center text-xs text-neutral-500">
                Đang tải dữ liệu quỹ...
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-neutral-500 mb-2.5">
                  <Receipt className="w-5 h-5 stroke-[1.5]" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-neutral-300 mb-1">
                  Chưa có giao dịch nào trong {config.name}
                </p>
                <p className="text-[11px] text-neutral-500 mb-4 max-w-[240px]">
                  Bấm nút bên dưới để ghi nhận khoản chi tiêu đầu tiên cho quỹ này
                </p>
                <button
                  type="button"
                  onClick={() => setIsSheetOpen(true)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  + Thêm khoản chi cho quỹ
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto no-scrollbar pr-0.5">
                {transactions.map((tx) => {
                  const details = getCategoryDetails(tx.categoryId, tx.type);
                  const Icon = details.Icon;
                  const isExpense = tx.type === "expense";

                  return (
                    <div
                      key={tx.id}
                      className="group flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${details.bgLight} ${details.color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-white truncate whitespace-nowrap">
                            {details.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 whitespace-nowrap">
                            <span>{new Date(tx.timestamp).toLocaleDateString("vi-VN")}</span>
                            {tx.note && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[140px] text-neutral-300">{tx.note}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span
                          className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${
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
        </div>
      </div>

      {/* 
        4. HỘP THOẠI GIAO DỊCH
      */}
      <TransactionBottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSuccess={loadFundData}
      />
    </motion.div>
  );
}
