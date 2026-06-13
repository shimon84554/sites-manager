import { NextRequest } from "next/server";
import { requireApiAuth, handleApi } from "@/lib/api-helpers";
import { getRenewals } from "@/lib/queries";

export const dynamic = "force-dynamic";

// רשימת החידושים המאוחדת (לפעמון ההתראות ולעמוד החידושים).
export async function GET(req: NextRequest) {
  return handleApi(async () => {
    await requireApiAuth();
    const windowParam = new URL(req.url).searchParams.get("window");
    const windowDays = windowParam ? Number(windowParam) : null;

    let items = await getRenewals();
    if (windowDays && !isNaN(windowDays)) {
      items = items.filter((i) => i.daysLeft <= windowDays);
    }
    return { items };
  });
}
