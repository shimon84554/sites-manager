import { prisma } from "./prisma";
import { checkSiteHealth } from "./ssl";

// הרצת בדיקת זמינות + SSL לאתר אחד או לכולם, ועדכון ה-DB + היסטוריה.
export async function runMonitoring(siteId?: string) {
  const sites = await prisma.site.findMany({
    where: siteId
      ? { id: siteId }
      : {
          monitorEnabled: true,
          status: { in: ["active", "building", "paused"] },
        },
    select: {
      id: true,
      name: true,
      primaryDomain: true,
      serverIpOrUrl: true,
    },
  });

  const results = [];
  for (const site of sites) {
    const health = await checkSiteHealth(site);

    await prisma.site.update({
      where: { id: site.id },
      data: {
        lastCheckAt: new Date(),
        lastStatusCode: health.statusCode,
        lastUp: health.up,
        lastResponseMs: health.responseMs,
        sslValidTo: health.sslValidTo,
        sslIssuer: health.sslIssuer,
        sslDaysLeft: health.sslDaysLeft,
        lastCheckError: health.error,
      },
    });

    await prisma.siteCheck.create({
      data: {
        siteId: site.id,
        statusCode: health.statusCode,
        up: health.up,
        responseMs: health.responseMs,
        sslValidTo: health.sslValidTo,
        sslDaysLeft: health.sslDaysLeft,
        error: health.error,
      },
    });

    results.push({ siteId: site.id, name: site.name, ...health });
  }

  return { checked: results.length, results };
}
