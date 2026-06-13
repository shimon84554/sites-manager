import tls from "tls";
import { differenceInCalendarDays, startOfDay } from "date-fns";

// ניטור זמינות (HTTP) ותוקף תעודת SSL — ללא תלות חיצונית, מודולים מובנים בלבד.

export interface HealthResult {
  statusCode: number | null;
  up: boolean;
  responseMs: number | null;
  sslValidTo: Date | null;
  sslIssuer: string | null;
  sslDaysLeft: number | null;
  error: string | null;
}

interface SiteTarget {
  primaryDomain?: string | null;
  serverIpOrUrl?: string | null;
}

/** קביעת כתובת ה-HTTP והמארח לבדיקה */
function resolveTarget(
  site: SiteTarget
): { httpUrl: string; host: string; https: boolean } | null {
  let raw = (site.primaryDomain || site.serverIpOrUrl || "").trim();
  if (!raw) return null;

  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  try {
    const u = new URL(raw);
    return {
      httpUrl: u.toString(),
      host: u.hostname,
      https: u.protocol === "https:",
    };
  } catch {
    return null;
  }
}

/** בדיקת זמינות HTTP עם timeout */
async function checkHttp(
  url: string
): Promise<{ statusCode: number | null; up: boolean; responseMs: number | null; error: string | null }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "SitesManager-Monitor/1.0" },
    });
    const responseMs = Date.now() - start;
    return {
      statusCode: res.status,
      up: res.status >= 200 && res.status < 400,
      responseMs,
      error: null,
    };
  } catch (e: any) {
    return {
      statusCode: null,
      up: false,
      responseMs: null,
      error: e?.name === "AbortError" ? "timeout" : String(e?.message || e),
    };
  } finally {
    clearTimeout(timeout);
  }
}

/** קריאת תוקף תעודת ה-SSL דרך חיבור TLS (SNI) */
function checkSsl(
  host: string,
  port = 443
): Promise<{ validTo: Date | null; issuer: string | null; error: string | null }> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (v: { validTo: Date | null; issuer: string | null; error: string | null }) => {
      if (settled) return;
      settled = true;
      try {
        socket.destroy();
      } catch {}
      resolve(v);
    };

    const socket = tls.connect(
      {
        host,
        port,
        servername: host,
        // לא דוחים תעודות לא תקפות — אנחנו רק רוצים לקרוא את התוקף
        rejectUnauthorized: false,
        timeout: 12000,
      },
      () => {
        const cert = socket.getPeerCertificate();
        if (!cert || !cert.valid_to) {
          finish({ validTo: null, issuer: null, error: "no certificate" });
          return;
        }
        const validTo = new Date(cert.valid_to);
        const issuer =
          (cert.issuer && (cert.issuer.O || cert.issuer.CN)) || null;
        finish({ validTo: isNaN(validTo.getTime()) ? null : validTo, issuer, error: null });
      }
    );

    socket.on("timeout", () => finish({ validTo: null, issuer: null, error: "ssl timeout" }));
    socket.on("error", (e) => finish({ validTo: null, issuer: null, error: String(e.message) }));
  });
}

/** בדיקה מלאה של אתר — זמינות + SSL */
export async function checkSiteHealth(site: SiteTarget): Promise<HealthResult> {
  const target = resolveTarget(site);
  if (!target) {
    return {
      statusCode: null,
      up: false,
      responseMs: null,
      sslValidTo: null,
      sslIssuer: null,
      sslDaysLeft: null,
      error: "אין דומיין / כתובת לבדיקה",
    };
  }

  const [http, ssl] = await Promise.all([
    checkHttp(target.httpUrl),
    target.https
      ? checkSsl(target.host)
      : Promise.resolve({ validTo: null, issuer: null, error: null }),
  ]);

  const sslDaysLeft = ssl.validTo
    ? differenceInCalendarDays(startOfDay(ssl.validTo), startOfDay(new Date()))
    : null;

  return {
    statusCode: http.statusCode,
    up: http.up,
    responseMs: http.responseMs,
    sslValidTo: ssl.validTo,
    sslIssuer: ssl.issuer,
    sslDaysLeft,
    error: http.error || ssl.error,
  };
}
