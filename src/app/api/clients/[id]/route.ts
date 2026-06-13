import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth, handleApi } from "@/lib/api-helpers";
import { clientSchema } from "@/lib/validations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApi(async () => {
    await requireApiAuth();
    const data = clientSchema.parse(await req.json());
    const client = await prisma.client.update({
      where: { id: params.id },
      data,
    });
    return { client };
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApi(async () => {
    await requireApiAuth();
    // מחיקת לקוח מוחקת בקסקדה את האתרים והנתונים שלו (onDelete: Cascade)
    await prisma.client.delete({ where: { id: params.id } });
    return { ok: true };
  });
}
