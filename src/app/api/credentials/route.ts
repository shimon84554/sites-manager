import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth, handleApi } from "@/lib/api-helpers";
import { credentialSchema } from "@/lib/validations";
import { encrypt } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    await requireApiAuth();
    const { secret, ...rest } = credentialSchema.parse(await req.json());

    // הסוד מוצפן בשרת ולעולם לא נשמר כ-plaintext
    const credential = await prisma.credential.create({
      data: { ...rest, secretCipher: encrypt(secret) },
    });

    // לא מחזירים את הסוד
    return { credential: { ...credential, secretCipher: undefined } };
  });
}
