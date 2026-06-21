import Link from "next/link";
import { Users, Globe, Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClientFormModal } from "@/components/clients/client-form-modal";
import { DeleteButton } from "@/components/delete-button";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const [clients, admin] = await Promise.all([
    prisma.client.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { sites: true } } },
    }),
    isAdmin(),
  ]);

  return (
    <div>
      <PageHeader title="לקוחות" description="החברות שעבורן אתה מתחזק אתרים">
        {admin && <ClientFormModal />}
      </PageHeader>

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="אין לקוחות עדיין"
          description="הוסף את הלקוח הראשון שלך כדי לשייך אליו אתרים."
          action={admin ? <ClientFormModal /> : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <Card key={c.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold">{c.name}</h3>
                    {c.contactName && (
                      <p className="truncate text-sm text-muted-foreground">
                        {c.contactName}
                      </p>
                    )}
                  </div>
                  {admin && (
                    <div className="flex shrink-0 items-center">
                      <ClientFormModal
                        client={{
                          id: c.id,
                          name: c.name,
                          contactName: c.contactName,
                          contactEmail: c.contactEmail,
                          contactPhone: c.contactPhone,
                          notes: c.notes,
                        }}
                      />
                      <DeleteButton
                        url={`/api/clients/${c.id}`}
                        title={`למחוק את ${c.name}?`}
                        description="פעולה זו תמחק גם את כל האתרים והמנויים המשויכים ללקוח. לא ניתן לבטל."
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground">
                  {c.contactEmail && (
                    <p dir="ltr" className="flex items-center justify-end gap-2">
                      <span className="truncate">{c.contactEmail}</span>
                      <Mail className="size-4 shrink-0" />
                    </p>
                  )}
                  {c.contactPhone && (
                    <p dir="ltr" className="flex items-center justify-end gap-2">
                      <span className="truncate">{c.contactPhone}</span>
                      <Phone className="size-4 shrink-0" />
                    </p>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between border-t pt-3">
                  <Badge variant="muted">
                    <Globe className="ml-1 size-3" />
                    {c._count.sites} אתרים
                  </Badge>
                  <Link
                    href={`/sites?client=${c.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    צפייה באתרים
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
