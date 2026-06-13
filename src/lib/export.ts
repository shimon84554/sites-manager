import { formatDateShort } from "./utils";
import { BILLING_CYCLE, SITE_STATUS, type BillingCycle, type SiteStatus } from "./constants";

// בניית קבצי CSV לייצוא/גיבוי. כולל BOM כדי שעברית תיפתח נכון ב-Excel.

function csvEscape(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [
    headers.map(csvEscape).join(","),
    ...rows.map((r) => r.map(csvEscape).join(",")),
  ];
  // BOM ל-UTF-8 — חשוב לפתיחה תקינה של עברית ב-Excel
  return "﻿" + lines.join("\r\n");
}

const cycle = (c: string) => BILLING_CYCLE[c as BillingCycle] ?? c;

export function sitesToCsv(sites: any[]): string {
  const headers = [
    "שם האתר",
    "לקוח",
    "דומיין",
    "סטטוס",
    "ספק אירוח",
    "תוכנית אירוח",
    "עלות אירוח",
    "מטבע אירוח",
    "מחזור אירוח",
    "חידוש אירוח",
    "Registrar",
    "עלות דומיין",
    "חידוש דומיין",
    "פלטפורמה",
    "שפה",
    "מסד נתונים",
    "Repo",
    "חיוב ללקוח",
    "מחזור חיוב",
    "תוקף SSL",
  ];
  const rows = sites.map((s) => [
    s.name,
    s.client?.name ?? "",
    s.primaryDomain ?? "",
    SITE_STATUS[s.status as SiteStatus] ?? s.status,
    s.hostingProvider ?? "",
    s.hostingPlan ?? "",
    s.hostingCostAmount ?? "",
    s.hostingCostCurrency ?? "",
    cycle(s.hostingBillingCycle),
    s.hostingRenewalDate ? formatDateShort(s.hostingRenewalDate) : "",
    s.domainRegistrar ?? "",
    s.domainCostAmount ?? "",
    s.domainRenewalDate ? formatDateShort(s.domainRenewalDate) : "",
    s.framework ?? "",
    s.language ?? "",
    s.dbType ?? "",
    s.repoUrl ?? "",
    s.clientBillingAmount ?? "",
    cycle(s.clientBillingCycle),
    s.sslValidTo ? formatDateShort(s.sslValidTo) : "",
  ]);
  return toCsv(headers, rows);
}

export function subscriptionsToCsv(subs: any[]): string {
  const headers = [
    "שירות",
    "אתר",
    "לקוח",
    "ספק",
    "עלות",
    "מטבע",
    "מחזור",
    "תאריך חידוש",
    "חידוש אוטומטי",
    "הערות",
  ];
  const rows = subs.map((s) => [
    s.serviceName,
    s.site?.name ?? "",
    s.site?.client?.name ?? "",
    s.provider ?? "",
    s.costAmount ?? "",
    s.currency ?? "",
    cycle(s.billingCycle),
    s.renewalDate ? formatDateShort(s.renewalDate) : "",
    s.autoRenew ? "כן" : "לא",
    s.notes ?? "",
  ]);
  return toCsv(headers, rows);
}

export function clientsToCsv(clients: any[]): string {
  const headers = ["שם", "איש קשר", "אימייל", "טלפון", "מספר אתרים", "הערות"];
  const rows = clients.map((c) => [
    c.name,
    c.contactName ?? "",
    c.contactEmail ?? "",
    c.contactPhone ?? "",
    c._count?.sites ?? "",
    c.notes ?? "",
  ]);
  return toCsv(headers, rows);
}
