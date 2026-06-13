"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Field } from "@/components/form/field";
import { useSubmit } from "@/components/form/use-submit";

export interface ClientData {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string | null;
}

export function ClientFormModal({ client }: { client?: ClientData }) {
  const isEdit = !!client;
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { submit, loading, errors, formError } = useSubmit();

  const [form, setForm] = useState({
    name: client?.name ?? "",
    contactName: client?.contactName ?? "",
    contactEmail: client?.contactEmail ?? "",
    contactPhone: client?.contactPhone ?? "",
    notes: client?.notes ?? "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<any>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await submit(
      isEdit ? `/api/clients/${client!.id}` : "/api/clients",
      isEdit ? "PATCH" : "POST",
      form,
      () => {
        setOpen(false);
        router.refresh();
      }
    );
    return ok;
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
          לקוח חדש
        </Button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={isEdit ? "עריכת לקוח" : "לקוח חדש"}
        description="פרטי החברה ואיש הקשר"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="שם הלקוח / חברה" required error={errors.name}>
            <Input value={form.name} onChange={set("name")} autoFocus />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="איש קשר" error={errors.contactName}>
              <Input value={form.contactName} onChange={set("contactName")} />
            </Field>
            <Field label="טלפון" error={errors.contactPhone}>
              <Input
                dir="ltr"
                className="text-right"
                value={form.contactPhone}
                onChange={set("contactPhone")}
              />
            </Field>
          </div>

          <Field label="אימייל" error={errors.contactEmail}>
            <Input
              type="email"
              dir="ltr"
              className="text-right"
              value={form.contactEmail}
              onChange={set("contactEmail")}
            />
          </Field>

          <Field label="הערות" error={errors.notes}>
            <Textarea value={form.notes} onChange={set("notes")} rows={3} />
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
