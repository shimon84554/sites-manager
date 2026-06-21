import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleApi } from "@/lib/api-helpers";
import { subscriptionSchema } from "@/lib/validations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApi(async () => {
    await requireAdmin();
    const data = subscriptionSchema.parse(await req.json());
    const subscription = await prisma.subscription.update({
      where: { id: params.id },
      data,
    });
    return { subscription };
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApi(async () => {
    await requireAdmin();
    await prisma.subscription.delete({ where: { id: params.id } });
    return { ok: true };
  });
}
