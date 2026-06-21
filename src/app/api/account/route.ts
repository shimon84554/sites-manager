import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireApiAuth, handleApi } from "@/lib/api-helpers";
import { profileSchema } from "@/lib/validations";

// עדכון הפרופיל האישי של המשתמש המחובר (שם + סיסמה). זמין לכל משתמש מאומת.
export async function PATCH(req: NextRequest) {
  return handleApi(async () => {
    const session = await requireApiAuth();
    const userId = (session.user as { id?: string }).id;
    const data = profileSchema.parse(await req.json());

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const update: { name?: string | null; passwordHash?: string } = {
      name: data.name,
    };

    if (data.newPassword) {
      const ok = await bcrypt.compare(
        data.currentPassword as string,
        user.passwordHash
      );
      if (!ok) {
        throw NextResponse.json(
          {
            error: "הסיסמה הנוכחית שגויה",
            issues: [
              { field: "currentPassword", message: "הסיסמה הנוכחית שגויה" },
            ],
          },
          { status: 422 }
        );
      }
      update.passwordHash = await bcrypt.hash(data.newPassword, 10);
    }

    await prisma.user.update({ where: { id: userId }, data: update });
    return { ok: true };
  });
}
