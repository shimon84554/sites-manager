"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FormSection } from "@/components/form/field";
import { useSubmit } from "@/components/form/use-submit";

export function ProfileForm({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const router = useRouter();
  const { submit, loading, errors, formError } = useSubmit();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: initialName,
    currentPassword: "",
    newPassword: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<any>) => {
    setSaved(false);
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await submit("/api/account", "PATCH", form, () => {
      setSaved(true);
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
      router.refresh();
    });
    if (!ok) setSaved(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FormSection title="פרטים אישיים">
        <Field label="אימייל (להתחברות)">
          <Input dir="ltr" className="text-right" value={email} disabled />
        </Field>
        <Field label="שם תצוגה" error={errors.name}>
          <Input value={form.name} onChange={set("name")} />
        </Field>
      </FormSection>

      <FormSection title="שינוי סיסמה (אופציונלי)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="סיסמה נוכחית" error={errors.currentPassword}>
            <Input
              type="password"
              dir="ltr"
              className="text-right"
              value={form.currentPassword}
              onChange={set("currentPassword")}
              autoComplete="current-password"
            />
          </Field>
          <Field
            label="סיסמה חדשה"
            error={errors.newPassword}
            hint="8 תווים לפחות. השאר ריק כדי לא לשנות."
          >
            <Input
              type="password"
              dir="ltr"
              className="text-right"
              value={form.newPassword}
              onChange={set("newPassword")}
              autoComplete="new-password"
            />
          </Field>
        </div>
      </FormSection>

      {formError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}
      {saved && (
        <p className="flex items-center gap-2 rounded-md bg-ok/10 px-3 py-2 text-sm text-ok">
          <CheckCircle2 className="size-4" />
          הפרטים נשמרו בהצלחה.
        </p>
      )}

      <div className="flex justify-start">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          שמירת שינויים
        </Button>
      </div>
    </form>
  );
}
