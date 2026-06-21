import Link from "next/link";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { SiteForm } from "@/components/sites/site-form";

export const dynamic = "force-dynamic";

export default async function NewSitePage() {
  if (!(await isAdmin())) redirect("/sites");

  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  if (clients.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="קודם צריך לקוח"
        description="כדי להוסיף אתר יש לשייך אותו ללקוח. הוסף לקוח תחילה."
        action={
          <Button asChild>
            <Link href="/clients">למעבר ללקוחות</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <PageHeader title="אתר חדש" description="מלא את הפרטים התפעוליים של האתר" />
      <SiteForm clients={clients} />
    </div>
  );
}
