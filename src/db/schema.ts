import Dexie, { Table } from "dexie";

// 1. Phân loại luồng tiền & 3 Quỹ ngân sách
export type TransactionType = "expense" | "income";
export type FundId = "essential" | "investment" | "lifestyle" | "income";

// 2. Cấu trúc một bản ghi Transaction trong cơ sở dữ liệu IndexedDB
export interface Transaction {
  id?: number;                  // Khóa chính tự tăng (Auto-increment)
  amount: number;               // Số tiền nguyên dương (VNĐ)
  type: TransactionType;        // "expense" (Khoản chi) hoặc "income" (Khoản thu)
  fundId: FundId;               // Tự động suy luận từ categoryId (Zero-friction)
  categoryId: string;           // ID danh mục chính (vd: "food", "transport", "salary")
  subCategoryId?: string;       // ID danh mục con (vd: "lunch", "groceries", "fuel")
  note?: string;                // Ghi chú ngắn gọn
  timestamp: number;            // Unix epoch ms (phục vụ lọc theo tháng/ngày, sắp xếp)
}

// 3. Khởi tạo Database Class với Dexie
export class QLTCDatabase extends Dexie {
  transactions!: Table<Transaction, number>;

  constructor() {
    super("QLTC_Database");
    
    // Khai báo Schema và các trường Index cho IndexedDB
    // ++id: Auto-increment primary key
    // type, fundId, categoryId, subCategoryId, timestamp: Các trường chỉ mục truy vấn nhanh
    this.version(1).stores({
      transactions: "++id, type, fundId, categoryId, subCategoryId, timestamp",
    });
  }
}

// Singleton database instance
export const db = new QLTCDatabase();

// Helper functions tương tác với Database
export async function addTransaction(
  tx: Omit<Transaction, "id">
): Promise<number> {
  return await db.transactions.add({
    ...tx,
    timestamp: tx.timestamp || Date.now(),
  });
}

export async function deleteTransaction(id: number): Promise<void> {
  await db.transactions.delete(id);
}

export async function getAllTransactions(): Promise<Transaction[]> {
  return await db.transactions.orderBy("timestamp").reverse().toArray();
}

export async function getTransactionsByFund(fundId: FundId): Promise<Transaction[]> {
  return await db.transactions
    .where("fundId")
    .equals(fundId)
    .reverse()
    .sortBy("timestamp");
}
