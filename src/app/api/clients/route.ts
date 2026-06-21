import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth, requireAdmin, handleApi } from "@/lib/api-helpers";
import { clientSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleApi(async () => {
    await requireApiAuth();
    const clients = await prisma.client.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { sites: true } } },
    });
    return { clients };
  });
}

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    await requireAdmin();
    const data = clientSchema.parse(await req.json());
    const client = await prisma.client.create({ data });
    return { client };
  });
}
