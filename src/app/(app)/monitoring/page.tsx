import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Plus,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckButton } from "@/components/monitoring/check-button";
import { formatDateShort } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SSL_WARN = Number(process.env.SSL_WARN_DAYS || 14);

export default async function MonitoringPage() {
  const sites = await prisma.site.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      primaryDomain: true,
      monitorEnabled: true,
      lastCheckAt: true,
      lastStatusCode: true,
      lastUp: true,
      lastResponseMs: true,
      sslDaysLeft: true,
      sslValidTo: true,
      lastCheckError: true,
    },
  });

  if (sites.length === 0) {
    return (
      <div>
        <PageHeader title="ניטור SSL וזמינות" />
        <EmptyState
          icon={Activity}
          title="אין אתרים לניטור"
          description="הוסף אתר עם דומיין כדי לנטר זמינות ותוקף תעודת SSL."
          action={
            <Button asChild>
              <Link href="/sites/new">
                <Plus className="size-4" />
                הוספת אתר
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="ניטור SSL וזמינות"
        description={`בדיקה יומית אוטומטית. התראה כשתוקף SSL יורד מ-${SSL_WARN} ימים.`}
      >
        <CheckButton label="בדוק את כל האתרים" variant="default" />
      </PageHeader>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>אתר</TableHead>
              <TableHead>זמינות</TableHead>
              <TableHead className="hidden sm:table-cell">קוד</TableHead>
              <TableHead className="hidden md:table-cell">זמן תגובה</TableHead>
              <TableHead>תוקף SSL</TableHead>
              <TableHead className="hidden lg:table-cell">נבדק לאחרונה</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.map((s) => {
              const sslTone =
                s.sslDaysLeft == null
                  ? "muted"
                  : s.sslDaysLeft < SSL_WARN
                    ? "urgent"
                    : s.sslDaysLeft < 30
                      ? "warn"
                      : "ok";
              return (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link
                      href={`/sites/${s.id}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {s.name}
                    </Link>
                    {s.primaryDomain && (
                      <p dir="ltr" className="text-right text-xs text-muted-foreground">
                        {s.primaryDomain}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {!s.monitorEnabled ? (
                      <Badge variant="muted">מושבת</Badge>
                    ) : s.lastCheckAt == null ? (
                      <Badge variant="muted">טרם נבדק</Badge>
                    ) : s.lastUp ? (
                      <Badge variant="ok">
                        <CheckCircle2 className="ml-1 size-3" />
                        פעיל
                      </Badge>
                    ) : (
                      <Badge variant="urgent">
                        <XCircle className="ml-1 size-3" />
                        לא זמין
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden tabular-nums sm:table-cell">
                    {s.lastStatusCode ?? "—"}
                  </TableCell>
                  <TableCell className="hidden tabular-nums text-muted-foreground md:table-cell">
                    {s.lastResponseMs != null ? `${s.lastResponseMs}ms` : "—"}
                  </TableCell>
                  <TableCell>
                    {s.sslDaysLeft == null ? (
                      <span className="text-sm text-muted-foreground">—</span>
                    ) : (
                      <Badge variant={sslTone}>
                        {sslTone === "urgent" ? (
                          <ShieldAlert className="ml-1 size-3" />
                        ) : (
                          <ShieldCheck className="ml-1 size-3" />
                        )}
                        {s.sslDaysLeft} ימים
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {s.lastCheckAt ? formatDateShort(s.lastCheckAt) : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
