import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "./auth";

// עוזרי API משותפים — אימות, טיפול בשגיאות ותגובות אחידות.

/** דורש סשן מאומת. מחזיר את הסשן או זורק תגובת 401. */
export async function requireApiAuth() {
  const session = await auth();
  if (!session?.user) {
    throw NextResponse.json({ error: "לא מורשה" }, { status: 401 });
  }
  return session;
}

/** עוטף handler של API בטיפול שגיאות אחיד (Zod / 401 / כללי). */
export async function handleApi<T>(
  fn: () => Promise<T>
): Promise<NextResponse> {
  try {
    const data = await fn();
    return NextResponse.json(data ?? { ok: true });
  } catch (err) {
    // תגובת 401 שנזרקה מ-requireApiAuth
    if (err instanceof NextResponse) return err;

    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          error: "שגיאת ולידציה",
          issues: err.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 422 }
      );
    }

    console.error("[api] שגיאה לא צפויה:", err);
    return NextResponse.json(
      { error: "שגיאת שרת פנימית" },
      { status: 500 }
    );
  }
}
