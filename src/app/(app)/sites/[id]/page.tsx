import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Pencil,
  Server,
  Globe,
  Database,
  Wallet,
  Activity,
  CreditCard,
  KeyRound,
  CalendarClock,
  ExternalLink,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { computeRenewals, serializeRenewals } from "@/lib/renewals";
import { siteCostSummary } from "@/lib/stats";
import { formatMoney } from "@/lib/currency";
import { formatDate, formatDateShort } from "@/lib/utils";
import {
  SITE_STATUS,
  SITE_STATUS_TONE,
  BILLING_CYCLE,
  CURRENCY_SYMBOL,
  type SiteStatus,
  type BillingCycle,
  type CurrencyCode,
} from "@/lib/constants";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DetailList } from "@/components/detail-list";
import { SiteTimeline } from "@/components/sites/site-timeline";
import { DeleteButton } from "@/components/delete-button";
import { CheckButton } from "@/components/monitoring/check-button";
import { SubscriptionFormModal } from "@/components/subscriptions/subscription-form-modal";
import { CredentialFormModal } from "@/components/credentials/credential-form-modal";
import { CredentialItem } from "@/components/credentials/credential-item";

export const dynamic = "force-dynamic";

function costLabel(
  amount: number | null,
  currency: string,
  cycle: string
): string | null {
  if (amount == null) return null;
  return `${formatMoney(amount, currency as CurrencyCode)} / ${
    BILLING_CYCLE[cycle as BillingCycle] ?? cycle
  }`;
}

