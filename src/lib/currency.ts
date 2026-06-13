import { BillingCycle, CurrencyCode, CURRENCY_SYMBOL } from "./constants";

// המרת מטבע בסיסית + נרמול עלויות לחישוב חודשי/שנתי אחיד.
// השערים סטטיים וניתנים לעדכון כאן (אין תלות ב-API חיצוני).
// מטבע הבסיס לחישובי הסיכום הוא שקל (ILS).

export const BASE_CURRENCY: CurrencyCode = "ILS";

// כמה שקלים שווה יחידה אחת של המטבע (עדכן לפי הצורך)
export const RATES_TO_ILS: Record<CurrencyCode, number> = {
  ILS: 1,
  USD: 3.7,
  EUR: 4.0,
};

/** המרת סכום ממטבע אחד לאחר */
export function convert(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode = BASE_CURRENCY
): number {
  const inIls = amount * (RATES_TO_ILS[from] ?? 1);
  return inIls / (RATES_TO_ILS[to] ?? 1);
}

// מקדם נרמול לעלות חודשית
const MONTHLY_FACTOR: Record<BillingCycle, number> = {
  monthly: 1,
  quarterly: 1 / 3,
  yearly: 1 / 12,
  one_time: 0, // עלות חד-פעמית לא נספרת בעלות החוזרת
};

/** עלות חודשית מנורמלת בשקלים עבור פריט (amount + מטבע + מחזור חיוב) */
export function monthlyCostInBase(
  amount: number | null | undefined,
  currency: string,
  cycle: string
): number {
  if (!amount) return 0;
  const factor = MONTHLY_FACTOR[(cycle as BillingCycle)] ?? 1;
  const inIls = convert(amount, currency as CurrencyCode, BASE_CURRENCY);
  return inIls * factor;
}

/** עלות שנתית מנורמלת בשקלים */
export function yearlyCostInBase(
  amount: number | null | undefined,
  currency: string,
  cycle: string
): number {
  if (cycle === "one_time") {
    return amount ? convert(amount, currency as CurrencyCode, BASE_CURRENCY) : 0;
  }
  return monthlyCostInBase(amount, currency, cycle) * 12;
}

/** עיצוב סכום כסף לתצוגה בעברית */
export function formatMoney(
  amount: number,
  currency: CurrencyCode = BASE_CURRENCY,
  opts: { decimals?: number } = {}
): string {
  const decimals = opts.decimals ?? 0;
  const formatted = new Intl.NumberFormat("he-IL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
  return `${CURRENCY_SYMBOL[currency]}${formatted}`;
}
