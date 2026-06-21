import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleApi } from "@/lib/api-helpers";
import { userUpdateSchema } from "@/lib/validations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApi(async () => {
    const session = await requireAdmin();
    const selfId = (session.user as { id?: string }).id;
    const data = userUpdateSchema.parse(await req.json());

    // מנהל לא יכול להוריד לעצמו הרשאות (כדי לא להינעל בחוץ)
    if (params.id === selfId && data.role !== "admin") {
      throw NextResponse.json(
        { error: "אי אפשר להסיר לעצמך הרשאות מנהל" },
        { status: 422 }
      );
    }

    const update: { name?: string | null; role: string; passwordHash?: string } = {
      name: data.name,
      role: data.role,
    };
    if (data.password) {
      update.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: update,
      select: { id: true, name: true, email: true, role: true },
    });
    return { user };
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApi(async () => {
    const session = await requireAdmin();
    const selfId = (session.user as { id?: string }).id;

    if (params.id === selfId) {
      throw NextResponse.json(
        { error: "אי אפשר למחוק את המשתמש שאיתו אתה מחובר" },
        { status: 422 }
      );
    }

    await prisma.user.delete({ where: { id: params.id } });
    return { ok: true };
  });
}
