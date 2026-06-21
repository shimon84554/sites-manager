"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DeleteButton } from "@/components/delete-button";
import {
  SubscriptionFormModal,
  type SubscriptionData,
} from "@/components/subscriptions/subscription-form-modal";
import { formatMoney } from "@/lib/currency";
import { formatDateShort, daysLeftText } from "@/lib/utils";
import { BILLING_CYCLE, type BillingCycle, type CurrencyCode } from "@/lib/constants";
import type { Urgency } from "@/lib/renewals";

export interface SubRow extends SubscriptionData {
  siteName: string;
  clientName: string;
  nextDays: number | null;
  urgency: Urgency | null;
}

const URG: Record<Urgency, "urgent" | "warn" | "ok"> = {
  urgent: "urgent",
  warn: "warn",
  ok: "ok",
};

export function SubscriptionsList({
  subscriptions,
  sites,
  isAdmin = false,
}: {
  subscriptions: SubRow[];
  sites: { id: string; name: string }[];
  isAdmin?: boolean;
}) {
  const [q, setQ] = React.useState("");

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return subscriptions;
    return subscriptions.filter((s) =>
      `${s.serviceName} ${s.provider ?? ""} ${s.siteName} ${s.clientName}`
        .toLowerCase()
        .includes(needle)
    );
  }, [subscriptions, q]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="חיפוש לפי שירות / ספק / אתר…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pr-9"
        />
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>שירות</TableHead>
              <TableHead className="hidden md:table-cell">אתר</TableHead>
              <TableHead className="hidden lg:table-cell">ספק</TableHead>
              <TableHead>עלות</TableHead>
              <TableHead>חידוש</TableHead>
              {isAdmin && <TableHead className="text-left">פעולות</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.serviceName}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Link
                    href={`/sites/${s.siteId}`}
                    className="text-muted-foreground hover:text-primary hover:underline"
                  >
                    {s.siteName}
                  </Link>
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {s.provider || "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap tabular-nums">
                  {s.costAmount != null
                    ? `${formatMoney(s.costAmount, s.currency as CurrencyCode)} / ${
                        BILLING_CYCLE[s.billingCycle as BillingCycle]
                      }`
                    : "—"}
                </TableCell>
                <TableCell>
                  {s.nextDays != null && s.urgency ? (
                    <Badge variant={URG[s.urgency]}>
                      {daysLeftText(s.nextDays)}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <SubscriptionFormModal subscription={s} sites={sites} />
                      <DeleteButton
                        url={`/api/subscriptions/${s.id}`}
                        title={`למחוק את "${s.serviceName}"?`}
                      />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
