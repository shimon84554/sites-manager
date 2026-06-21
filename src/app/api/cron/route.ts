import { NextRequest, NextResponse } from "next/server";
import { runRenewalCheck } from "@/lib/notifications";

// משימת ה-cron היומית — מוגנת ב-CRON_SECRET.
// מפעילה בדיקת חידושים (דומיין/אירוח/מנויים) ושליחת מיילים.
//
// הפעלה:
//   GET/POST /api/cron?secret=YOUR_SECRET
//   או עם כותרת:  Authorization: Bearer YOUR_SECRET
//
// Vercel Cron: הגדר ב-vercel.json נתיב זה; הוסף את הכותרת דרך Environment.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // ללא סוד מוגדר — חוסמים מטעמי בטיחות
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("secret");
  const auth = req.headers.get("authorization");
  const fromHeader = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const fromCustom = req.headers.get("x-cron-secret");
  return [fromQuery, fromHeader, fromCustom].includes(secret);
}

async function run(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();
  // בדיקת חידושים ושליחת מיילים
  const renewals = await runRenewalCheck();

  return NextResponse.json({ ok: true, startedAt, renewals });
}

export async function GET(req: NextRequest) {
  return run(req);
}

export async function POST(req: NextRequest) {
  return run(req);
}
