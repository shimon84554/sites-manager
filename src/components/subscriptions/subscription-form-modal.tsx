"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Modal } from "@/components/ui/modal";
import { Field } from "@/components/form/field";
import { useSubmit } from "@/components/form/use-submit";
import { toDateInputValue } from "@/lib/utils";
import { CURRENCY_OPTIONS, BILLING_CYCLE_OPTIONS } from "@/lib/constants";

export interface SubscriptionData {
  id: string;
  siteId: string;
  serviceName: string;
  provider: string | null;
  costAmount: number | null;
  currency: string;
  billingCycle: string;
  renewalDate: string | Date | null;
  autoRenew: boolean;
  notes: string | null;
}

export function SubscriptionFormModal({
  subscription,
  sites,
  fixedSiteId,
  variant = "default",
}: {
  subscription?: SubscriptionData;
  sites?: { id: string; name: string }[];
  fixedSiteId?: string;
  variant?: "default" | "outline";
}) {
  const isEdit = !!subscription;
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { submit, loading, errors, formError } = useSubmit();

  const [form, setForm] = useState({
    siteId: subscription?.siteId ?? fixedSiteId ?? sites?.[0]?.id ?? "",
    serviceName: subscription?.serviceName ?? "",
    provider: subscription?.provider ?? "",
    costAmount: subscription?.costAmount?.toString() ?? "",
    currency: subscription?.currency ?? "ILS",
    billingCycle: subscription?.billingCycle ?? "monthly",
    renewalDate: toDateInputValue(subscription?.renewalDate),
    autoRenew: subscription?.autoRenew ?? false,
    notes: subscription?.notes ?? "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<any>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit(
      isEdit ? `/api/subscriptions/${subscription!.id}` : "/api/subscriptions",
      isEdit ? "PATCH" : "POST",
      { ...form, siteId: fixedSiteId ?? form.siteId },
      () => {
        setOpen(false);
        router.refresh();
      }
    );
  }

  return (
    <>
      {isEdit ? (
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="עריכה">
          <Pencil className="size-4" />
        </Button>
      ) : (
        <Button variant={variant} size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          מנוי חדש
        </Button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={isEdit ? "עריכת מנוי" : "מנוי חדש"}
        description="שירות בתשלום המשויך לאתר (WhatsApp API, SMS, SSL בתשלום וכו')"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          {!fixedSiteId && sites && (
            <Field label="אתר" required error={errors.siteId}>
              <Select value={form.siteId} onChange={set("siteId")}>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="שם השירות" required error={errors.serviceName}>
              <Input value={form.serviceName} onChange={set("serviceName")} autoFocus />
            </Field>
            <Field label="ספק" error={errors.provider}>
              <Input value={form.provider} onChange={set("provider")} />
            </Field>
            <Field label="עלות" error={errors.costAmount}>
              <Input
                type="number"
                step="0.01"
                dir="ltr"
                className="text-right"
                value={form.costAmount}
                onChange={set("costAmount")}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="מטבע">
                <Select value={form.currency} onChange={set("currency")}>
                  {CURRENCY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="מחזור">
                <Select value={form.billingCycle} onChange={set("billingCycle")}>
                  {BILLING_CYCLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="תאריך חידוש" error={errors.renewalDate}>
              <Input type="date" value={form.renewalDate} onChange={set("renewalDate")} />
            </Field>
            <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2 sm:self-end">
              <span className="text-sm font-medium">חידוש אוטומטי</span>
              <Switch
                checked={form.autoRenew}
                onCheckedChange={(v) => setForm((f) => ({ ...f, autoRenew: v }))}
              />
            </div>
          </div>

          <Field label="הערות" error={errors.notes}>
            <Textarea value={form.notes} onChange={set("notes")} rows={2} />
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              ביטול
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
