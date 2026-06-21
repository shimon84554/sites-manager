import { differenceInCalendarDays, startOfDay } from "date-fns";
import { RenewalKind } from "./constants";

// מנוע החידושים המאוחד: ממיר אתרים + מנויים לרשימת פריטי חידוש אחת,
// כולל דומיינים, אירוח, מנויים ותעודות SSL — עם דחיפות וצבע אחיד.

export type Urgency = "urgent" | "warn" | "ok";

export interface RenewalItem {
  key: string; // מזהה ייחודי לרינדור
  kind: RenewalKind;
  siteId: string;
  siteName: string;
  clientId: string;
  clientName: string;
  title: string; // למשל "דומיין example.com" / שם המנוי
  provider: string | null;
  dueDate: Date;
  daysLeft: number; // שלילי = פג תוקף
  urgency: Urgency;
  amount: number | null;
  currency: string | null;
  refType: "domain" | "hosting" | "subscription" | "ssl";
  refId: string;
}

// טיפוס קלט מינימלי (תואם ל-Prisma Site עם subscriptions)
interface SiteLike {
  id: string;
  name: string;
  clientId: string;
  client?: { id: string; name: string } | null;
  primaryDomain?: string | null;
  domainRegistrar?: string | null;
  domainCostAmount?: number | null;
  domainCurrency?: string | null;
  domainRenewalDate?: Date | string | null;
  hostingProvider?: string | null;
  hostingCostAmount?: number | null;
  hostingCostCurrency?: string | null;
  hostingRenewalDate?: Date | string | null;
  sslValidTo?: Date | string | null;
  monitorEnabled?: boolean;
  subscriptions?: SubLike[];
}

interface SubLike {
  id: string;
  serviceName: string;
  provider?: string | null;
  costAmount?: number | null;
  currency?: string | null;
  renewalDate?: Date | string | null;
}

function toDate(v: Date | string | null | undefined): Date | null {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

/** חישוב דחיפות לפי ימים שנותרו: אדום ≤7 או פג, כתום 8–30, ירוק מעבר */
export function urgencyOf(daysLeft: number): Urgency {
  if (daysLeft <= 7) return "urgent";
  if (daysLeft <= 30) return "warn";
  return "ok";
}

export function daysUntil(date: Date, from: Date = new Date()): number {
  return differenceInCalendarDays(startOfDay(date), startOfDay(from));
}

/** בניית רשימת כל פריטי החידוש מתוך מערך אתרים */
export function computeRenewals(
  sites: SiteLike[],
  now: Date = new Date()
): RenewalItem[] {
  const items: RenewalItem[] = [];

  for (const site of sites) {
    const clientName = site.client?.name ?? "—";
    const clientId = site.client?.id ?? site.clientId;

    const push = (
      partial: Omit<RenewalItem, "daysLeft" | "urgency" | "siteName" | "clientName" | "clientId" | "siteId"> & {
        dueDate: Date;
      }
    ) => {
      const daysLeft = daysUntil(partial.dueDate, now);
      items.push({
        ...partial,
        siteId: site.id,
        siteName: site.name,
        clientId,
        clientName,
        daysLeft,
        urgency: urgencyOf(daysLeft),
      });
    };

    // דומיין
    const domainDate = toDate(site.domainRenewalDate);
    if (domainDate) {
      push({
        key: `domain-${site.id}`,
        kind: "domain",
        title: `דומיין ${site.primaryDomain ?? site.name}`,
        provider: site.domainRegistrar ?? null,
        dueDate: domainDate,
        amount: site.domainCostAmount ?? null,
        currency: site.domainCurrency ?? null,
        refType: "domain",
        refId: site.id,
      });
    }

    // אירוח
    const hostingDate = toDate(site.hostingRenewalDate);
    if (hostingDate) {
      push({
        key: `hosting-${site.id}`,
        kind: "hosting",
        title: `אירוח — ${site.hostingProvider ?? site.name}`,
        provider: site.hostingProvider ?? null,
        dueDate: hostingDate,
        amount: site.hostingCostAmount ?? null,
        currency: site.hostingCostCurrency ?? null,
        refType: "hosting",
        refId: site.id,
      });
    }

    // מנויים
    for (const sub of site.subscriptions ?? []) {
      const subDate = toDate(sub.renewalDate);
      if (subDate) {
        push({
          key: `sub-${sub.id}`,
          kind: "subscription",
          title: sub.serviceName,
          provider: sub.provider ?? null,
          dueDate: subDate,
          amount: sub.costAmount ?? null,
          currency: sub.currency ?? null,
          refType: "subscription",
          refId: sub.id,
        });
      }
    }

  }

  // מיון לפי דחיפות (הקרוב/הפג ביותר ראשון)
  items.sort((a, b) => a.daysLeft - b.daysLeft);
  return items;
}

/** סינון לחלון זמן: פריטים שפגו או שנותרו להם ≤ days ימים */
export function withinWindow(items: RenewalItem[], days: number): RenewalItem[] {
  return items.filter((i) => i.daysLeft <= days);
}

// גרסה מסודרת לשליחה ל-client (תאריך כמחרוזת ISO)
export type SerializedRenewalItem = Omit<RenewalItem, "dueDate"> & {
  dueDate: string;
};

export function serializeRenewals(
  items: RenewalItem[]
): SerializedRenewalItem[] {
  return items.map((i) => ({ ...i, dueDate: i.dueDate.toISOString() }));
}
