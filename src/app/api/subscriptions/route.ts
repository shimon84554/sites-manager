import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth, requireAdmin, handleApi } from "@/lib/api-helpers";
import { subscriptionSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleApi(async () => {
    await requireApiAuth();
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { renewalDate: "asc" },
      include: {
        site: { select: { id: true, name: true, client: { select: { name: true } } } },
      },
    });
    return { subscriptions };
  });
}

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    await requireAdmin();
    const data = subscriptionSchema.parse(await req.json());
    const subscription = await prisma.subscription.create({ data });
    return { subscription };
  });
}
