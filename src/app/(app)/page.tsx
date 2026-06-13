import Link from "next/link";
import {
  Globe,
  CalendarClock,
  Wallet,
  TrendingUp,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { getDashboardData } from "@/lib/queries";
import { formatMoney } from "@/lib/currency";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RenewalsTable } from "@/components/renewals/renewals-table";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { summary, counts, renewals, clientCount } = await getDashboardData();

  // אם אין אתרים בכלל — מצב ריק ידידותי
  if (counts.total === 0) {
    return (
      <EmptyState
        icon={Globe}
        title="ברוך הבא ל-Sites Manager 👋"
        description="עדיין לא הוספת אתרים. התחל בהוספת לקוח ואז אתר, וכל המידע התפעולי והחידושים יופיעו כאן."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href="/sites/new">
                <Plus className="size-4" />
                הוספת אתר ראשון
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/clients/new">הוספת לקוח</Link>
            </Button>
          </div>
        }
      />
    );
  }

  // חידושים קרובים — חלון 60 יום + פגי תוקף
  const upcoming = renewals.filter((r) => r.daysLeft <= 60);

  const profitTone = summary.monthlyProfit >= 0 ? "ok" : "urgent";

  return (
    <div className="space-y-6">
      {/* כרטיסי סיכום */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="סה״כ אתרים"
          value={counts.total}
          hint={`${clientCount} לקוחות`}
          icon={Globe}
        />
        <StatCard
          label="חידושים ב-30 הימים"
          value={counts.next30}
          hint={
            counts.overdue > 0
              ? `${counts.overdue} פגי תוקף`
              : counts.urgent > 0
                ? `${counts.urgent} דחופים`
                : "הכל תחת שליטה"
          }
          icon={CalendarClock}
          tone={counts.overdue > 0 || counts.urgent > 0 ? "urgent" : "default"}
        />
        <StatCard
          label="עלות חודשית"
          value={formatMoney(summary.monthlyCost)}
          hint={`${formatMoney(summary.yearlyCost)} בשנה`}
          icon={Wallet}
          tone="warn"
        />
        <StatCard
          label="רווח חודשי"
          value={formatMoney(summary.monthlyProfit)}
          hint={`הכנסה ${formatMoney(summary.monthlyRevenue)}`}
          icon={TrendingUp}
          tone={profitTone}
        />
      </div>

      {/* חידושים מתקרבים */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>חידושים מתקרבים</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/renewals">
              לכל החידושים
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <div className="rounded-lg border border-dashed py-10 text-center">
              <p className="text-sm text-muted-foreground">
                🎉 אין חידושים ב-60 הימים הקרובים. הכול מסודר!
              </p>
            </div>
          ) : (
            <RenewalsTable items={upcoming} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
