import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth, handleApi } from "@/lib/api-helpers";
import { siteSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApi(async () => {
    await requireApiAuth();
    const site = await prisma.site.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        subscriptions: { orderBy: { renewalDate: "asc" } },
        credentials: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!site) {
      return { error: "אתר לא נמצא" };
    }
    return { site };
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApi(async () => {
    await requireApiAuth();
    const data = siteSchema.parse(await req.json());
    const site = await prisma.site.update({
      where: { id: params.id },
      data,
    });
    return { site };
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApi(async () => {
    await requireApiAuth();
    await prisma.site.delete({ where: { id: params.id } });
    return { ok: true };
  });
}
