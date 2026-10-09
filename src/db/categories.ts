import React from "react";
import {
  UtensilsCrossed,
  Home,
  Car,
  HeartPulse,
  TrendingUp,
  GraduationCap,
  Sparkles,
  ShoppingBag,
  Briefcase,
  Gift,
  Coins,
  Wallet,
} from "lucide-react";
import { FundId, TransactionType } from "./schema";

export interface SubCategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  fundId: FundId;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgLight: string;
  subCategories: SubCategory[];
}

// ============================================================================
// DANH MỤC KHOẢN CHI (EXPENSE) - MAPPING NGHIÊM NGẶT VÀO 3 QUỸ
// ============================================================================
export const EXPENSE_CATEGORIES: Category[] = [
  // 1. Quỹ Thiết Yếu (Essential - 50%)
  {
    id: "food",
    name: "Ăn uống",
    type: "expense",
    fundId: "essential",
    icon: UtensilsCrossed,
    color: "text-emerald-400",
    bgLight: "bg-emerald-500/10",
    subCategories: [
      { id: "lunch", name: "Cơm trưa" },
      { id: "groceries", name: "Đi chợ / Siêu thị" },
      { id: "dining_out", name: "Ăn ngoài" },
      { id: "drinks", name: "Cà phê & Đồ uống" },
    ],
  },
  {
    id: "housing",
    name: "Nhà cửa & Hóa đơn",
    type: "expense",
    fundId: "essential",
    icon: Home,
    color: "text-emerald-400",
    bgLight: "bg-emerald-500/10",
    subCategories: [
      { id: "rent", name: "Tiền thuê nhà" },
      { id: "utilities", name: "Điện nước" },
      { id: "internet", name: "Internet & Mạng" },
      { id: "home_repairs", name: "Đồ gia dụng" },
    ],
  },
  {
    id: "transport",
    name: "Đi lại",
    type: "expense",
    fundId: "essential",
    icon: Car,
    color: "text-emerald-400",
    bgLight: "bg-emerald-500/10",
    subCategories: [
      { id: "fuel", name: "Xăng xe" },
      { id: "grab_taxi", name: "Grab / Taxi" },
      { id: "maintenance", name: "Bảo dưỡng & Sửa xe" },
      { id: "parking", name: "Gửi xe & Cầu đường" },
    ],
  },
  {
    id: "healthcare",
    name: "Y tế & Sức khỏe",
    type: "expense",
    fundId: "essential",
    icon: HeartPulse,
    color: "text-emerald-400",
    bgLight: "bg-emerald-500/10",
    subCategories: [
      { id: "medicine", name: "Thuốc men" },
      { id: "clinic", name: "Khám bệnh" },
      { id: "insurance", name: "Bảo hiểm sức khỏe" },
      { id: "fitness", name: "Gym & Thể thao" },
    ],
  },

  // 2. Quỹ Đầu Tư & Tiết Kiệm (Investment - 30%)
  {
    id: "investment",
    name: "Đầu tư & Tích lũy",
    type: "expense",
    fundId: "investment",
    icon: TrendingUp,
    color: "text-amber-400",
    bgLight: "bg-amber-500/10",
    subCategories: [
      { id: "stocks", name: "Tích sản cổ phiếu" },
      { id: "savings", name: "Tiền gửi tiết kiệm" },
      { id: "gold_crypto", name: "Vàng & Tài sản số" },
      { id: "real_estate", name: "Bất động sản" },
    ],
  },
  {
    id: "education",
    name: "Phát triển bản thân",
    type: "expense",
    fundId: "investment",
    icon: GraduationCap,
    color: "text-amber-400",
    bgLight: "bg-amber-500/10",
    subCategories: [
      { id: "books", name: "Sách vở & Tài liệu" },
      { id: "courses", name: "Khóa học kỹ năng" },
      { id: "tools", name: "Công cụ phần mềm" },
      { id: "workshops", name: "Hội thảo & Sự kiện" },
    ],
  },

  // 3. Quỹ Hưởng Thụ (Lifestyle - 20%)
  {
    id: "lifestyle",
    name: "Hưởng thụ & Giải trí",
    type: "expense",
    fundId: "lifestyle",
    icon: Sparkles,
    color: "text-rose-400",
    bgLight: "bg-rose-500/10",
    subCategories: [
      { id: "cafe_hangout", name: "Cà phê bạn bè" },
      { id: "cinema_events", name: "Xem phim & Show" },
      { id: "travel", name: "Du lịch & Khách sạn" },
      { id: "party", name: "Tiệc tùng & Bar" },
    ],
  },
  {
    id: "shopping",
    name: "Mua sắm cá nhân",
    type: "expense",
    fundId: "lifestyle",
    icon: ShoppingBag,
    color: "text-rose-400",
    bgLight: "bg-rose-500/10",
    subCategories: [
      { id: "clothes", name: "Quần áo & Giày dép" },
      { id: "cosmetics", name: "Mỹ phẩm & Skincare" },
      { id: "tech_gadgets", name: "Đồ chơi công nghệ" },
      { id: "accessories", name: "Phụ kiện thời trang" },
    ],
  },
];