export default async function SitePage({
  params,
}: {
  params: { id: string };
}) {
  const site = await prisma.site.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      subscriptions: { orderBy: { renewalDate: "asc" } },
      credentials: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!site) notFound();

  const cost = siteCostSummary(site as any);
  const timeline = serializeRenewals(computeRenewals([site as any]));
  const status = site.status as SiteStatus;

  const sslTone =
    site.sslDaysLeft == null
      ? "muted"
      : site.sslDaysLeft < 14
        ? "urgent"
        : site.sslDaysLeft < 30
          ? "warn"
          : "ok";

  return (
    <div className="space-y-6">
      {/* כותרת */}
      <div>
        <Link
          href="/sites"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="size-4" />
          חזרה לאתרים
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold">{site.name}</h2>
              <Badge variant={SITE_STATUS_TONE[status]}>
                {SITE_STATUS[status]}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <Link
                href={`/clients`}
                className="hover:text-foreground hover:underline"
              >
                {site.client.name}
              </Link>
              {site.primaryDomain && (
                <a
                  href={`https://${site.primaryDomain.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  dir="ltr"
                  className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
                >
                  {site.primaryDomain}
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <CheckButton siteId={site.id} />
            <Button variant="outline" size="sm" asChild>
              <Link href={`/sites/${site.id}/edit`}>
                <Pencil className="size-4" />
                עריכה
              </Link>
            </Button>
            <DeleteButton
              url={`/api/sites/${site.id}`}
              title={`למחוק את ${site.name}?`}
              description="ימחקו גם המנויים ופרטי הגישה. לא ניתן לבטל."
              redirectTo="/sites"
              variant="outline"
              size="icon"
            />
          </div>
        </div>
        {site.notes && (
          <p className="mt-3 rounded-lg border bg-muted/30 p-3 text-sm">
            {site.notes}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* עמודה ראשית */}
        <div className="space-y-6 lg:col-span-2">
          {/* כרטיסי מידע */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
                <Server className="size-5 text-muted-foreground" />
                <CardTitle className="text-base">אירוח</CardTitle>
              </CardHeader>
              <CardContent>
                <DetailList
                  items={[
                    { label: "ספק", value: site.hostingProvider },
                    { label: "תוכנית", value: site.hostingPlan },
                    { label: "שרת / IP", value: site.serverIpOrUrl, dir: "ltr" },
                    {
                      label: "עלות",
                      value: costLabel(
                        site.hostingCostAmount,
                        site.hostingCostCurrency,
                        site.hostingBillingCycle
                      ),
                    },
                    {
                      label: "חידוש",
                      value: site.hostingRenewalDate
                        ? formatDate(site.hostingRenewalDate)
                        : null,
                    },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
                <Globe className="size-5 text-muted-foreground" />
                <CardTitle className="text-base">דומיין</CardTitle>
              </CardHeader>
              <CardContent>
                <DetailList
                  items={[
                    { label: "דומיין", value: site.primaryDomain, dir: "ltr" },
                    { label: "Registrar", value: site.domainRegistrar },
                    {
                      label: "עלות",
                      value: costLabel(
                        site.domainCostAmount,
                        site.domainCurrency,
                        site.domainBillingCycle
                      ),
                    },
                    {
                      label: "חידוש",
                      value: site.domainRenewalDate
                        ? formatDate(site.domainRenewalDate)
                        : null,
                    },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
                <Database className="size-5 text-muted-foreground" />
                <CardTitle className="text-base">סטאק טכני</CardTitle>
              </CardHeader>
              <CardContent>
                <DetailList
                  items={[
                    { label: "פלטפורמה", value: site.framework },
                    { label: "שפה", value: site.language },
                    {
                      label: "מסד נתונים",
                      value:
                        site.dbType && site.dbType !== "none"
                          ? site.dbType
                          : null,
                    },
                    { label: "הערות DB", value: site.dbHostNotes },
                    {
                      label: "Repo",
                      value: site.repoUrl ? (
                        <a
                          href={site.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          dir="ltr"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          קישור <ExternalLink className="size-3" />
                        </a>
                      ) : null,
                    },
                  ]}
                />
              </CardContent>
            </Card>

            {/* ניטור */}
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="size-5 text-muted-foreground" />
                  <CardTitle className="text-base">ניטור</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">זמינות</span>
                  {site.lastCheckAt == null ? (
                    <Badge variant="muted">טרם נבדק</Badge>
                  ) : site.lastUp ? (
                    <Badge variant="ok">
                      <CheckCircle2 className="ml-1 size-3" />
                      פעיל ({site.lastStatusCode})
                    </Badge>
                  ) : (
                    <Badge variant="urgent">
                      <XCircle className="ml-1 size-3" />
                      לא זמין
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">תוקף SSL</span>
                  {site.sslDaysLeft == null ? (
                    <Badge variant="muted">לא ידוע</Badge>
                  ) : (
                    <Badge variant={sslTone}>
                      {sslTone === "urgent" ? (
                        <ShieldAlert className="ml-1 size-3" />
                      ) : (
                        <ShieldCheck className="ml-1 size-3" />
                      )}
                      {site.sslDaysLeft} ימים
                    </Badge>
                  )}
                </div>
                {site.sslValidTo && (
                  <p className="text-xs text-muted-foreground">
                    תפוגה: {formatDateShort(site.sslValidTo)}
                    {site.sslIssuer && ` · ${site.sslIssuer}`}
                  </p>
                )}
                {site.lastCheckAt && (
                  <p className="text-xs text-muted-foreground">
                    נבדק לאחרונה: {formatDateShort(site.lastCheckAt)}
                    {site.lastResponseMs != null && ` · ${site.lastResponseMs}ms`}
                  </p>
                )}
                {!site.monitorEnabled && (
                  <p className="text-xs text-warn">הניטור מושבת לאתר זה.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* מנויים */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <CreditCard className="size-5 text-muted-foreground" />
                <CardTitle className="text-base">
                  מנויים ({site.subscriptions.length})
                </CardTitle>
              </div>
              <SubscriptionFormModal fixedSiteId={site.id} />
            </CardHeader>
            <CardContent>
              {site.subscriptions.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  אין מנויים לאתר זה. הוסף שירותים בתשלום (WhatsApp API, SMS וכו').
                </p>
              ) : (
                <div className="space-y-2">
                  {site.subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">
                            {sub.serviceName}
                          </span>
                          {sub.autoRenew && (
                            <Badge variant="muted">חידוש אוטומטי</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {sub.provider && `${sub.provider} · `}
                          {sub.costAmount != null &&
                            `${CURRENCY_SYMBOL[sub.currency as CurrencyCode]}${sub.costAmount} / ${
                              BILLING_CYCLE[sub.billingCycle as BillingCycle]
                            }`}
                          {sub.renewalDate &&
                            ` · חידוש ${formatDateShort(sub.renewalDate)}`}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center">
                        <SubscriptionFormModal
                          fixedSiteId={site.id}
                          subscription={{
                            id: sub.id,
                            siteId: sub.siteId,
                            serviceName: sub.serviceName,
                            provider: sub.provider,
                            costAmount: sub.costAmount,
                            currency: sub.currency,
                            billingCycle: sub.billingCycle,
                            renewalDate: sub.renewalDate,
                            autoRenew: sub.autoRenew,
                            notes: sub.notes,
                          }}
                        />
                        <DeleteButton
                          url={`/api/subscriptions/${sub.id}`}
                          title={`למחוק את "${sub.serviceName}"?`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* כספת פרטי גישה */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <KeyRound className="size-5 text-muted-foreground" />
                <CardTitle className="text-base">
                  פרטי גישה ({site.credentials.length})
                </CardTitle>
              </div>
              <CredentialFormModal fixedSiteId={site.id} />
            </CardHeader>
            <CardContent>
              {site.credentials.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  אין פרטי גישה שמורים. הוסף גישות FTP/SSH/פאנל — הכול מוצפן.
                </p>
              ) : (
                <div className="space-y-2">
                  {site.credentials.map((cred) => (
                    <CredentialItem
                      key={cred.id}
                      cred={{
                        id: cred.id,
                        label: cred.label,
                        type: cred.type,
                        username: cred.username,
                        url: cred.url,
                        notes: cred.notes,
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* עמודה צדדית */}
        <div className="space-y-6">
          {/* סיכום עלויות */}
          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
              <Wallet className="size-5 text-muted-foreground" />
              <CardTitle className="text-base">עלות ורווחיות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">עלות חודשית</p>
                  <p className="text-lg font-bold tabular-nums">
                    {formatMoney(cost.monthlyCost)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">הכנסה חודשית</p>
                  <p className="text-lg font-bold tabular-nums">
                    {formatMoney(cost.monthlyRevenue)}
                  </p>
                </div>
              </div>
              <div
                className={`rounded-lg p-3 ${
                  cost.monthlyProfit >= 0 ? "tint-ok" : "tint-urgent"
                }`}
              >
                <p className="text-xs text-muted-foreground">רווח חודשי</p>
                <p
                  className={`text-xl font-bold tabular-nums ${
                    cost.monthlyProfit >= 0 ? "text-ok" : "text-urgent"
                  }`}
                >
                  {formatMoney(cost.monthlyProfit)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatMoney(cost.yearlyProfit)} בשנה
                </p>
              </div>
              <DetailList
                items={[
                  { label: "אירוח (חודשי)", value: formatMoney(cost.breakdown.hosting) },
                  { label: "דומיין (חודשי)", value: formatMoney(cost.breakdown.domain) },
                  {
                    label: "מנויים (חודשי)",
                    value: formatMoney(cost.breakdown.subscriptions),
                  },
                ]}
                showEmpty
              />
            </CardContent>
          </Card>

          {/* טיימליין חידושים */}
          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
              <CalendarClock className="size-5 text-muted-foreground" />
              <CardTitle className="text-base">טיימליין חידושים</CardTitle>
            </CardHeader>
            <CardContent>
              <SiteTimeline items={timeline} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
