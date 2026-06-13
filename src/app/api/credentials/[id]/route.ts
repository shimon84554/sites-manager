import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth, handleApi } from "@/lib/api-helpers";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApi(async () => {
    await requireApiAuth();
    await prisma.credential.delete({ where: { id: params.id } });
    return { ok: true };
  });
}
