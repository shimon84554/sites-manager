import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth, handleApi } from "@/lib/api-helpers";
import { siteSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleApi(async () => {
    await requireApiAuth();
    const sites = await prisma.site.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true } },
        _count: { select: { subscriptions: true } },
      },
    });
    return { sites };
  });
}

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    await requireApiAuth();
    const data = siteSchema.parse(await req.json());
    const site = await prisma.site.create({ data });
    return { site };
  });
}
