import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** מיזוג חכם של מחלקות Tailwind (כמו ב-shadcn/ui) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** יצירת ראשי תיבות מתוך שם (לאווטאר) */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** עיצוב תאריך בעברית: 14 ביוני 2026 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** עיצוב תאריך קצר: 14/06/2026 */
export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/** המרת Date לערך input מסוג date (yyyy-mm-dd) */
export function toDateInputValue(
  date: Date | string | null | undefined
): string {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
}

/** טקסט ימים שנותרו בעברית */
export function daysLeftText(daysLeft: number): string {
  if (daysLeft < 0) return `פג לפני ${Math.abs(daysLeft)} ימים`;
  if (daysLeft === 0) return "פג היום";
  if (daysLeft === 1) return "מחר";
  return `בעוד ${daysLeft} ימים`;
}
