import Link from "next/link";
import { CreditCard, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { daysUntil, urgencyOf } from "@/lib/renewals";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { SubscriptionFormModal } from "@/components/subscriptions/subscription-form-modal";
import {
  SubscriptionsList,
  type SubRow,
} from "@/components/subscriptions/subscriptions-list";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const [subs, sites] = await Promise.all([
    prisma.subscription.findMany({
      orderBy: { renewalDate: "asc" },
      include: {
        site: {
          select: { id: true, name: true, client: { select: { name: true } } },
        },
      },
    }),
    prisma.site.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const admin = await isAdmin();

  if (sites.length === 0) {
    return (
      <div>
        <PageHeader title="מנויים" description="שירותים בתשלום המשויכים לאתרים" />
        <EmptyState
          icon={CreditCard}
          title="אין אתרים עדיין"
          description="מנויים משויכים לאתרים. הוסף אתר תחילה."
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

  const rows: SubRow[] = subs.map((s) => {
    const days = s.renewalDate ? daysUntil(s.renewalDate) : null;
    return {
      id: s.id,
      siteId: s.siteId,
      siteName: s.site.name,
      clientName: s.site.client.name,
      serviceName: s.serviceName,
      provider: s.provider,
      costAmount: s.costAmount,
      currency: s.currency,
      billingCycle: s.billingCycle,
      renewalDate: s.renewalDate ? s.renewalDate.toISOString() : null,
      autoRenew: s.autoRenew,
      notes: s.notes,
      nextDays: days,
      urgency: days != null ? urgencyOf(days) : null,
    };
  });

  return (
    <div>
      <PageHeader
        title="מנויים"
        description="כל השירותים בתשלום — WhatsApp API, SMS, SSL בתשלום ועוד"
      >
        {admin && <SubscriptionFormModal sites={sites} />}
      </PageHeader>

      {subs.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="אין מנויים עדיין"
          description="הוסף שירות בתשלום ושייך אותו לאתר כדי לעקוב אחרי חידושים ועלויות."
          action={admin ? <SubscriptionFormModal sites={sites} /> : undefined}
        />
      ) : (
        <SubscriptionsList subscriptions={rows} sites={sites} isAdmin={admin} />
      )}
    </div>
  );
}
