/**
 * סקריפט cron עצמאי (לשרת VPS / הרצה מקומית מתמשכת).
 * מפעיל את נתיב /api/cron פעם ביום בשעה 08:00.
 *
 * הרצה:  npm run cron
 *
 * חלופות:
 *  - Vercel Cron: הגדר ב-vercel.json (ראה README) — אין צורך בסקריפט זה.
 *  - cron של מערכת ההפעלה: curl יומי ל-/api/cron?secret=...
 */
import "dotenv/config";
import cron from "node-cron";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET || "";
const SCHEDULE = process.env.CRON_SCHEDULE || "0 8 * * *"; // כל יום ב-08:00

if (!CRON_SECRET) {
  console.error("✖ CRON_SECRET חסר ב-.env — לא ניתן להפעיל את ה-cron.");
  process.exit(1);
}

async function trigger() {
  const url = `${APP_URL}/api/cron`;
  const ts = new Date().toLocaleString("he-IL");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    });
    const data = await res.json();
    if (res.ok) {
      console.log(
        `✔ [${ts}] בדיקת חידושים הושלמה — נשלחו ${data?.renewals?.sent ?? 0} מיילים, ` +
          `נבדקו ${data?.monitoring?.checked ?? 0} אתרים.`
      );
    } else {
      console.error(`✖ [${ts}] הבקשה נכשלה (${res.status}):`, data);
    }
  } catch (e) {
    console.error(`✖ [${ts}] שגיאת רשת מול ${url}:`, e);
  }
}

if (!cron.validate(SCHEDULE)) {
  console.error(`✖ ביטוי cron לא תקין: "${SCHEDULE}"`);
  process.exit(1);
}

console.log(
  `⏰ Sites Manager cron פעיל. לוח זמנים: "${SCHEDULE}" (אזור זמן מקומי).\n` +
    `   יעד: ${APP_URL}/api/cron`
);

cron.schedule(SCHEDULE, trigger);

// הרצה מיידית אם מועבר הדגל --now (לבדיקה)
if (process.argv.includes("--now")) {
  console.log("מריץ בדיקה מיידית (--now)…");
  trigger();
}
