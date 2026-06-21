import Link from "next/link";
import { Globe, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { siteCostSummary } from "@/lib/stats";
import { computeRenewals } from "@/lib/renewals";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { SitesList, type SiteRow } from "@/components/sites/sites-list";
import type { SiteStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function SitesPage({
  searchParams,
}: {
  searchParams: { client?: string };
}) {
  const [sites, clients] = await Promise.all([
    prisma.site.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true } },
        subscriptions: true,
      },
    }),
    prisma.client.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const admin = await isAdmin();

  if (sites.length === 0) {
    return (
      <div>
        <PageHeader title="אתרים" description="כל האתרים שאתה מתחזק">
          {admin && (
            <Button asChild>
              <Link href="/sites/new">
                <Plus className="size-4" />
                אתר חדש
              </Link>
            </Button>
          )}
        </PageHeader>
        <EmptyState
          icon={Globe}
          title="אין אתרים עדיין"
          description="הוסף את האתר הראשון שלך ותתחיל לעקוב אחרי דומיינים, אירוח, מנויים וחידושים."
          action={
            admin ? (
              <Button asChild>
                <Link href="/sites/new">
                  <Plus className="size-4" />
                  הוספת אתר
                </Link>
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  // נתונים נגזרים לכל אתר: עלות חודשית + החידוש הקרוב ביותר
  const rows: SiteRow[] = sites.map((s) => {
    const renewals = computeRenewals([s as any]);
    const next = renewals.length > 0 ? renewals[0] : null;
    return {
      id: s.id,
      name: s.name,
      primaryDomain: s.primaryDomain,
      status: s.status as SiteStatus,
      clientId: s.clientId,
      clientName: s.client.name,
      framework: s.framework,
      dbType: s.dbType,
      hostingProvider: s.hostingProvider,
      subsCount: s.subscriptions.length,
      monthlyCost: siteCostSummary(s as any).monthlyCost,
      nextDays: next ? next.daysLeft : null,
      nextUrgency: next ? next.urgency : null,
    };
  });

  return (
    <div>
      <PageHeader title="אתרים" description="כל האתרים שאתה מתחזק">
        {admin && (
          <Button asChild>
            <Link href="/sites/new">
              <Plus className="size-4" />
              אתר חדש
            </Link>
          </Button>
        )}
      </PageHeader>

      <SitesList
        sites={rows}
        clients={clients}
        initialClient={searchParams.client ?? "all"}
        isAdmin={admin}
      />
    </div>
  );
}
