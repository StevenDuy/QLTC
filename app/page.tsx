"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Car,
  ChevronRight,
  Coffee,
  Home,
  MoreHorizontal,
  PiggyBank,
  Receipt,
  ShoppingBasket,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { formatVND } from "@/src/utils/currencyParser";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  allocatedAmount: number;
  icon: typeof Home;
  tone: "emerald" | "blue" | "amber";
}

interface FlexibleFund {
  id: string;
  name: string;
  spentAmount: number;
  limitAmount: number;
  icon: typeof Coffee;
  tone: "violet" | "orange" | "cyan" | "pink";
}

interface Envelope {
  id: string;
  name: string;
  totalAmount: number;
  goals: Goal[];
  categories: FlexibleFund[];
}

const envelope: Envelope = {
  id: "september-2026",
  name: "Tháng 9, 2026",
  totalAmount: 10000000,
  goals: [
    { id: "rent", name: "Tiền nhà", targetAmount: 3000000, allocatedAmount: 3000000, icon: Home, tone: "emerald" },
    { id: "savings", name: "Tiết kiệm", targetAmount: 1500000, allocatedAmount: 1500000, icon: PiggyBank, tone: "blue" },
    { id: "emergency", name: "Quỹ khẩn cấp", targetAmount: 500000, allocatedAmount: 350000, icon: Sparkles, tone: "amber" },
  ],
  categories: [
    { id: "food", name: "Ăn uống", spentAmount: 840000, limitAmount: 1500000, icon: ShoppingBasket, tone: "violet" },
    { id: "transport", name: "Đi lại", spentAmount: 320000, limitAmount: 800000, icon: Car, tone: "cyan" },
    { id: "coffee", name: "Cà phê", spentAmount: 180000, limitAmount: 500000, icon: Coffee, tone: "orange" },
    { id: "other", name: "Linh tinh", spentAmount: 250000, limitAmount: 400000, icon: MoreHorizontal, tone: "pink" },
  ],
};

const toneStyles = {
  emerald: { icon: "bg-emerald-400/15 text-emerald-300", bar: "from-emerald-300 to-emerald-500", dot: "bg-emerald-300" },
  blue: { icon: "bg-sky-400/15 text-sky-300", bar: "from-sky-300 to-blue-500", dot: "bg-sky-300" },
  amber: { icon: "bg-amber-400/15 text-amber-300", bar: "from-amber-300 to-orange-500", dot: "bg-amber-300" },
};

const fundStyles = {
  violet: { surface: "bg-violet-500/[0.09]", icon: "bg-violet-400/15 text-violet-300", bar: "bg-violet-400" },
  orange: { surface: "bg-orange-500/[0.09]", icon: "bg-orange-400/15 text-orange-300", bar: "bg-orange-400" },
  cyan: { surface: "bg-cyan-500/[0.09]", icon: "bg-cyan-400/15 text-cyan-300", bar: "bg-cyan-400" },
  pink: { surface: "bg-pink-500/[0.09]", icon: "bg-pink-400/15 text-pink-300", bar: "bg-pink-400" },
};

