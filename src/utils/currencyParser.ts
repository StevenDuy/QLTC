/**
 * Tiện ích phân tích và xử lý tiền tệ tự nhiên tiếng Việt cho PWA Quản lý Chi tiêu (QLTC).
 */

/**
 * Cấu hình làm tròn thông minh đến hàng nghìn gần nhất.
 * Có thể bật/tắt tùy theo nhu cầu nghiệp vụ.
 */
export const ENABLE_ROUNDING = true;

/**
 * Phân tích chuỗi nhập ngôn ngữ tự nhiên viết tắt thành số nguyên VND.
 *
 * Quy tắc:
 * 1. 't' = * 1.000.000.000 (Tỉ), 'tr' = * 1.000.000 (Triệu).
 *    Ví dụ: "1t4" = 1.400.000.000; "1tr4" = 1.400.000.
 * 2. Nội suy mặc định hàng nghìn: Nếu chuỗi chỉ là số nguyên <= 999 không hậu tố,
 *    tự động nhân 1.000 thành hàng nghìn (ví dụ: "350" -> 350.000).
 * 3. Làm tròn thông minh: Nếu ENABLE_ROUNDING = true, làm tròn đến hàng nghìn gần nhất
 *    (ví dụ: 135398 -> 135000; 145768 -> 146000).
 *
 * @param input Chuỗi nhập liệu từ người dùng (vd: "1t4", "1tr4", "350", "14tr350k", "50k")
 * @returns Số nguyên dương tính theo đơn vị Đồng (VND)
 */
export function parseNaturalCurrency(input: string): number {
  if (!input || typeof input !== "string") {
    return 0;
  }

  // 1. Chuẩn hóa chuỗi: chữ thường, xóa khoảng trắng thừa
  const clean = input.toLowerCase().trim().replace(/\s+/g, "");

  let rawResult = 0;

  // 2. Nhận diện trường hợp Triệu: 'tr' (ưu tiên check 'tr' trước 't')
  const millionMatch = clean.match(/^(\d+(?:[.,]\d+)?)(?:tr)(.*)$/);
  if (millionMatch) {
    const rawMillion = millionMatch[1].replace(",", ".");
    const baseMillion = Math.round(parseFloat(rawMillion) * 1_000_000);
    const remainder = millionMatch[2];

    if (!remainder) {
      rawResult = baseMillion;
    } else {
      const kMatch = remainder.match(/^(\d+(?:[.,]\d+)?)(?:k)?$/);
      if (kMatch) {
        const numStr = kMatch[1].replace(",", ".");
        if (remainder.endsWith("k")) {
          const kVal = Math.round(parseFloat(numStr) * 1_000);
          rawResult = baseMillion + kVal;
        } else {
          // Đệm đủ 6 chữ số hàng triệu: "4" -> 400.000
          const paddedFraction = numStr.padEnd(6, "0").slice(0, 6);
          rawResult = baseMillion + parseInt(paddedFraction, 10);
        }
      } else {
        rawResult = baseMillion;
      }
    }
  } else {
    // 3. Nhận diện trường hợp Tỉ: 't' (* 1.000.000.000)
    const billionMatch = clean.match(/^(\d+(?:[.,]\d+)?)(?:t)(.*)$/);
    if (billionMatch) {
      const rawBillion = billionMatch[1].replace(",", ".");
      const baseBillion = Math.round(parseFloat(rawBillion) * 1_000_000_000);
      const remainder = billionMatch[2];

      if (!remainder) {
        rawResult = baseBillion;
      } else {
        // Kiểm tra nếu phần đuôi có chứa 'tr' (vd: "1t450tr")
        const trSubMatch = remainder.match(/^(\d+(?:[.,]\d+)?)(?:tr)$/);
        if (trSubMatch) {
          const trVal = Math.round(parseFloat(trSubMatch[1].replace(",", ".")) * 1_000_000);
          rawResult = baseBillion + trVal;
        } else {
          // Hoặc có 'k' (vd: "1t500k")
          const kSubMatch = remainder.match(/^(\d+(?:[.,]\d+)?)(?:k)$/);
          if (kSubMatch) {
            const kVal = Math.round(parseFloat(kSubMatch[1].replace(",", ".")) * 1_000);
            rawResult = baseBillion + kVal;
          } else {
            // Số lẻ đứng sau 't' (vd: "1t4" -> "4" hiểu là 400 triệu)
            // Đệm đủ 9 chữ số hàng tỉ: "4" -> 400.000.000
            const numOnlyMatch = remainder.match(/^(\d+(?:[.,]\d+)?)$/);
            if (numOnlyMatch) {
              const numStr = numOnlyMatch[1].replace(",", ".");
              const paddedFraction = numStr.padEnd(9, "0").slice(0, 9);
              rawResult = baseBillion + parseInt(paddedFraction, 10);
            } else {
              rawResult = baseBillion;
            }
          }
        }
      }
    } else {
      // 4. Nhận diện trường hợp chỉ có 'k' (Nghìn)
      const thousandMatch = clean.match(/^(\d+(?:[.,]\d+)?)k$/);
      if (thousandMatch) {
        const rawThousand = thousandMatch[1].replace(",", ".");
        rawResult = Math.round(parseFloat(rawThousand) * 1_000);
      } else {
        // 5. Chuỗi thuần số (không có hậu tố)
        // Quy tắc: Nếu là số nguyên <= 999, tự động nội suy là hàng nghìn (* 1.000)
        const sanitized = clean.replace(/[^\d]/g, "");
        if (sanitized) {
          const numVal = parseInt(sanitized, 10);
          if (numVal <= 999) {
            rawResult = numVal * 1_000;
          } else {
            rawResult = numVal;
          }
        } else {
          rawResult = 0;
        }
      }
    }
  }

  // 6. Làm tròn thông minh đến hàng nghìn gần nhất nếu bật cờ ENABLE_ROUNDING
  if (ENABLE_ROUNDING && rawResult > 0) {
    return Math.round(rawResult / 1_000) * 1_000;
  }

  return rawResult;
}

/**
 * Định dạng số nguyên thành chuỗi tiền tệ VND có dấu chấm ngăn cách hàng nghìn.
 * @example formatVND(14350000) => "14.350.000 ₫"
 */
export function formatVND(amount: number): string {
  if (isNaN(amount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

/* ==========================================================================
 * TEST CASES KIỂM CHỨNG:
 * ==========================================================================
 * 1. Phân biệt Tỉ và Triệu:
 *    parseNaturalCurrency("1t4")  === 1400000000  ('t'  = * 1.000.000.000)
 *    parseNaturalCurrency("1tr4") === 1400000     ('tr' = * 1.000.000)
 *
 * 2. Nội suy mặc định hàng nghìn:
 *    parseNaturalCurrency("350")  === 350000      (<= 999 -> * 1.000)
 *    parseNaturalCurrency("50")   === 50000       (<= 999 -> * 1.000)
 *
 * 3. Làm tròn thông minh (ENABLE_ROUNDING = true):
 *    parseNaturalCurrency("135398") === 135000    (làm tròn xuống hàng nghìn)
 *    parseNaturalCurrency("145768") === 146000    (làm tròn lên hàng nghìn)
 *
 * 4. Các test case kinh điển:
 *    parseNaturalCurrency("14tr350k") === 14350000
 *    parseNaturalCurrency("50k")      === 50000
 * ==========================================================================
 */
