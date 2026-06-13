import { NextRequest, NextResponse } from "next/server";
import { runMonitoring } from "@/lib/monitoring";
import { runRenewalCheck } from "@/lib/notifications";

// משימת ה-cron היומית — מוגנת ב-CRON_SECRET.
// מפעילה: (1) ניטור זמינות/SSL לכל האתרים, ואז (2) בדיקת חידושים ושליחת מיילים.
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
  // 1. ניטור — מרענן את נתוני ה-SSL/זמינות לפני בדיקת ההתראות
  const monitoring = await runMonitoring().catch((e) => ({
    error: String(e),
    checked: 0,
  }));
  // 2. בדיקת חידושים ושליחת מיילים
  const renewals = await runRenewalCheck();

  return NextResponse.json({ ok: true, startedAt, monitoring, renewals });
}

export async function GET(req: NextRequest) {
  return run(req);
}

export async function POST(req: NextRequest) {
  return run(req);
}
