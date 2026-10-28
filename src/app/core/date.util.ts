// 日期工具（純函式）。
// 一律以本地時間處理：禁止 `new Date('YYYY-MM-DD')`（會被解析為 UTC，可能差一天）。

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const WEEKDAYS_ZH = ['日', '一', '二', '三', '四', '五', '六'];
const MS_PER_DAY = 86_400_000;

/** `YYYY-MM-DD` → 本地午夜的 Date；格式或日期不合法時回傳 `null` */
export function parseIsoDate(iso: string): Date | null {
  const match = ISO_DATE.exec(iso);
  if (!match) {
    return null;
  }
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  // 排除 2027-02-30 這類會被自動進位的日期
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

/** Date → 本地日期的 `YYYY-MM-DD` */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 兩個本地日期相差的天數（忽略時分秒，不受夏令時間影響） */
function diffInDays(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / MS_PER_DAY);
}

/**
 * 今天是行程的第幾天（1 起算）；不在行程期間內回傳 `null`。
 * @param today 裝置目前時間（只取本地日期部分）
 * @param startDate 行程第一天 `YYYY-MM-DD`
 * @param totalDays 行程總天數
 */
export function tripDayOf(today: Date, startDate: string, totalDays: number): number | null {
  const start = parseIsoDate(startDate);
  if (!start) {
    return null;
  }
  const day = diffInDays(start, today) + 1;
  return day >= 1 && day <= totalDays ? day : null;
}

/**
 * 從今天到 `iso` 還剩幾天（只比較本地日期）：當天為 0、已過為負數；`iso` 不合法時回傳 `null`。
 */
export function daysUntil(today: Date, iso: string): number | null {
  const target = parseIsoDate(iso);
  return target ? diffInDays(today, target) : null;
}

/** 解析網址的 `?day=N`；僅接受 1～totalDays 的整數，否則回傳 `null` */
export function parseDayParam(value: string | null | undefined, totalDays: number): number | null {
  if (!value || !/^\d+$/.test(value)) {
    return null;
  }
  const day = Number(value);
  return day >= 1 && day <= totalDays ? day : null;
}

/**
 * 決定行程頁預設顯示哪一天：
 * 1. 網址有合法的 `?day=N` → 該天
 * 2. 今天（本地日期）落在行程期間 → 對應天
 * 3. 其他 → Day 1
 */
export function resolveInitialDay(options: {
  dayParam: string | null | undefined;
  today: Date;
  startDate: string;
  totalDays: number;
}): number {
  const { dayParam, today, startDate, totalDays } = options;
  return parseDayParam(dayParam, totalDays) ?? tripDayOf(today, startDate, totalDays) ?? 1;
}

/** `2027-05-20` → `5/20（四）`；格式不合法時原樣回傳 */
export function formatShortDate(iso: string): string {
  const date = parseIsoDate(iso);
  if (!date) {
    return iso;
  }
  return `${date.getMonth() + 1}/${date.getDate()}（${WEEKDAYS_ZH[date.getDay()]}）`;
}

/** `2026-09-03` → `2026/9/3（四）`；跨年的紀錄（例如繳費日期）使用；格式不合法時原樣回傳 */
export function formatFullDate(iso: string): string {
  const date = parseIsoDate(iso);
  return date ? `${date.getFullYear()}/${formatShortDate(iso)}` : iso;
}

/** `3` → `03`，用於 `DAY 03` 這類大標題 */
export function padDay(day: number): string {
  return String(day).padStart(2, '0');
}
