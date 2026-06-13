import { NextRequest } from "next/server";
import { requireApiAuth, handleApi } from "@/lib/api-helpers";
import { runMonitoring } from "@/lib/monitoring";

// בדיקת זמינות/SSL ידנית — אתר בודד (siteId בגוף) או כל האתרים.
export async function POST(req: NextRequest) {
  return handleApi(async () => {
    await requireApiAuth();
    const body = await req.json().catch(() => ({}));
    const result = await runMonitoring(body?.siteId);
    return result;
  });
}
