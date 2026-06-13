"use client";

import * as React from "react";
import Link from "next/link";
import { Globe, Server, CreditCard, ShieldCheck, Search } from "lucide-react";
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
import { Select } from "@/components/ui/select";
import { formatDate, daysLeftText } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";
import { RENEWAL_KIND, CurrencyCode } from "@/lib/constants";
import type { Urgency, SerializedRenewalItem } from "@/lib/renewals";

export type SerializedRenewal = SerializedRenewalItem;

const KIND_ICON = {
  domain: Globe,
  hosting: Server,
  subscription: CreditCard,
  ssl: ShieldCheck,
} as const;

const URGENCY_BADGE: Record<Urgency, "urgent" | "warn" | "ok"> = {
  urgent: "urgent",
  warn: "warn",
  ok: "ok",
};

const ROW_BAR: Record<Urgency, string> = {
  urgent: "bar-urgent",
  warn: "bar-warn",
  ok: "bar-ok",
};

export function RenewalsTable({
  items,
  showFilters = false,
}: {
  items: SerializedRenewal[];
  showFilters?: boolean;
}) {
  const [q, setQ] = React.useState("");
  const [kind, setKind] = React.useState("all");
  const [urg, setUrg] = React.useState("all");

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((it) => {
      if (kind !== "all" && it.kind !== kind) return false;
      if (urg !== "all" && it.urgency !== urg) return false;
      if (needle) {
        const hay =
          `${it.title} ${it.siteName} ${it.clientName} ${it.provider ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [items, q, kind, urg]);

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="חיפוש לפי אתר / לקוח / ספק…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pr-9"
            />
          </div>
          <Select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="sm:w-44"
          >
            <option value="all">כל הסוגים</option>
            {Object.entries(RENEWAL_KIND).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
          <Select
            value={urg}
            onChange={(e) => setUrg(e.target.value)}
            className="sm:w-40"
          >
            <option value="all">כל הדחיפויות</option>
            <option value="urgent">דחוף</option>
            <option value="warn">בקרוב</option>
            <option value="ok">רגוע</option>
          </Select>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          לא נמצאו חידושים תואמים.
        </p>
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>סוג</TableHead>
                <TableHead>פריט</TableHead>
                <TableHead className="hidden md:table-cell">אתר</TableHead>
                <TableHead className="hidden lg:table-cell">לקוח</TableHead>
                <TableHead className="hidden lg:table-cell">ספק</TableHead>
                <TableHead>תאריך</TableHead>
                <TableHead>נותרו</TableHead>
                <TableHead className="hidden sm:table-cell">עלות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((it) => {
                const Icon = KIND_ICON[it.kind];
                return (
                  <TableRow key={it.key} className={ROW_BAR[it.urgency]}>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Icon className="size-4" />
                        <span className="hidden text-xs sm:inline">
                          {RENEWAL_KIND[it.kind]}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/sites/${it.siteId}`}
                        className="hover:text-primary hover:underline"
                      >
                        {it.title}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {it.siteName}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {it.clientName}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {it.provider || "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(it.dueDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={URGENCY_BADGE[it.urgency]}>
                        {daysLeftText(it.daysLeft)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap tabular-nums sm:table-cell">
                      {it.amount != null
                        ? formatMoney(
                            it.amount,
                            (it.currency as CurrencyCode) || "ILS"
                          )
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
