import { handleApi, requireApiAuth } from "@/lib/api-helpers";
import { runMonitoring } from "@/lib/monitoring";
import { runRenewalCheck } from "@/lib/notifications";

// הרצה ידנית של הבדיקות מתוך הממשק (מאומת בסשן, לא דורש CRON_SECRET).
export async function POST() {
  return handleApi(async () => {
    await requireApiAuth();
    const monitoring = await runMonitoring().catch((e) => ({
      checked: 0,
      error: String(e),
    }));
    const renewals = await runRenewalCheck();
    return { ok: true, monitoring, renewals };
  });
}
