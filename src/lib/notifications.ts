import { prisma } from "./prisma";
import { computeRenewals, RenewalItem } from "./renewals";
import { sendEmail, renderEmailLayout, isEmailConfigured } from "./email";
import { formatDate, daysLeftText } from "./utils";
import { RENEWAL_KIND } from "./constants";
import { formatMoney } from "./currency";
import { CurrencyCode } from "./constants";

// מנוע בדיקת ההתראות — מריץ ה-cron היומי.
// לכל פריט חידוש קובע ל"דלי" סף (30/14/7/0) ושולח מייל פעם אחת לכל סף,
// תוך רישום ב-NotificationLog כדי למנוע כפילויות.

/** קריאת ספי ההתראה מ-ENV, ממוין יורד. 0 (פג תוקף) תמיד נכלל. */
export function parseThresholds(): number[] {
  const raw = process.env.REMINDER_THRESHOLDS_DAYS || "30,14,7";
  const nums = raw
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0);
  const set = new Set(nums);
  return Array.from(set).sort((a, b) => b - a); // יורד
}

/** הדלי המתאים לפריט: הסף הקטן ביותר שעדיין מכיל את daysLeft. פג=0. null=רחוק מדי. */
function bucketFor(daysLeft: number, thresholds: number[]): number | null {
  if (daysLeft < 0) return 0; // פג תוקף
  let chosen: number | null = null;
  for (const t of thresholds) {
    if (daysLeft <= t) chosen = t; // thresholds יורד → נשאר עם הקטן ביותר
  }
  return chosen;
}

export interface RenewalCheckResult {
  totalRenewals: number;
  dueNow: number;
  sent: number;
  skipped: number;
  emailConfigured: boolean;
  sentItems: { title: string; siteName: string; threshold: number; daysLeft: number }[];
}

export async function runRenewalCheck(
  opts: { dryRun?: boolean } = {}
): Promise<RenewalCheckResult> {
  const sites = await prisma.site.findMany({
    where: { status: { in: ["active", "building", "paused"] } },
    include: { subscriptions: true, client: { select: { id: true, name: true } } },
  });

  const items = computeRenewals(sites as any);
  const thresholds = parseThresholds();

  let sent = 0;
  let skipped = 0;
  let dueNow = 0;
  const sentItems: RenewalCheckResult["sentItems"] = [];

  for (const item of items) {
    const bucket = bucketFor(item.daysLeft, thresholds);
    if (bucket === null) continue; // רחוק מכדי להתריע
    dueNow++;

    // האם כבר נשלחה התראה זהה?
    const existing = await prisma.notificationLog.findUnique({
      where: {
        refType_refId_threshold_channel_dueDate: {
          refType: item.refType,
          refId: item.refId,
          threshold: bucket,
          channel: "email",
          dueDate: item.dueDate,
        },
      },
    });
    if (existing) {
      skipped++;
      continue;
    }

    const { subject, html, text } = buildRenewalEmail(item);

    if (!opts.dryRun) {
      await sendEmail({ subject, html, text });
      await prisma.notificationLog.create({
        data: {
          refType: item.refType,
          refId: item.refId,
          siteId: item.siteId,
          threshold: bucket,
          channel: "email",
          dueDate: item.dueDate,
          title: subject,
          message: text,
        },
      });
    }

    sent++;
    sentItems.push({
      title: item.title,
      siteName: item.siteName,
      threshold: bucket,
      daysLeft: item.daysLeft,
    });
  }

  return {
    totalRenewals: items.length,
    dueNow,
    sent,
    skipped,
    emailConfigured: isEmailConfigured(),
    sentItems,
  };
}

/** בניית תוכן מייל תזכורת לפריט חידוש בודד */
export function buildRenewalEmail(item: RenewalItem): {
  subject: string;
  html: string;
  text: string;
} {
  const kindLabel = RENEWAL_KIND[item.kind];
  const when = daysLeftText(item.daysLeft);
  const subject =
    item.daysLeft < 0
      ? `⚠️ פג תוקף: ${item.title} (${item.siteName})`
      : `🔔 תזכורת חידוש: ${item.title} — ${when}`;

  const cost =
    item.amount != null
      ? formatMoney(item.amount, (item.currency as CurrencyCode) || "ILS")
      : "—";

  const rows: [string, string][] = [
    ["סוג", kindLabel],
    ["אתר", item.siteName],
    ["לקוח", item.clientName],
    ["ספק", item.provider || "—"],
    ["תאריך חידוש", formatDate(item.dueDate)],
    ["סטטוס", when],
    ["עלות", cost],
  ];

  const tableHtml = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#71717a;white-space:nowrap;">${k}</td><td style="padding:6px 12px;font-weight:600;">${v}</td></tr>`
    )
    .join("");

  const body = `
    <p>החידוש הבא דורש את תשומת ליבך:</p>
    <table style="width:100%;border-collapse:collapse;background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;margin:12px 0;">
      ${tableHtml}
    </table>
    <p style="color:#71717a;font-size:13px;">היכנס למערכת כדי לטפל בחידוש או לעדכן את התאריך.</p>
  `;

  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");

  return { subject, html: renderEmailLayout(subject, body), text };
}
