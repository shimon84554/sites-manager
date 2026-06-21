"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Field } from "@/components/form/field";
import { useSubmit } from "@/components/form/use-submit";

export interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export function UserFormModal({ user }: { user?: UserData }) {
  const isEdit = !!user;
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { submit, loading, errors, formError } = useSubmit();

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    role: user?.role ?? "user",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<any>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // בעריכה לא שולחים email (לא ניתן לשינוי), ולא שולחים password ריק
    const body = isEdit
      ? { name: form.name, role: form.role, password: form.password }
      : form;
    await submit(
      isEdit ? `/api/users/${user!.id}` : "/api/users",
      isEdit ? "PATCH" : "POST",
      body,
      () => {
        setOpen(false);
        setForm((f) => ({ ...f, password: "" }));
        router.refresh();
      }
    );
  }

  return (
    <>
      {isEdit ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="עריכה"
        >
          <Pencil className="size-4" />
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          משתמש חדש
        </Button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={isEdit ? "עריכת משתמש" : "משתמש חדש"}
        description={
          isEdit
            ? "עדכון שם, תפקיד או איפוס סיסמה"
            : "הוספת משתמש חדש למערכת"
        }
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="שם" error={errors.name}>
            <Input value={form.name} onChange={set("name")} autoFocus />
          </Field>

          <Field label="אימייל (להתחברות)" required error={errors.email}>
            <Input
              type="email"
              dir="ltr"
              className="text-right"
              value={form.email}
              onChange={set("email")}
              disabled={isEdit}
            />
          </Field>

          <Field
            label={isEdit ? "סיסמה חדשה (אופציונלי)" : "סיסמה"}
            required={!isEdit}
            error={errors.password}
            hint={isEdit ? "השאר ריק כדי לא לשנות. 8 תווים לפחות." : "8 תווים לפחות"}
          >
            <Input
              type="password"
              dir="ltr"
              className="text-right"
              value={form.password}
              onChange={set("password")}
              autoComplete="new-password"
            />
          </Field>

          <Field
            label="תפקיד"
            error={errors.role}
            hint="מנהל = עורך הכל ומנהל משתמשים. רגיל = צפייה בלבד."
          >
            <Select value={form.role} onChange={set("role")}>
              <option value="user">רגיל (צפייה בלבד)</option>
              <option value="admin">מנהל</option>
            </Select>
          </Field>

          {formError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}

          <div className="flex justify-start gap-2 pt-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "שמירה" : "הוספה"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              ביטול
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
