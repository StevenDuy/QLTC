"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Check,
  Tag,
} from "lucide-react";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  Category,
  getFundForCategory,
  FUND_METADATA,
} from "@/src/db/categories";
import { addTransaction, TransactionType } from "@/src/db/schema";
import { parseNaturalCurrency } from "@/src/utils/currencyParser";

interface TransactionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialAmount?: number;
}

// Cấu hình vật lý lò xo chuẩn Apple HIG (Thanh thoát, chính xác, không rung lắc)
const appleSpring = {
  type: "spring" as const,
  stiffness: 400,
  damping: 32,
};

export default function TransactionBottomSheet({
  isOpen,
  onClose,
  onSuccess,
  initialAmount = 0,
}: TransactionBottomSheetProps) {
  // 1. Phân loại giao dịch (Expense vs Income)
  const [type, setType] = useState<TransactionType>("expense");

  // 2. State số tiền (Hỗ trợ gõ trực tiếp số hoặc gõ tắt tự nhiên kiểu tiếng Việt)
  const [rawAmountInput, setRawAmountInput] = useState<string>("");
  const [parsedAmount, setParsedAmount] = useState<number>(0);

  // 3. State Danh mục & Danh mục con
  const categories: Category[] = useMemo(() => {
    return type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  }, [type]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    EXPENSE_CATEGORIES[0].id
  );
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(
    null
  );

  // 4. State Ghi chú
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Cập nhật khi mở sheet hoặc nhận initialAmount
  useEffect(() => {
    if (isOpen) {
      if (initialAmount > 0) {
        setRawAmountInput(new Intl.NumberFormat("en-US").format(initialAmount));
        setParsedAmount(initialAmount);
      } else {
        setRawAmountInput("");
        setParsedAmount(0);
      }
      setSelectedCategoryId(
        type === "expense" ? EXPENSE_CATEGORIES[0].id : INCOME_CATEGORIES[0].id
      );
      setSelectedSubCategoryId(null);
      setNote("");
    }
  }, [isOpen, initialAmount, type]);

  // Danh mục hiện tại đang được chọn
  const activeCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCategoryId) || categories[0];
  }, [categories, selectedCategoryId]);

  // Chuyển đổi Loại giao dịch (Khoản Chi vs Khoản Thu)
  const handleTypeChange = (newType: TransactionType) => {
    if (newType === type) return;
    setType(newType);
    const targetCats = newType === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    setSelectedCategoryId(targetCats[0].id);
    setSelectedSubCategoryId(null);
  };

  // Xử lý thay đổi số tiền nhập vào
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // Nếu gõ tắt tự nhiên: 50k, 1tr4, 1t...
    if (/[ktrKTR]/.test(val)) {
      setRawAmountInput(val);
      const parsed = parseNaturalCurrency(val);
      setParsedAmount(parsed);
      return;
    }

    // Nếu gõ số thông thường
    const cleanDigits = val.replace(/[^0-9]/g, "");
    if (!cleanDigits) {
      setRawAmountInput("");
      setParsedAmount(0);
      return;
    }

    const num = parseInt(cleanDigits, 10);
    setRawAmountInput(new Intl.NumberFormat("en-US").format(num));
    setParsedAmount(num);
  };

  // Lưu giao dịch vào IndexedDB (Dexie)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      alert("Vui lòng nhập số tiền lớn hơn 0!");
      return;
    }

    try {
      setIsSubmitting(true);

      // Tự động suy luận FundId từ Category (Zero-friction UX)
      const inferredFundId = getFundForCategory(activeCategory.id);

      await addTransaction({
        amount: parsedAmount,
        type,
        fundId: inferredFundId,
        categoryId: activeCategory.id,
        subCategoryId: selectedSubCategoryId || undefined,
        note: note.trim() || undefined,
        timestamp: Date.now(),
      });

      // Reset form
      setRawAmountInput("");
      setParsedAmount(0);
      setNote("");
      setSelectedSubCategoryId(null);

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu giao dịch vào Dexie DB:", error);
      alert("Đã xảy ra lỗi khi lưu giao dịch. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quỹ tương ứng được tự động suy luận
  const currentFundMeta = FUND_METADATA[getFundForCategory(activeCategory.id)];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="bottom-sheet-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex flex-col justify-end items-center bg-black/60 backdrop-blur-md select-none"
        >
          {/* 
            RULE 1 & 4: Khung Bottom Sheet Container 
            - Không dùng bất kỳ pixel cứng nào (no h-8, no min-h)
            - Dùng duy nhất prop layout với lò xo appleSpring để co giãn tự nhiên theo nội dung
          */}
          <motion.div
            layout
            key="bottom-sheet-content"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              y: appleSpring,
              layout: appleSpring,
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[430px] bg-neutral-900 border-t border-white/10 rounded-t-[32px] p-5 pb-safe relative shadow-[0_-16px_40px_rgba(0,0,0,0.85)] max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            {/* 1. Drag Handle ở đỉnh Sheet */}
            <div className="w-10 h-1.5 rounded-full bg-neutral-700 mx-auto mb-4" />

            {/* 2. Header & Nút đóng */}
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Ghi nhận giao dịch
              </span>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-neutral-400 hover:text-white transition-colors active:scale-95"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 
              RULE 3: PERFECT SEGMENTED CONTROL
              - Chuẩn flex container: flex bg-white/5 p-1 rounded-full
              - Cả 2 nút là anh em flex hoàn hảo: relative flex-1 flex items-center justify-center py-1.5
              - layoutId="segmented-pill" chỉ trượt phẳng 100% trên trục X
            */}
            <div className="relative flex items-center bg-white/5 p-1 rounded-full max-w-[280px] mx-auto mb-4 border border-white/10">
              <button
                type="button"
                onClick={() => handleTypeChange("expense")}
                className={`relative flex-1 flex items-center justify-center py-1.5 text-xs font-medium transition-colors duration-150 ${
                  type === "expense" ? "text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                {type === "expense" && (
                  <motion.div
                    layoutId="segmented-pill"
                    className="absolute inset-0 rounded-full bg-neutral-800 shadow-[0_2px_10px_rgba(0,0,0,0.6)] border border-white/15"
                    transition={appleSpring}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  Khoản Chi
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange("income")}
                className={`relative flex-1 flex items-center justify-center py-1.5 text-xs font-medium transition-colors duration-150 ${
                  type === "income" ? "text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                {type === "income" && (
                  <motion.div
                    layoutId="segmented-pill"
                    className="absolute inset-0 rounded-full bg-neutral-800 shadow-[0_2px_10px_rgba(0,0,0,0.6)] border border-white/15"
                    transition={appleSpring}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Khoản Thu
                </span>
              </button>
            </div>

            {/* 4. Massive Calculator-Style Currency Display */}
            <div className="my-3 text-center">
              <div className="flex items-baseline justify-center gap-1">
                <input
                  type="text"
                  inputMode="text"
                  autoFocus
                  value={rawAmountInput}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className={`bg-transparent text-center text-5xl font-light tracking-tight focus:outline-none transition-colors duration-200 w-full ${
                    type === "expense"
                      ? "text-red-500 placeholder-red-950/40"
                      : "text-emerald-500 placeholder-emerald-950/40"
                  }`}
                />
                <span
                  className={`text-2xl font-light shrink-0 ${
                    type === "expense" ? "text-red-500" : "text-emerald-500"
                  }`}
                >
                  ₫
                </span>
              </div>

              {/* Thông tin suy luận Quỹ tự động (Inferred Fund Badge) */}
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="text-[11px] text-neutral-400">Tự động phân bổ:</span>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${currentFundMeta.bg} ${currentFundMeta.color}`}
                >
                  {currentFundMeta.name} ({currentFundMeta.ratio})
                </span>
              </div>
            </div>

            {/* 
              RULE 2 & 5: THE GRID (DATA SWAP ONLY, NO ANIMATEPRESENCE, NO LAYOUT PROPS)
              - Tuyệt đối không dùng AnimatePresence bọc ngoài lưới
              - Lặp trực tiếp qua categories: React DOM reconciliation tự thay thế in-place
              - Font-weight luôn là font-medium, không đổi độ dày viền
            */}
            <div className="mt-4 mb-2">
              <div className="text-[11px] text-neutral-400 font-medium mb-2 px-1">
                Chọn danh mục:
              </div>

              <div className="grid grid-cols-4 gap-2 w-full">
                {categories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setSelectedSubCategoryId(null);
                      }}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-colors active:scale-95 ${
                        isSelected
                          ? "bg-white/[0.12] border-white/30 shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                          : "bg-white/[0.03] border-transparent hover:bg-white/[0.06] text-neutral-400"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition-colors ${
                          isSelected
                            ? `${cat.bgLight} ${cat.color}`
                            : "bg-neutral-800 text-neutral-300"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {/* RULE 5: Font-weight cố định font-medium, chỉ đổi màu chữ */}
                      <span
                        className={`text-[11px] font-medium tracking-tight text-center leading-tight truncate w-full transition-colors ${
                          isSelected ? "text-white" : "text-neutral-400"
                        }`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 
              RULE 4 & 5: SUB-CATEGORY DISCLOSURE
              - Chỉ animate height: 0 -> auto và opacity: 0 -> 1 với overflow-hidden
              - Không có layout prop trên các pill con
              - Dùng whileTap={{ scale: 0.95 }} để chống nhảy thanh cuộn ngang
              - font-medium cố định, không đổi border-width
            */}
            <AnimatePresence initial={false}>
              {activeCategory.subCategories.length > 0 && (
                <motion.div
                  key={`subcats-${activeCategory.id}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{
                    height: appleSpring,
                    opacity: { duration: 0.15 },
                  }}
                  className="overflow-hidden mt-1 mb-2"
                >
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1.5 px-0.5">
                    {activeCategory.subCategories.map((sub) => {
                      const isSubSelected = selectedSubCategoryId === sub.id;
                      return (
                        <motion.button
                          key={sub.id}
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            setSelectedSubCategoryId(
                              isSubSelected ? null : sub.id
                            )
                          }
                          className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            isSubSelected
                              ? "bg-white text-neutral-950 border-white shadow-sm"
                              : "bg-white/[0.06] text-neutral-300 hover:bg-white/10 border-white/5"
                          }`}
                        >
                          {sub.name}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 7. Quick Note Input */}
            <div className="my-3">
              <div className="relative flex items-center">
                <Tag className="w-4 h-4 text-neutral-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú thêm (tùy chọn)..."
                  className="w-full bg-white/[0.05] border border-white/5 focus:border-white/20 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* 8. Full-Width Ergonomic Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={isSubmitting || parsedAmount <= 0}
              onClick={handleSubmit}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 ${
                parsedAmount > 0
                  ? type === "expense"
                    ? "bg-red-500 hover:bg-red-400 text-white shadow-red-500/25"
                    : "bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-emerald-500/25"
                  : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {isSubmitting
                ? "Đang lưu..."
                : parsedAmount > 0
                ? `Xác nhận ${type === "expense" ? "chi" : "thu"} ${new Intl.NumberFormat("en-US").format(parsedAmount)} đ`
                : "Nhập số tiền để tiếp tục"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
