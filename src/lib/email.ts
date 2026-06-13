import nodemailer from "nodemailer";

// שכבת שליחת מייל עם שלוש שכבות נפילה:
//   1. Resend (אם RESEND_API_KEY מוגדר) — דרך ה-REST API, ללא תלות ב-SDK.
//   2. SMTP דרך Nodemailer (אם SMTP_HOST מוגדר).
//   3. הדפסה לקונסול — כך שפיתוח עובד מהקופסה ללא הגדרת מייל.

export interface MailMessage {
  to?: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendResult {
  ok: boolean;
  channel: "resend" | "smtp" | "console";
  error?: string;
}

function getFrom(): string {
  return process.env.EMAIL_FROM || "Sites Manager <no-reply@example.com>";
}

function getTo(explicit?: string): string {
  return explicit || process.env.EMAIL_TO || process.env.ADMIN_EMAIL || "";
}

export async function sendEmail(msg: MailMessage): Promise<SendResult> {
  const to = getTo(msg.to);
  const from = getFrom();

  // --- 1. Resend ---
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject: msg.subject,
          html: msg.html,
          text: msg.text,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Resend ${res.status}: ${body}`);
      }
      return { ok: true, channel: "resend" };
    } catch (e) {
      console.error("[email] שליחת Resend נכשלה:", e);
      return { ok: false, channel: "resend", error: String(e) };
    }
  }

  // --- 2. SMTP ---
  if (process.env.SMTP_HOST) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth:
          process.env.SMTP_USER || process.env.SMTP_PASS
            ? {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              }
            : undefined,
      });
      await transporter.sendMail({
        from,
        to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      });
      return { ok: true, channel: "smtp" };
    } catch (e) {
      console.error("[email] שליחת SMTP נכשלה:", e);
      return { ok: false, channel: "smtp", error: String(e) };
    }
  }

  // --- 3. Console fallback ---
  console.log(
    "\n========== [email] לא הוגדר ספק מייל — הדפסה בלבד ==========\n" +
      `אל: ${to}\nנושא: ${msg.subject}\n----------\n${msg.text ?? stripHtml(msg.html)}\n` +
      "============================================================\n"
  );
  return { ok: true, channel: "console" };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

/** האם מוגדר ספק מייל אמיתי (לא רק קונסול) */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST);
}

// --- תבנית מייל RTL לעברית ---
export function renderEmailLayout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;direction:rtl;text-align:right;">
  <div style="max-width:600px;margin:24px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
    <div style="background:#0f172a;color:#fff;padding:20px 24px;font-size:18px;font-weight:bold;">
      🗂️ Sites Manager
    </div>
    <div style="padding:24px;color:#18181b;font-size:15px;line-height:1.7;">
      <h2 style="margin:0 0 16px;font-size:18px;">${title}</h2>
      ${bodyHtml}
    </div>
    <div style="padding:16px 24px;background:#fafafa;color:#71717a;font-size:12px;border-top:1px solid #e4e4e7;">
      הודעה אוטומטית ממערכת Sites Manager. נשלחה כדי להזכיר לך על חידוש מתקרב.
    </div>
  </div>
</body>
</html>`;
}
