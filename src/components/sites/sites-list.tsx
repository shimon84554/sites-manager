"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Pencil } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/delete-button";
import { formatMoney } from "@/lib/currency";
import { daysLeftText } from "@/lib/utils";
import {
  SITE_STATUS,
  SITE_STATUS_TONE,
  SITE_STATUS_OPTIONS,
  type SiteStatus,
} from "@/lib/constants";
import type { Urgency } from "@/lib/renewals";

export interface SiteRow {
  id: string;
  name: string;
  primaryDomain: string | null;
  status: SiteStatus;
  clientId: string;
  clientName: string;
  framework: string | null;
  dbType: string | null;
  hostingProvider: string | null;
  subsCount: number;
  monthlyCost: number;
  nextDays: number | null;
  nextUrgency: Urgency | null;
}

const URG_BADGE: Record<Urgency, "urgent" | "warn" | "ok"> = {
  urgent: "urgent",
  warn: "warn",
  ok: "ok",
};

export function SitesList({
  sites,
  clients,
  initialClient = "all",
  isAdmin = false,
}: {
  sites: SiteRow[];
  clients: { id: string; name: string }[];
  initialClient?: string;
  isAdmin?: boolean;
}) {
  const [q, setQ] = React.useState("");
  const [client, setClient] = React.useState(initialClient);
  const [status, setStatus] = React.useState("all");

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sites.filter((s) => {
      if (client !== "all" && s.clientId !== client) return false;
      if (status !== "all" && s.status !== status) return false;
      if (needle) {
        const hay =
          `${s.name} ${s.primaryDomain ?? ""} ${s.clientName} ${s.framework ?? ""} ${s.dbType ?? ""} ${s.hostingProvider ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [sites, q, client, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="חיפוש לפי שם / דומיין / ספק / סטאק…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pr-9"
          />
        </div>
        <Select
          value={client}
          onChange={(e) => setClient(e.target.value)}
          className="lg:w-52"
        >
          <option value="all">כל הלקוחות</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="lg:w-40"
        >
          <option value="all">כל הסטטוסים</option>
          {SITE_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        {filtered.length} אתרים
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          לא נמצאו אתרים תואמים.
        </p>
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>אתר</TableHead>
                <TableHead className="hidden md:table-cell">לקוח</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead className="hidden lg:table-cell">סטאק</TableHead>
                <TableHead className="hidden xl:table-cell">אירוח</TableHead>
                <TableHead>חידוש קרוב</TableHead>
                <TableHead className="hidden sm:table-cell">עלות/חודש</TableHead>
                {isAdmin && <TableHead className="text-left">פעולות</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
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
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {s.clientName}
                  </TableCell>
                  <TableCell>
                    <Badge variant={SITE_STATUS_TONE[s.status]}>
                      {SITE_STATUS[s.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {s.framework || "—"}
                    {s.dbType && s.dbType !== "none" && (
                      <span className="text-xs"> · {s.dbType}</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                    {s.hostingProvider || "—"}
                  </TableCell>
                  <TableCell>
                    {s.nextDays != null && s.nextUrgency ? (
                      <Badge variant={URG_BADGE[s.nextUrgency]}>
                        {daysLeftText(s.nextDays)}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap tabular-nums sm:table-cell">
                    {formatMoney(s.monthlyCost)}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex items-center justify-end">
                        <Button variant="ghost" size="icon" asChild aria-label="עריכה">
                          <Link href={`/sites/${s.id}/edit`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <DeleteButton
                          url={`/api/sites/${s.id}`}
                          title={`למחוק את ${s.name}?`}
                          description="ימחקו גם המנויים של האתר. לא ניתן לבטל."
                        />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
