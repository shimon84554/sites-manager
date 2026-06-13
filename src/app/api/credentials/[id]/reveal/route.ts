import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth, handleApi } from "@/lib/api-helpers";
import { decrypt } from "@/lib/crypto";

export const dynamic = "force-dynamic";

// חשיפת הסוד המפוענח — רק בעקבות בקשה מפורשת (לחיצת "הצג"), עם אימות.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApi(async () => {
    await requireApiAuth();
    const cred = await prisma.credential.findUnique({
      where: { id: params.id },
      select: { secretCipher: true },
    });
    if (!cred) return { error: "לא נמצא" };
    return { secret: decrypt(cred.secretCipher) };
  });
}