// ============================================================================
// DANH MỤC KHOẢN THU (INCOME)
// ============================================================================
export const INCOME_CATEGORIES: Category[] = [
  {
    id: "salary",
    name: "Lương chính",
    type: "income",
    fundId: "income",
    icon: Briefcase,
    color: "text-teal-400",
    bgLight: "bg-teal-500/10",
    subCategories: [
      { id: "monthly_salary", name: "Lương công ty" },
      { id: "overtime", name: "Tăng ca (OT)" },
    ],
  },
  {
    id: "bonus",
    name: "Thưởng & Dự án",
    type: "income",
    fundId: "income",
    icon: Gift,
    color: "text-teal-400",
    bgLight: "bg-teal-500/10",
    subCategories: [
      { id: "kpi_bonus", name: "Thưởng KPI" },
      { id: "freelance", name: "Dự án ngoài" },
      { id: "annual_bonus", name: "Thưởng tháng 13" },
    ],
  },
  {
    id: "investment_yield",
    name: "Lợi tức đầu tư",
    type: "income",
    fundId: "income",
    icon: Coins,
    color: "text-teal-400",
    bgLight: "bg-teal-500/10",
    subCategories: [
      { id: "dividends", name: "Cổ tức" },
      { id: "bank_interest", name: "Lãi tiết kiệm" },
      { id: "asset_sale", name: "Lãi chốt lời tài sản" },
    ],
  },
  {
    id: "other_income",
    name: "Thu nhập khác",
    type: "income",
    fundId: "income",
    icon: Wallet,
    color: "text-teal-400",
    bgLight: "bg-teal-500/10",
    subCategories: [
      { id: "gifts", name: "Quà biếu / Tiền lì xì" },
      { id: "secondhand", name: "Thanh lý đồ cũ" },
      { id: "cashback", name: "Hoàn tiền & Khác" },
    ],
  },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

// ============================================================================
// HELPER FUNCTIONS & MAPPING LOGIC LAYER
// ============================================================================

/**
 * Tìm Category dựa theo id
 */
export function getCategoryById(categoryId: string): Category | undefined {
  return ALL_CATEGORIES.find((c) => c.id === categoryId);
}

/**
 * Suy luận tự động FundId từ CategoryId (Zero-friction UX)
 */
export function getFundForCategory(categoryId: string): FundId {
  const cat = getCategoryById(categoryId);
  return cat ? cat.fundId : "essential";
}

/**
 * Metadata thông tin các Quỹ (50 / 30 / 20)
 */
export const FUND_METADATA: Record<
  FundId,
  { name: string; ratio: string; color: string; bg: string }
> = {
  essential: {
    name: "Thiết yếu",
    ratio: "50%",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  investment: {
    name: "Đầu tư & Tiết kiệm",
    ratio: "30%",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  lifestyle: {
    name: "Hưởng thụ",
    ratio: "20%",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
  income: {
    name: "Thu nhập",
    ratio: "100%",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
  },
};
