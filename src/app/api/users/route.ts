import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleApi } from "@/lib/api-helpers";
import { userCreateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleApi(async () => {
    await requireAdmin();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return { users };
  });
}

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    await requireAdmin();
    const data = userCreateSchema.parse(await req.json());

    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) {
      throw NextResponse.json(
        {
          error: "כתובת מייל זו כבר קיימת",
          issues: [{ field: "email", message: "כתובת מייל זו כבר קיימת" }],
        },
        { status: 422 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        passwordHash: await bcrypt.hash(data.password, 10),
      },
      select: { id: true, name: true, email: true, role: true },
    });
    return { user };
  });
}
