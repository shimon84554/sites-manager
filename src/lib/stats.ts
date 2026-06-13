import { monthlyCostInBase, yearlyCostInBase } from "./currency";

// חישובי עלות ורווחיות — הכל מנורמל לשקלים (מטבע הבסיס) לחודש/לשנה.

interface SubLike {
  costAmount?: number | null;
  currency?: string | null;
  billingCycle?: string | null;
}

interface SiteLike {
  hostingCostAmount?: number | null;
  hostingCostCurrency?: string | null;
  hostingBillingCycle?: string | null;
  domainCostAmount?: number | null;
  domainCurrency?: string | null;
  domainBillingCycle?: string | null;
  clientBillingAmount?: number | null;
  clientBillingCurrency?: string | null;
  clientBillingCycle?: string | null;
  subscriptions?: SubLike[];
}

export interface CostSummary {
  monthlyCost: number;
  yearlyCost: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  monthlyProfit: number;
  yearlyProfit: number;
  // פירוט עלויות חודשיות
  breakdown: {
    hosting: number;
    domain: number;
    subscriptions: number;
  };
}

/** סיכום עלות/הכנסה/רווח לאתר בודד (בשקלים) */
export function siteCostSummary(site: SiteLike): CostSummary {
  const hosting = monthlyCostInBase(
    site.hostingCostAmount,
    site.hostingCostCurrency || "ILS",
    site.hostingBillingCycle || "monthly"
  );
  const domain = monthlyCostInBase(
    site.domainCostAmount,
    site.domainCurrency || "ILS",
    site.domainBillingCycle || "yearly"
  );
  const subscriptions = (site.subscriptions ?? []).reduce(
    (sum, s) =>
      sum +
      monthlyCostInBase(s.costAmount, s.currency || "ILS", s.billingCycle || "monthly"),
    0
  );

  const monthlyCost = hosting + domain + subscriptions;
  const monthlyRevenue = monthlyCostInBase(
    site.clientBillingAmount,
    site.clientBillingCurrency || "ILS",
    site.clientBillingCycle || "monthly"
  );

  // עלות שנתית מדויקת (חד-פעמיים נספרים פעם אחת)
  const yearlyCost =
    yearlyCostInBase(
      site.hostingCostAmount,
      site.hostingCostCurrency || "ILS",
      site.hostingBillingCycle || "monthly"
    ) +
    yearlyCostInBase(
      site.domainCostAmount,
      site.domainCurrency || "ILS",
      site.domainBillingCycle || "yearly"
    ) +
    (site.subscriptions ?? []).reduce(
      (sum, s) =>
        sum +
        yearlyCostInBase(s.costAmount, s.currency || "ILS", s.billingCycle || "monthly"),
      0
    );

  const yearlyRevenue = yearlyCostInBase(
    site.clientBillingAmount,
    site.clientBillingCurrency || "ILS",
    site.clientBillingCycle || "monthly"
  );

  return {
    monthlyCost,
    yearlyCost,
    monthlyRevenue,
    yearlyRevenue,
    monthlyProfit: monthlyRevenue - monthlyCost,
    yearlyProfit: yearlyRevenue - yearlyCost,
    breakdown: { hosting, domain, subscriptions },
  };
}

/** סיכום לכל הפורטפוליו */
export function portfolioSummary(sites: SiteLike[]): CostSummary & { siteCount: number } {
  const acc: CostSummary = {
    monthlyCost: 0,
    yearlyCost: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    monthlyProfit: 0,
    yearlyProfit: 0,
    breakdown: { hosting: 0, domain: 0, subscriptions: 0 },
  };

  for (const site of sites) {
    const s = siteCostSummary(site);
    acc.monthlyCost += s.monthlyCost;
    acc.yearlyCost += s.yearlyCost;
    acc.monthlyRevenue += s.monthlyRevenue;
    acc.yearlyRevenue += s.yearlyRevenue;
    acc.monthlyProfit += s.monthlyProfit;
    acc.yearlyProfit += s.yearlyProfit;
    acc.breakdown.hosting += s.breakdown.hosting;
    acc.breakdown.domain += s.breakdown.domain;
    acc.breakdown.subscriptions += s.breakdown.subscriptions;
  }

  return { ...acc, siteCount: sites.length };
}
