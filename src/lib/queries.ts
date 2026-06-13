import { prisma } from "./prisma";
import { computeRenewals, serializeRenewals } from "./renewals";
import { portfolioSummary } from "./stats";

// שכבת גישה לנתונים (צד שרת בלבד) — טוענת אתרים עם הקשרים ומחשבת נגזרות.

const SITE_INCLUDE = {
  client: { select: { id: true, name: true } },
  subscriptions: true,
} as const;

/** כל פריטי החידוש המאוחדים (מסודרים ל-client) */
export async function getRenewals() {
  const sites = await prisma.site.findMany({ include: SITE_INCLUDE });
  return serializeRenewals(computeRenewals(sites as any));
}

/** נתוני הדשבורד הראשי — בקריאה אחת */
export async function getDashboardData() {
  const [sites, clientCount] = await Promise.all([
    prisma.site.findMany({
      include: SITE_INCLUDE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.count(),
  ]);

  const renewals = computeRenewals(sites as any);
  const summary = portfolioSummary(sites as any);

  return {
    sites,
    clientCount,
    summary,
    renewals: serializeRenewals(renewals),
    // ספירות לפי דחיפות בחלון 30 יום
    counts: {
      total: sites.length,
      next30: renewals.filter((r) => r.daysLeft >= 0 && r.daysLeft <= 30).length,
      urgent: renewals.filter((r) => r.urgency === "urgent").length,
      overdue: renewals.filter((r) => r.daysLeft < 0).length,
    },
  };
}
