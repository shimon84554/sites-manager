import {
  Mail,
  ShieldCheck,
  Clock,
  Download,
  CheckCircle2,
  XCircle,
  Bell,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isEmailConfigured } from "@/lib/email";
import { isEncryptionConfigured } from "@/lib/crypto";
import { parseThresholds } from "@/lib/notifications";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RunChecksButton } from "@/components/settings/run-checks-button";
import { formatDateShort } from "@/lib/utils";

export const dynamic = "force-dynamic";

function StatusRow({
  icon: Icon,
  label,
  ok,
  okText,
  failText,
}: {
  icon: any;
  label: string;
  ok: boolean;
  okText: string;
  failText: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-2">
        <Icon className="size-5 text-muted-foreground" />
        <span className="font-medium">{label}</span>
      </div>
      <Badge variant={ok ? "ok" : "urgent"}>
        {ok ? (
          <CheckCircle2 className="ml-1 size-3" />
        ) : (
          <XCircle className="ml-1 size-3" />
        )}
        {ok ? okText : failText}
      </Badge>
    </div>
  );
}

export default async function SettingsPage() {
  const emailOk = isEmailConfigured();
  const encOk = isEncryptionConfigured();
  const cronOk = Boolean(process.env.CRON_SECRET);
  const thresholds = parseThresholds();
  const sslWarn = Number(process.env.SSL_WARN_DAYS || 14);

  const recentLogs = await prisma.notificationLog.findMany({
    orderBy: { sentAt: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="הגדרות"
        description="מצב המערכת, התראות, גיבוי והרצת בדיקות ידנית"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* מצב המערכת */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">מצב המערכת</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            <StatusRow
              icon={Mail}
              label="שליחת מייל"
              ok={emailOk}
              okText="מוגדר"
              failText="קונסול בלבד"
            />
            <StatusRow
              icon={ShieldCheck}
              label="הצפנת כספת (AES-256)"
              ok={encOk}
              okText="מוגדר"
              failText="חסר מפתח"
            />
            <StatusRow
              icon={Clock}
              label="סוד Cron"
              ok={cronOk}
              okText="מוגדר"
              failText="חסר"
            />
            {!emailOk && (
              <p className="pt-3 text-xs text-muted-foreground">
                הגדר <code>SMTP_*</code> או <code>RESEND_API_KEY</code> ב-
                <code>.env</code> כדי לשלוח מיילים. כעת התראות מודפסות לקונסול.
              </p>
            )}
          </CardContent>
        </Card>

        {/* התראות חידוש */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">מנוע ההתראות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-1.5 text-sm text-muted-foreground">
                ימים לפני חידוש שבהם נשלחת התראה:
              </p>
              <div className="flex flex-wrap gap-2">
                {thresholds.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t} ימים
                  </Badge>
                ))}
                <Badge variant="urgent">פג תוקף</Badge>
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-sm text-muted-foreground">
                התראת SSL כשנותרו פחות מ:
              </p>
              <Badge variant="warn">{sslWarn} ימים</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              ניתן לשנות דרך <code>REMINDER_THRESHOLDS_DAYS</code> ו-
              <code>SSL_WARN_DAYS</code> ב-<code>.env</code>.
            </p>
            <div className="border-t pt-4">
              <RunChecksButton />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ייצוא / גיבוי */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">ייצוא וגיבוי</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href="/api/export?type=sites" download>
              <Download className="size-4" />
              אתרים (CSV)
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/api/export?type=subscriptions" download>
              <Download className="size-4" />
              מנויים (CSV)
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/api/export?type=clients" download>
              <Download className="size-4" />
              לקוחות (CSV)
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* יומן התראות אחרון */}
      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
          <Bell className="size-5 text-muted-foreground" />
          <CardTitle className="text-base">התראות אחרונות שנשלחו</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              עדיין לא נשלחו התראות.
            </p>
          ) : (
            <ul className="divide-y text-sm">
              {recentLogs.map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="truncate">{log.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDateShort(log.sentAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
