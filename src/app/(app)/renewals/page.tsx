import Link from "next/link";
import { CalendarClock, Plus } from "lucide-react";
import { getRenewals } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { RenewalsTable } from "@/components/renewals/renewals-table";

export const dynamic = "force-dynamic";

export default async function RenewalsPage() {
  const items = await getRenewals();

  return (
    <div>
      <PageHeader
        title="חידושים"
        description="כל הדומיינים, האירוח, המנויים ותעודות ה-SSL — מאוחדים וממוינים לפי דחיפות."
      />

      {items.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="אין חידושים להצגה"
          description="ברגע שתגדיר תאריכי חידוש לדומיינים, לאירוח או למנויים — הם יופיעו כאן עם התראות בצבע."
          action={
            <Button asChild>
              <Link href="/sites/new">
                <Plus className="size-4" />
                הוספת אתר
              </Link>
            </Button>
          }
        />
      ) : (
        <RenewalsTable items={items} showFilters />
      )}
    </div>
  );
}
