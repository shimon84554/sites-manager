import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";

// Layout מאומת — שומר על כל עמודי הממשק (בנוסף ל-middleware).
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const isAdmin = (session.user as { role?: string }).role === "admin";

  return (
    <AppShell
      user={{ name: session.user.name, email: session.user.email }}
      isAdmin={isAdmin}
    >
      {children}
    </AppShell>
  );
}
