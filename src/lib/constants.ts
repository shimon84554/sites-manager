// ערכי בחירה וקבצי תרגום לעברית — מקור אמת יחיד לכל הטפסים והתצוגות

export const SITE_STATUS = {
  active: "פעיל",
  building: "בבנייה",
  paused: "מושהה",
  closed: "סגור",
} as const;
export type SiteStatus = keyof typeof SITE_STATUS;

export const SITE_STATUS_OPTIONS = Object.entries(SITE_STATUS).map(
  ([value, label]) => ({ value, label })
);

// צבע לתג הסטטוס
export const SITE_STATUS_TONE: Record<SiteStatus, "ok" | "warn" | "muted" | "urgent"> = {
  active: "ok",
  building: "warn",
  paused: "muted",
  closed: "urgent",
};

export const BILLING_CYCLE = {
  monthly: "חודשי",
  quarterly: "רבעוני",
  yearly: "שנתי",
  one_time: "חד-פעמי",
} as const;
export type BillingCycle = keyof typeof BILLING_CYCLE;

export const BILLING_CYCLE_OPTIONS = Object.entries(BILLING_CYCLE).map(
  ([value, label]) => ({ value, label })
);

export const CURRENCY = {
  ILS: "₪ שקל",
  USD: "$ דולר",
  EUR: "€ אירו",
} as const;
export type CurrencyCode = keyof typeof CURRENCY;

export const CURRENCY_OPTIONS = Object.entries(CURRENCY).map(
  ([value, label]) => ({ value, label })
);

export const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  ILS: "₪",
  USD: "$",
  EUR: "€",
};

export const DB_TYPE_OPTIONS = [
  { value: "none", label: "ללא" },
  { value: "MySQL", label: "MySQL" },
  { value: "PostgreSQL", label: "PostgreSQL" },
  { value: "MongoDB", label: "MongoDB" },
  { value: "SQLite", label: "SQLite" },
  { value: "MariaDB", label: "MariaDB" },
  { value: "Redis", label: "Redis" },
  { value: "Other", label: "אחר" },
];

export const CREDENTIAL_TYPE = {
  ftp: "FTP / SFTP",
  ssh: "SSH",
  panel: "פאנל ניהול",
  db: "מסד נתונים",
  api: "מפתח API",
  other: "אחר",
} as const;
export type CredentialType = keyof typeof CREDENTIAL_TYPE;

export const CREDENTIAL_TYPE_OPTIONS = Object.entries(CREDENTIAL_TYPE).map(
  ([value, label]) => ({ value, label })
);

// סוג פריט החידוש (לטבלת החידושים המאוחדת)
export const RENEWAL_KIND = {
  domain: "דומיין",
  hosting: "אירוח",
  subscription: "מנוי",
  ssl: "תעודת SSL",
} as const;
export type RenewalKind = keyof typeof RENEWAL_KIND;
