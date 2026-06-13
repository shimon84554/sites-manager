import { Globe, Server, CreditCard, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, daysLeftText } from "@/lib/utils";
import { RENEWAL_KIND } from "@/lib/constants";
import type { SerializedRenewalItem, Urgency } from "@/lib/renewals";

const KIND_ICON = {
  domain: Globe,
  hosting: Server,
  subscription: CreditCard,
  ssl: ShieldCheck,
} as const;

const DOT: Record<Urgency, string> = {
  urgent: "bg-urgent",
  warn: "bg-warn",
  ok: "bg-ok",
};

const BADGE: Record<Urgency, "urgent" | "warn" | "ok"> = {
  urgent: "urgent",
  warn: "warn",
  ok: "ok",
};

export function SiteTimeline({ items }: { items: SerializedRenewalItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        אין תאריכי חידוש מוגדרים לאתר זה.
      </p>
    );
  }

  return (
    <ol className="relative space-y-4 border-r pr-6">
      {items.map((it) => {
        const Icon = KIND_ICON[it.kind];
        return (
          <li key={it.key} className="relative">
            {/* נקודת ציר */}
            <span
              className={`absolute -right-[31px] top-1 size-3 rounded-full ring-4 ring-background ${DOT[it.urgency]}`}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                <span className="font-medium">{it.title}</span>
                <span className="text-xs text-muted-foreground">
                  {RENEWAL_KIND[it.kind]}
                </span>
              </div>
              <Badge variant={BADGE[it.urgency]}>
                {daysLeftText(it.daysLeft)}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatDate(it.dueDate)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
