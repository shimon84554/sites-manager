"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Field } from "@/components/form/field";
import { useSubmit } from "@/components/form/use-submit";
import { CREDENTIAL_TYPE_OPTIONS } from "@/lib/constants";

export function CredentialFormModal({
  fixedSiteId,
  sites,
}: {
  fixedSiteId?: string;
  sites?: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { submit, loading, errors, formError } = useSubmit();

  const [form, setForm] = useState({
    siteId: fixedSiteId ?? sites?.[0]?.id ?? "",
    label: "",
    type: "other",
    username: "",
    url: "",
    secret: "",
    notes: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<any>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit(
      "/api/credentials",
      "POST",
      { ...form, siteId: fixedSiteId ?? form.siteId },
      () => {
        setOpen(false);
        setForm((f) => ({ ...f, label: "", username: "", url: "", secret: "", notes: "" }));
        router.refresh();
      }
    );
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        פריט גישה
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="פריט גישה חדש"
        description="הסוד יישמר מוצפן (AES-256). לעולם לא נשמר כטקסט גלוי."
      >
        <form onSubmit={onSubmit} className="space-y-4">
          {!fixedSiteId && sites && (
            <Field label="אתר" required error={errors.siteId}>
              <Select value={form.siteId} onChange={set("siteId")}>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </Field>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="תווית" required error={errors.label} hint="לדוגמה: גישת FTP ראשית">
              <Input value={form.label} onChange={set("label")} autoFocus />
            </Field>
            <Field label="סוג" error={errors.type}>
              <Select value={form.type} onChange={set("type")}>
                {CREDENTIAL_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="שם משתמש" error={errors.username}>
              <Input dir="ltr" className="text-right" value={form.username} onChange={set("username")} />
            </Field>
            <Field label="כתובת / Host" error={errors.url}>
              <Input dir="ltr" className="text-right" value={form.url} onChange={set("url")} />
            </Field>
          </div>

          <Field label="סיסמה / סוד" required error={errors.secret}>
            <Input
              type="password"
              dir="ltr"
              className="text-right"
              value={form.secret}
              onChange={set("secret")}
              autoComplete="new-password"
            />
          </Field>

          <Field label="הערות" error={errors.notes}>
            <Textarea value={form.notes} onChange={set("notes")} rows={2} />
          </Field>

          <div className="flex items-center gap-2 rounded-md bg-ok/10 px-3 py-2 text-xs text-ok">
            <ShieldCheck className="size-4 shrink-0" />
            הסוד יוצפן בשרת לפני השמירה וייחשף רק בלחיצה מפורשת.
          </div>

          {formError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}

          <div className="flex justify-start gap-2 pt-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              שמירה מוצפנת
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              ביטול
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
