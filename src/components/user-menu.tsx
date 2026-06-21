"use client";

import { signOut } from "next-auth/react";
import { LogOut, User as UserIcon, Settings } from "lucide-react";
import Link from "next/link";
import { Popover } from "@/components/ui/popover";
import { initials } from "@/lib/utils";

export function UserMenu({ name, email }: { name?: string | null; email?: string | null }) {
  const display = name || email || "משתמש";

  return (
    <Popover
      align="end"
      trigger={
        <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {initials(display)}
        </span>
      }
      contentClassName="w-56"
    >
      {(close) => (
        <div>
          <div className="border-b px-3 py-2.5">
            <p className="truncate text-sm font-medium">{display}</p>
            {email && (
              <p dir="ltr" className="truncate text-right text-xs text-muted-foreground">
                {email}
              </p>
            )}
          </div>
          <div className="p-1">
            <Link
              href="/profile"
              onClick={close}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <UserIcon className="size-4" />
              הפרופיל שלי
            </Link>
            <Link
              href="/settings"
              onClick={close}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <Settings className="size-4" />
              הגדרות
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              התנתקות
            </button>
          </div>
        </div>
      )}
    </Popover>
  );
}
