"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Check,
  Tag,
  Home,
  Sparkles,
  PiggyBank,
  Wallet,
  ChevronRight,
  Coins,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  Category,
  FUND_METADATA,
} from "@/src/db/categories";
import { addTransaction, TransactionType, FundId } from "@/src/db/schema";
import { parseNaturalCurrency, formatVND } from "@/src/utils/currencyParser";

interface TransactionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialAmount?: number;
  defaultFundId?: FundId;
}

// 9 Mệnh giá tiền Việt Nam phổ biến (Hiển thị thuần túy như tiền thật)
const VND_DENOMINATIONS = [
  { label: "1k", value: 1000 },
  { label: "2k", value: 2000 },
  { label: "5k", value: 5000 },
  { label: "10k", value: 10000 },
  { label: "20k", value: 20000 },
  { label: "50k", value: 50000 },
  { label: "100k", value: 100000 },
  { label: "200k", value: 200000 },
  { label: "500k", value: 500000 },
];

export default function TransactionBottomSheet({
  isOpen,
  onClose,
  onSuccess,
  initialAmount = 0,
  defaultFundId,
}: TransactionBottomSheetProps) {
  // Quản lý quy trình 4 bước tuần tự
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Nhận diện thiết bị di động (chỉ cho phép kéo vuốt trên mobile)
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Trạng thái hiển thị bảng mệnh giá nhanh
  const [showDenominations, setShowDenominations] = useState<boolean>(true);

  // Dữ liệu giao dịch
  const [type, setType] = useState<TransactionType>("expense");
  const [rawAmountInput, setRawAmountInput] = useState<string>("");
  const [parsedAmount, setParsedAmount] = useState<number>(0);
  const [selectedFundId, setSelectedFundId] = useState<FundId>("essential");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset khi mở sheet
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if (initialAmount > 0) {
        setRawAmountInput(initialAmount.toString());
        setParsedAmount(initialAmount);
      } else {
        setRawAmountInput("");
        setParsedAmount(0);
      }
      setSelectedFundId(defaultFundId || "essential");
      setSelectedCategoryId("");
      setNote("");
    }
  }, [isOpen, initialAmount, defaultFundId]);

  // Xử lý gõ tự nhiên (4tr, 2k, 50k, 1tr5...)
  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRawAmountInput(val);
    const parsed = parseNaturalCurrency(val);
    setParsedAmount(parsed);
  };

  // Cộng dồn nhanh mệnh giá tiền Việt Nam
  const handleAddDenomination = (valueToAdd: number) => {
    const newTotal = parsedAmount + valueToAdd;
    setParsedAmount(newTotal);
    setRawAmountInput(new Intl.NumberFormat("vi-VN").format(newTotal));
  };

  // Đặt lại số tiền về 0
  const handleClearAmount = () => {
    setParsedAmount(0);
    setRawAmountInput("");
  };

  // Danh sách các quỹ khả dụng cho Bước 2
  const availableFunds = useMemo(() => {
    if (type === "income") {
      return [
        {
          id: "income" as FundId,
          name: "Thu nhập vào ngân sách",
          ratio: "100%",
          icon: Wallet,
          color: "text-teal-400",
          bg: "bg-teal-500/10",
          desc: "Tiền lương, thưởng, lợi tức đầu tư hoặc các nguồn thu khác",
        },
      ];
    }
    return [
      {
        id: "essential" as FundId,
        name: "Chi tiêu thiết yếu",
        ratio: "50%",
        icon: Home,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        desc: "Ăn uống, Nhà cửa, Điện nước, Đi lại, Y tế...",
      },
      {
        id: "lifestyle" as FundId,
        name: "Tận hưởng đời sống",
        ratio: "30%",
        icon: Sparkles,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        desc: "Cà phê, Xem phim, Du lịch, Mua sắm cá nhân...",
      },
      {
        id: "investment" as FundId,
        name: "Tích lũy & Đầu tư",
        ratio: "20%",
        icon: PiggyBank,
        color: "text-sky-400",
        bg: "bg-sky-500/10",
        desc: "Tiền gửi tiết kiệm, Cổ phiếu, Khóa học kỹ năng...",
      },
    ];
  }, [type]);

  // Danh mục lọc theo quỹ đã chọn cho Bước 3
  const availableCategories: Category[] = useMemo(() => {
    const all = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return all.filter((c) => c.fundId === selectedFundId);
  }, [type, selectedFundId]);

  // Chi tiết danh mục đang chọn
  const activeCategory = useMemo(() => {
    const all = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return all.find((c) => c.id === selectedCategoryId) || availableCategories[0];
  }, [type, selectedCategoryId, availableCategories]);

  // Lưu giao dịch vào IndexedDB (Dexie)
  const handleSubmit = async () => {
    if (parsedAmount <= 0) return;

    try {
      setIsSubmitting(true);
      await addTransaction({
        amount: parsedAmount,
        type,
        fundId: selectedFundId,
        categoryId: selectedCategoryId || (availableCategories[0]?.id ?? "other"),
        note: note.trim() || undefined,
        timestamp: Date.now(),
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu giao dịch:", error);
      alert("Đã xảy ra lỗi khi lưu giao dịch. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fundMeta = FUND_METADATA[selectedFundId] || FUND_METADATA.essential;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="bottom-sheet-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center items-center bg-black/80 backdrop-blur-md select-none p-3 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] md:p-6"
        >
          {/* 
            KHUNG CONTAINER NỔI:
            - Desktop: Cố định vững chãi, KHÔNG kéo thả, KHÔNG nút X (bấm ra ngoài để thoát)
            - Mobile: Thẻ nổi có thanh vuốt kéo tự nhiên để thoát
          */}
          <motion.div
            key="bottom-sheet-content"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            drag={isMobile ? "y" : false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={
              isMobile
                ? (_e, info) => {
                    if (info.offset.y > 75 || info.velocity.y > 350) {
                      onClose();
                    }
                  }
                : undefined
            }
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-neutral-900 border border-white/10 rounded-[28px] md:rounded-[32px] p-5 sm:p-6 relative shadow-[0_-16px_40px_rgba(0,0,0,0.85)] md:shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden mb-2 sm:mb-0 touch-pan-y"
          >
            {/* Drag Handle cho Mobile - Vuốt xuống để đóng */}
            <div className="md:hidden flex justify-center items-center py-1 -mt-1 mb-2 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 rounded-full bg-neutral-600 active:bg-neutral-400 transition-colors" />
            </div>

            {/* Header Điều Hướng Từng Bước (KHÔNG CÓ NÚT X THEO YÊU CẦU) */}
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/[0.06]">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                  className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại</span>
                </button>
              ) : (
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Ghi nhận giao dịch
                </span>
              )}

              {/* Chỉ báo bước đồng nhất (1/4, 2/4...) */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      i === step
                        ? "w-6 bg-emerald-400"
                        : i < step
                        ? "w-1.5 bg-emerald-400/40"
                        : "w-1.5 bg-white/10"
                    }`}
                  />
                ))}
                <span className="text-[11px] font-mono text-neutral-400 ml-1">
                  {step}/4
                </span>
              </div>
            </div>

            {/* 
              SÂN KHẤU NỘI DUNG ĐỒNG NHẤT (h-[410px] CỐ ĐỊNH CHO CẢ 4 BƯỚC)
              - Triệt tiêu hoàn toàn co giật chiều cao
            */}
            <div className="h-[410px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                {/* ============================================================ */}
                {/* BƯỚC 1: NHẬP SỐ TIỀN & BẢNG MỆNH GIÁ CỘNG DỒN NHANH */}
                {/* ============================================================ */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="h-full flex flex-col justify-between"
                  >
                    {/* Phần trên: Toggle Thu/Chi & Ô Nhập Tiền Dời Lên Trên Ngay Ngắn */}
                    <div className="space-y-2.5 pt-0.5">
                      {/* Toggle Khoản Chi / Thu (Triệt tiêu 100% chớp hình) */}
                      <div className="flex items-center justify-center">
                        <div className="grid grid-cols-2 p-1 rounded-full bg-white/5 border border-white/10 w-full max-w-[260px]">
                          <button
                            type="button"
                            onClick={() => {
                              if (type === "expense") return;
                              setType("expense");
                              setSelectedFundId("essential");
                            }}
                            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 border cursor-pointer ${
                              type === "expense"
                                ? "bg-neutral-800 text-white shadow-sm border-white/10"
                                : "text-neutral-400 hover:text-white border-transparent"
                            }`}
                          >
                            <ArrowUpRight className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span>Khoản Chi</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (type === "income") return;
                              setType("income");
                              setSelectedFundId("income");
                            }}
                            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 border cursor-pointer ${
                              type === "income"
                                ? "bg-neutral-800 text-white shadow-sm border-white/10"
                                : "text-neutral-400 hover:text-white border-transparent"
                            }`}
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Khoản Thu</span>
                          </button>
                        </div>
                      </div>

                      {/* Ô Nhập Tiền (Dời lên trên, không nằm giữa) */}
                      <div className="text-center pt-1">
                        <div className="relative max-w-sm mx-auto">
                          <input
                            type="text"
                            inputMode="text"
                            autoFocus
                            value={rawAmountInput}
                            onChange={handleAmountInputChange}
                            placeholder="Gõ tắt: 4tr, 50k, 1tr5..."
                            className={`w-full bg-white/[0.04] border border-white/10 focus:border-white/25 rounded-2xl py-3 px-4 text-center text-3xl sm:text-4xl font-light tracking-tight focus:outline-none transition-colors ${
                              type === "expense" ? "text-red-400" : "text-emerald-400"
                            }`}
                          />
                        </div>

                        {/* Bộ Hiển Thị Quy Đổi Số Tiền Thật */}
                        <div className="mt-2 flex items-center justify-center min-h-[30px]">
                          {parsedAmount > 0 ? (
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/10">
                              <span className="text-[11px] text-neutral-400">Quy đổi:</span>
                              <span className="text-sm font-semibold text-white whitespace-nowrap">
                                {formatVND(parsedAmount)}
                              </span>
                            </div>
                          ) : (
                            <p className="text-[11px] text-neutral-500">
                              Gõ tắt tự nhiên: 4tr, 50k hoặc chọn mệnh giá bên dưới
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Phần giữa: BẢNG MỆNH GIÁ TIỀN VIỆT NAM (1k -> 500k) CỘNG DỒN NHANH */}
                    <div className="my-1 p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                      {/* Thanh điều khiển Ẩn/Hiện & Đặt lại */}
                      <div className="flex items-center justify-between mb-2 px-1">
                        <button
                          type="button"
                          onClick={() => setShowDenominations(!showDenominations)}
                          className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Coins className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-medium">Mệnh giá VND</span>
                          {showDenominations ? (
                            <ChevronUp className="w-3 h-3 text-neutral-500" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-neutral-500" />
                          )}
                        </button>

                        {parsedAmount > 0 && (
                          <button
                            type="button"
                            onClick={handleClearAmount}
                            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Xóa về 0</span>
                          </button>
                        )}
                      </div>

                      {/* Lưới 9 Mệnh giá VND (Cộng dồn thông minh khi bấm) */}
                      {showDenominations && (
                        <div className="grid grid-cols-3 gap-1.5">
                          {VND_DENOMINATIONS.map((item) => (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => handleAddDenomination(item.value)}
                              className="py-1.5 px-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/[0.04] text-xs font-mono font-medium text-neutral-300 hover:text-white transition-all active:scale-95 cursor-pointer whitespace-nowrap text-center"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Nút Tiếp tục sang Bước 2 */}
                    <div className="pt-1">
                      <button
                        type="button"
                        disabled={parsedAmount <= 0}
                        onClick={() => setStep(2)}
                        className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                          parsedAmount > 0
                            ? "bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 shadow-emerald-500/25 active:scale-98"
                            : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                        }`}
                      >
                        <span>Tiếp tục sang Chọn Quỹ</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ============================================================ */}
                {/* BƯỚC 2: CHỌN QUỸ (DẠNG DANH SÁCH LIST DỌC CHUẨN HÓA) */}
                {/* ============================================================ */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="h-full flex flex-col justify-between"
                  >
                    <div className="text-center mb-2">
                      <h3 className="text-sm font-semibold text-white">
                        Số tiền {formatVND(parsedAmount)} thuộc quỹ nào?
                      </h3>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Chạm vào một quỹ trong danh sách để tiếp tục
                      </p>
                    </div>

                    {/* DANH SÁCH DỌC (LIST VIEW) CHUẨN HÓA */}
                    <div className="space-y-2.5 overflow-y-auto no-scrollbar pr-0.5 flex-1 my-1">
                      {availableFunds.map((fund) => {
                        const Icon = fund.icon;
                        const isSelected = selectedFundId === fund.id;

                        return (
                          <button
                            key={fund.id}
                            type="button"
                            onClick={() => {
                              setSelectedFundId(fund.id);
                              setStep(3);
                            }}
                            className={`w-full p-3.5 rounded-2xl border text-left transition-all active:scale-98 cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-white/[0.08] border-white/30 shadow-md"
                                : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
                            }`}
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${fund.bg} ${fund.color}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">
                                    {fund.name}
                                  </span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 whitespace-nowrap">
                                    {fund.ratio}
                                  </span>
                                </div>
                                <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                                  {fund.desc}
                                </p>
                              </div>
                            </div>

                            <ChevronRight className="w-4 h-4 text-neutral-500 shrink-0 ml-2" />
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 text-center text-[11px] text-neutral-500">
                      Chạm vào quỹ để tự động chuyển sang bước chọn danh mục
                    </div>
                  </motion.div>
                )}

                {/* ============================================================ */}
                {/* BƯỚC 3: CHỌN DANH MỤC (DẠNG DANH SÁCH LIST DỌC CUỘN MƯỢT MÀ) */}
                {/* ============================================================ */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="h-full flex flex-col justify-between"
                  >
                    <div className="text-center mb-2">
                      <h3 className="text-sm font-semibold text-white">
                        Chọn danh mục trong {fundMeta.name}
                      </h3>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Chạm vào một mục trong danh sách dưới đây
                      </p>
                    </div>

                    {/* DANH SÁCH DỌC (LIST VIEW) DANH MỤC CUỘN NỘI BỘ */}
                    <div className="space-y-2 overflow-y-auto no-scrollbar pr-0.5 flex-1 my-1">
                      {availableCategories.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = selectedCategoryId === cat.id;

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setSelectedCategoryId(cat.id);
                              setStep(4);
                            }}
                            className={`w-full p-3 rounded-2xl border text-left transition-all active:scale-98 cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-white/[0.08] border-white/30 shadow-md"
                                : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cat.bgLight} ${cat.color}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-semibold text-white truncate whitespace-nowrap">
                                  {cat.name}
                                </p>
                                <p className="text-[10px] text-neutral-400 truncate">
                                  {cat.subCategories.length} mục con: {cat.subCategories.map((s) => s.name).slice(0, 3).join(", ")}
                                </p>
                              </div>
                            </div>

                            <ChevronRight className="w-4 h-4 text-neutral-500 shrink-0 ml-2" />
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 text-center text-[11px] text-neutral-500">
                      Chạm vào danh mục để chuyển sang xác nhận giao dịch
                    </div>
                  </motion.div>
                )}

                {/* ============================================================ */}
                {/* BƯỚC 4: GHI CHÚ & XÁC NHẬN HOÀN TẤT */}
                {/* ============================================================ */}
                {step === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="h-full flex flex-col justify-between"
                  >
                    <div className="text-center mb-1">
                      <h3 className="text-sm font-semibold text-white">
                        Xác nhận thông tin giao dịch
                      </h3>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Kiểm tra tóm tắt và ghi chú thêm nếu cần
                      </p>
                    </div>

                    {/* THẺ TÓM TẮT DẠNG LIST ĐỒNG BỘ */}
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-2.5 my-auto">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400">Số tiền:</span>
                        <span className={`font-bold text-base whitespace-nowrap ${
                          type === "expense" ? "text-red-400" : "text-emerald-400"
                        }`}>
                          {type === "expense" ? "-" : "+"} {formatVND(parsedAmount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs border-t border-white/[0.06] pt-2">
                        <span className="text-neutral-400">Phân bổ quỹ:</span>
                        <span className="font-semibold text-white whitespace-nowrap">
                          {fundMeta.name} ({fundMeta.ratio})
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs border-t border-white/[0.06] pt-2">
                        <span className="text-neutral-400">Danh mục:</span>
                        <span className="font-semibold text-white whitespace-nowrap">
                          {activeCategory?.name || "Chi tiêu"}
                        </span>
                      </div>

                      {/* Ô nhập ghi chú ngắn */}
                      <div className="border-t border-white/[0.06] pt-2.5">
                        <div className="relative flex items-center">
                          <Tag className="w-3.5 h-3.5 text-neutral-500 absolute left-3 pointer-events-none" />
                          <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Ghi chú thêm (tùy chọn)..."
                            className="w-full bg-white/[0.03] border border-white/10 focus:border-white/25 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Nút bấm Hoàn tất & Lưu giao dịch */}
                    <div className="pt-2">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                        className="w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 shadow-[0_4px_25px_rgba(16,185,129,0.35)] transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>{isSubmitting ? "Đang lưu..." : "Xác nhận & Hoàn tất"}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