export default function DashboardPage() {
  const [period, setPeriod] = useState<"month" | "day">("month");
  const safeToSpend = useMemo(() => envelope.totalAmount - envelope.goals.reduce((total, goal) => total + goal.allocatedAmount, 0), []);

  return (
    <div className="flex min-h-[calc(100vh-2rem)] flex-col gap-7 pb-3">
      <header className="flex items-start justify-between pt-3">
        <div>
          <p className="mb-2 text-sm font-medium text-white/45">Chào buổi sáng, Minh</p>
          <p className="text-[2.7rem] font-semibold leading-none tracking-[-0.07em] text-white">{formatVND(safeToSpend)}</p>
          <p className="mt-3 text-xs text-white/45">Có thể chi tiêu an toàn</p>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-white/45">
            <span>Tổng tài sản {formatVND(envelope.totalAmount)}</span>
            <span className="text-white/20">•</span>
            <span>Đã khóa {formatVND(envelope.totalAmount - safeToSpend)}</span>
          </div>
        </div>
        <button className="mt-1 flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-400/20" aria-label="Thêm thu nhập">
          <ArrowDownLeft className="h-3.5 w-3.5" />
          Thu nhập
        </button>
      </header>

      <section aria-labelledby="shields-heading">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">Lá chắn tài chính</p>
            <h2 id="shields-heading" className="mt-1 text-lg font-semibold tracking-tight">Đã được bảo vệ</h2>
          </div>
          <span className="text-xs text-white/35">3 mục tiêu</span>
        </div>
        <div className="space-y-2.5">
          {envelope.goals.map((goal, index) => {
            const Icon = goal.icon;
            const progress = Math.min(100, Math.round((goal.allocatedAmount / goal.targetAmount) * 100));
            const style = toneStyles[goal.tone];
            return (
              <motion.article key={goal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="rounded-2xl border border-white/[0.07] bg-white/[0.045] p-3.5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.icon}`}><Icon className="h-[18px] w-[18px]" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-white/90">{goal.name}</p>
                      <span className="text-[11px] font-medium text-white/45">{progress}%</span>
                    </div>
                    <p className="mt-1 text-xs text-white/40">{formatVND(goal.allocatedAmount)} <span className="text-white/20">/</span> {formatVND(goal.targetAmount)}</p>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, delay: 0.15 + index * 0.08, ease: "easeOut" }} className={`h-full rounded-full bg-gradient-to-r ${style.bar}`} />
                    </div>
                  </div>
                  {progress === 100 && <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />}
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="flexible-heading">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">Khoản linh hoạt</p>
            <h2 id="flexible-heading" className="mt-1 text-lg font-semibold tracking-tight">Chi tiêu hàng ngày</h2>
          </div>
          <div className="flex rounded-full border border-white/[0.08] bg-white/[0.05] p-0.5 text-[11px]">
            {(["month", "day"] as const).map((value) => <button key={value} onClick={() => setPeriod(value)} className={`rounded-full px-2.5 py-1 transition ${period === value ? "bg-white text-neutral-950" : "text-white/40"}`}>{value === "month" ? "Tháng" : "Ngày"}</button>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {envelope.categories.map((fund, index) => {
            const Icon = fund.icon;
            const style = fundStyles[fund.tone];
            const spent = period === "day" ? Math.round(fund.spentAmount / 30) : fund.spentAmount;
            const limit = period === "day" ? Math.round(fund.limitAmount / 30) : fund.limitAmount;
            const percent = Math.min(100, Math.round((spent / limit) * 100));
            return <motion.article key={fund.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + index * 0.06 }} className={`rounded-2xl border border-white/[0.06] p-3.5 ${style.surface}`}>
              <div className="flex items-start justify-between"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${style.icon}`}><Icon className="h-4 w-4" /></div><MoreHorizontal className="h-4 w-4 text-white/25" /></div>
              <p className="mt-4 text-sm font-medium text-white/85">{fund.name}</p>
              <p className="mt-1 text-[11px] text-white/40">{formatVND(spent)} <span className="text-white/20">/</span> {formatVND(limit)}</p>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.09]"><motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.7, delay: 0.2 + index * 0.05 }} className={`h-full rounded-full ${style.bar}`} /></div>
            </motion.article>;
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4" aria-label="Tóm tắt giao dịch">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.07]"><Receipt className="h-4 w-4 text-white/60" /></div><div><p className="text-sm font-medium">Giao dịch gần đây</p><p className="mt-0.5 text-[11px] text-white/35">Hôm nay, 2 giao dịch</p></div></div><ChevronRight className="h-4 w-4 text-white/30" /></div>
        <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs"><span className="flex items-center gap-2 text-white/50"><ArrowUpRight className="h-3.5 w-3.5 text-rose-300" /> Chi tiêu hôm nay</span><span className="font-medium text-white/80">- 245.000 ₫</span></div>
      </section>

      <div className="mt-auto flex items-center justify-center gap-2 pb-2 text-[10px] text-white/20"><WalletCards className="h-3.5 w-3.5" /> Zero-based budgeting</div>
    </div>
  );
}

export type { Envelope, FlexibleFund, Goal };
