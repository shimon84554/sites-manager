"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Menu, X } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { NotificationBell } from "@/components/notification-bell";
import { UserMenu } from "@/components/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { NAV_ITEMS } from "./nav";

export function AppShell({
  user,
  isAdmin = false,
  children,
}: {
  user: { name?: string | null; email?: string | null };
  isAdmin?: boolean;
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const pathname = usePathname();

  // סגירת המגירה במעבר עמוד
  React.useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const currentLabel =
    NAV_ITEMS.find((n) =>
      n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)
    )?.label ?? "Sites Manager";

  const Brand = (
    <Link href="/" className="flex items-center gap-2.5 px-5 py-4">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <LayoutGrid className="size-5" />
      </span>
      <span className="text-lg font-bold">Sites Manager</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar קבוע — דסקטופ */}
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-64 border-l bg-card lg:block">
        <div className="border-b">{Brand}</div>
        <SidebarNav isAdmin={isAdmin} />
      </aside>

      {/* מגירה — מובייל */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 w-72 max-w-[85%] animate-fade-in border-l bg-card shadow-xl">
            <div className="flex items-center justify-between border-b">
              {Brand}
              <button
                onClick={() => setDrawerOpen(false)}
                className="ml-3 rounded-md p-2 text-muted-foreground hover:bg-accent"
                aria-label="סגור תפריט"
              >
                <X className="size-5" />
              </button>
            </div>
            <SidebarNav isAdmin={isAdmin} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* אזור התוכן */}
      <div className="lg:pr-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-md p-2 text-foreground hover:bg-accent lg:hidden"
              aria-label="פתח תפריט"
            >
              <Menu className="size-5" />
            </button>
            <h1 className="text-base font-semibold sm:text-lg">{currentLabel}</h1>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell />
            <UserMenu name={user.name} email={user.email} />
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
