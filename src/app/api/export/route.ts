import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-helpers";
import { sitesToCsv, subscriptionsToCsv, clientsToCsv } from "@/lib/export";

export const dynamic = "force-dynamic";

// ייצוא נתונים ל-CSV (נפתח גם ב-Excel). type = sites | subscriptions | clients
export async function GET(req: NextRequest) {
  try {
    await requireApiAuth();
  } catch (res) {
    return res as NextResponse;
  }

  const type = new URL(req.url).searchParams.get("type") || "sites";
  let csv = "";
  let filename = "export.csv";

  if (type === "subscriptions") {
    const subs = await prisma.subscription.findMany({
      orderBy: { renewalDate: "asc" },
      include: { site: { select: { name: true, client: { select: { name: true } } } } },
    });
    csv = subscriptionsToCsv(subs);
    filename = "subscriptions.csv";
  } else if (type === "clients") {
    const clients = await prisma.client.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { sites: true } } },
    });
    csv = clientsToCsv(clients);
    filename = "clients.csv";
  } else {
    const sites = await prisma.site.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: { select: { name: true } } },
    });
    csv = sitesToCsv(sites);
    filename = "sites.csv";
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
