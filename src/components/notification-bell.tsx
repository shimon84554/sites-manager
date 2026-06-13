"use client";

import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Popover } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { daysLeftText } from "@/lib/utils";
import { RENEWAL_KIND } from "@/lib/constants";
import type { Urgency } from "@/lib/renewals";

interface BellItem {
  key: string;
  siteId: string;
  title: string;
  siteName: string;
  daysLeft: number;
  urgency: Urgency;
  kind: keyof typeof RENEWAL_KIND;
}

const DOT: Record<Urgency, string> = {
  urgent: "bg-urgent",
  warn: "bg-warn",
  ok: "bg-ok",
};

export function NotificationBell() {
  const [items, setItems] = React.useState<BellItem[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    fetch("/api/renewals?window=30")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => {
        if (alive) {
          setItems(data.items ?? []);
          setLoaded(true);
        }
      })
      .catch(() => setLoaded(true));
    return () => {
      alive = false;
    };
  }, []);

  const count = items.length;

  return (
    <Popover
      align="end"
      trigger={
        <span className="relative inline-flex size-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent">
          <Bell className="size-5" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-urgent text-[10px] font-bold text-urgent-foreground">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </span>
      }
      contentClassName="w-80 p-0"
    >
      {(close) => (
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="font-semibold">התראות חידוש</span>
            <Badge variant="muted">{count}</Badge>
          </div>

          {!loaded ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              טוען…
            </p>
          ) : count === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              🎉 אין חידושים קרובים ב-30 הימים הבאים
            </p>
          ) : (
            <ul className="divide-y">
              {items.slice(0, 8).map((item) => (
                <li key={item.key}>
                  <Link
                    href={`/sites/${item.siteId}`}
                    onClick={close}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent"
                  >
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${DOT[item.urgency]}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.siteName} · {RENEWAL_KIND[item.kind]}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-semibold ${
                        item.urgency === "urgent"
                          ? "text-urgent"
                          : item.urgency === "warn"
                            ? "text-warn"
                            : "text-muted-foreground"
                      }`}
                    >
                      {daysLeftText(item.daysLeft)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t p-2">
            <Link
              href="/renewals"
              onClick={close}
              className="block rounded-md px-3 py-2 text-center text-sm font-medium text-primary hover:bg-accent"
            >
              לכל החידושים
            </Link>
          </div>
        </div>
      )}
    </Popover>
  );
}
