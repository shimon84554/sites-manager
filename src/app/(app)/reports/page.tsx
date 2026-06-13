import Link from "next/link";
import {
  PieChart,
  Wallet,
  TrendingUp,
  TrendingDown,
  Download,
  Server,
  Globe,
  CreditCard,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { portfolioSummary, siteCostSummary } from "@/lib/stats";
import { formatMoney, RATES_TO_ILS } from "@/lib/currency";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const sites = await prisma.site.findMany({
    orderBy: { name: "asc" },
    include: {
      client: { select: { name: true } },
      subscriptions: true,
    },
  });

  if (sites.length === 0) {
    return (
      <div>
        <PageHeader title="עלויות ורווחיות" />
        <EmptyState
          icon={PieChart}
          title="אין נתונים להצגה"
          description="הוסף אתרים עם עלויות והכנסות כדי לראות סיכום רווחיות."
          action={
            <Button asChild>
              <Link href="/sites/new">הוספת אתר</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const total = portfolioSummary(sites as any);
  const rows = sites
    .map((s) => ({
      id: s.id,
      name: s.name,
      client: s.client.name,
      ...siteCostSummary(s as any),
    }))
    .sort((a, b) => b.monthlyProfit - a.monthlyProfit);

  return (
    <div className="space-y-6">
      <PageHeader
        title="עלויות ורווחיות"
        description="סיכום חודשי ושנתי לכל הפורטפוליו — מנורמל לשקלים (₪)"
      >
        <Button variant="outline" asChild>
          <a href="/api/export?type=sites" download>
            <Download className="size-4" />
            ייצוא CSV
          </a>
        </Button>
      </PageHeader>

      {/* כרטיסי סיכום */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="הכנסה חודשית"
          value={formatMoney(total.monthlyRevenue)}
          hint={`${formatMoney(total.yearlyRevenue)} בשנה`}
          icon={TrendingUp}
          tone="ok"
        />
        <StatCard
          label="עלות חודשית"
          value={formatMoney(total.monthlyCost)}
          hint={`${formatMoney(total.yearlyCost)} בשנה`}
          icon={Wallet}
          tone="warn"
        />
        <StatCard
          label="רווח חודשי"
          value={formatMoney(total.monthlyProfit)}
          hint={`${formatMoney(total.yearlyProfit)} בשנה`}
          icon={total.monthlyProfit >= 0 ? TrendingUp : TrendingDown}
          tone={total.monthlyProfit >= 0 ? "ok" : "urgent"}
        />
        <StatCard
          label="שולי רווח"
          value={
            total.monthlyRevenue > 0
              ? `${Math.round((total.monthlyProfit / total.monthlyRevenue) * 100)}%`
              : "—"
          }
          hint={`${sites.length} אתרים`}
          icon={PieChart}
        />
      </div>

      {/* פירוט עלויות */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">פירוט עלות חודשית</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Server className="size-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">אירוח</p>
                <p className="text-lg font-bold tabular-nums">
                  {formatMoney(total.breakdown.hosting)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Globe className="size-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">דומיינים</p>
                <p className="text-lg font-bold tabular-nums">
                  {formatMoney(total.breakdown.domain)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <CreditCard className="size-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">מנויים</p>
                <p className="text-lg font-bold tabular-nums">
                  {formatMoney(total.breakdown.subscriptions)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* טבלה לפי אתר */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">רווחיות לפי אתר</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>אתר</TableHead>
                <TableHead className="hidden sm:table-cell">לקוח</TableHead>
                <TableHead>עלות/חודש</TableHead>
                <TableHead>הכנסה/חודש</TableHead>
                <TableHead>רווח/חודש</TableHead>
                <TableHead className="hidden lg:table-cell">רווח/שנה</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link
                      href={`/sites/${r.id}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {r.name}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {r.client}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatMoney(r.monthlyCost)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatMoney(r.monthlyRevenue)}
                  </TableCell>
                  <TableCell
                    className={`font-semibold tabular-nums ${
                      r.monthlyProfit >= 0 ? "text-ok" : "text-urgent"
                    }`}
                  >
                    {formatMoney(r.monthlyProfit)}
                  </TableCell>
                  <TableCell className="hidden tabular-nums lg:table-cell">
                    {formatMoney(r.yearlyProfit)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        שערי המרה לחישוב (ניתן לעדכון ב-<code>src/lib/currency.ts</code>): 1$ ={" "}
        {RATES_TO_ILS.USD}₪ · 1€ = {RATES_TO_ILS.EUR}₪.
      </p>
    </div>
  );
}
