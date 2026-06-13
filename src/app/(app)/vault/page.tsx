import Link from "next/link";
import { KeyRound, ShieldAlert, Plus, Globe } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isEncryptionConfigured } from "@/lib/crypto";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { CredentialFormModal } from "@/components/credentials/credential-form-modal";
import { CredentialItem } from "@/components/credentials/credential-item";

export const dynamic = "force-dynamic";

export default async function VaultPage() {
  const encryptionOk = isEncryptionConfigured();

  const [credentials, sites] = await Promise.all([
    prisma.credential.findMany({
      orderBy: { createdAt: "desc" },
      include: { site: { select: { id: true, name: true } } },
    }),
    prisma.site.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="כספת סיסמאות"
        description="פרטי גישה מוצפנים (AES-256) — FTP, SSH, פאנלים ומסדי נתונים"
      >
        {sites.length > 0 && <CredentialFormModal sites={sites} />}
      </PageHeader>

      {!encryptionOk && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-urgent/30 bg-urgent/10 p-4 text-sm">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-urgent" />
          <div>
            <p className="font-semibold text-urgent">מפתח ההצפנה אינו מוגדר</p>
            <p className="text-muted-foreground">
              הגדר <code>ENCRYPTION_KEY</code> (64 תווי hex) בקובץ{" "}
              <code>.env</code> כדי לשמור ולחשוף פרטי גישה. ראה{" "}
              <code>.env.example</code>.
            </p>
          </div>
        </div>
      )}

      {sites.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="אין אתרים עדיין"
          description="פרטי גישה משויכים לאתרים. הוסף אתר תחילה."
          action={
            <Button asChild>
              <Link href="/sites/new">
                <Plus className="size-4" />
                הוספת אתר
              </Link>
            </Button>
          }
        />
      ) : credentials.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="הכספת ריקה"
          description="שמור כאן את פרטי הגישה לאתרים — הכול מוצפן ונחשף רק בלחיצה."
          action={<CredentialFormModal sites={sites} />}
        />
      ) : (
        <div className="space-y-2">
          {credentials.map((cred) => (
            <CredentialItem
              key={cred.id}
              cred={{
                id: cred.id,
                label: cred.label,
                type: cred.type,
                username: cred.username,
                url: cred.url,
                notes: cred.notes,
              }}
              siteName={cred.site.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
