import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { SiteForm } from "@/components/sites/site-form";

export const dynamic = "force-dynamic";

export default async function EditSitePage({
  params,
}: {
  params: { id: string };
}) {
  if (!(await isAdmin())) redirect(`/sites/${params.id}`);

  const [site, clients] = await Promise.all([
    prisma.site.findUnique({ where: { id: params.id } }),
    prisma.client.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!site) notFound();

  return (
    <div>
      <PageHeader
        title={`עריכת ${site.name}`}
        description="עדכון הפרטים התפעוליים של האתר"
      />
      <SiteForm clients={clients} site={site} />
    </div>
  );
}
