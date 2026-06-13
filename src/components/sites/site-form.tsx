"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Field, FormSection } from "@/components/form/field";
import { useSubmit } from "@/components/form/use-submit";
import { toDateInputValue } from "@/lib/utils";
import {
  SITE_STATUS_OPTIONS,
  CURRENCY_OPTIONS,
  BILLING_CYCLE_OPTIONS,
  DB_TYPE_OPTIONS,
} from "@/lib/constants";

interface ClientOption {
  id: string;
  name: string;
}

// טיפוס רופף לאתר קיים (לעריכה)
type SiteRecord = Record<string, any>;

export function SiteForm({
  clients,
  site,
}: {
  clients: ClientOption[];
  site?: SiteRecord;
}) {
  const isEdit = !!site;
  const router = useRouter();
  const { submit, loading, errors, formError } = useSubmit();

  const [form, setForm] = useState({
    clientId: site?.clientId ?? clients[0]?.id ?? "",
    name: site?.name ?? "",
    primaryDomain: site?.primaryDomain ?? "",
    status: site?.status ?? "active",
    notes: site?.notes ?? "",

    hostingProvider: site?.hostingProvider ?? "",
    hostingPlan: site?.hostingPlan ?? "",
    serverIpOrUrl: site?.serverIpOrUrl ?? "",
    hostingCostAmount: site?.hostingCostAmount?.toString() ?? "",
    hostingCostCurrency: site?.hostingCostCurrency ?? "ILS",
    hostingBillingCycle: site?.hostingBillingCycle ?? "monthly",
    hostingRenewalDate: toDateInputValue(site?.hostingRenewalDate),

    domainRegistrar: site?.domainRegistrar ?? "",
    domainCostAmount: site?.domainCostAmount?.toString() ?? "",
    domainCurrency: site?.domainCurrency ?? "ILS",
    domainBillingCycle: site?.domainBillingCycle ?? "yearly",
    domainRenewalDate: toDateInputValue(site?.domainRenewalDate),

    framework: site?.framework ?? "",
    language: site?.language ?? "",
    dbType: site?.dbType ?? "none",
    dbHostNotes: site?.dbHostNotes ?? "",
    repoUrl: site?.repoUrl ?? "",

    clientBillingAmount: site?.clientBillingAmount?.toString() ?? "",
    clientBillingCurrency: site?.clientBillingCurrency ?? "ILS",
    clientBillingCycle: site?.clientBillingCycle ?? "monthly",

    monitorEnabled: site?.monitorEnabled ?? true,
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<any>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit(
      isEdit ? `/api/sites/${site!.id}` : "/api/sites",
      isEdit ? "PATCH" : "POST",
      form,
      (data) => {
        const id = data?.site?.id ?? site?.id;
        router.push(id ? `/sites/${id}` : "/sites");
        router.refresh();
      }
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* כללי */}
      <FormSection title="פרטים כלליים">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="לקוח" required error={errors.clientId}>
            <Select value={form.clientId} onChange={set("clientId")}>
              {clients.length === 0 && <option value="">אין לקוחות</option>}
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="שם האתר" required error={errors.name}>
            <Input value={form.name} onChange={set("name")} />
          </Field>
          <Field label="דומיין ראשי" error={errors.primaryDomain} hint="לדוגמה example.com">
            <Input
              dir="ltr"
              className="text-right"
              value={form.primaryDomain}
              onChange={set("primaryDomain")}
            />
          </Field>
          <Field label="סטטוס" error={errors.status}>
            <Select value={form.status} onChange={set("status")}>
              {SITE_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="הערות" error={errors.notes}>
          <Textarea value={form.notes} onChange={set("notes")} rows={2} />
        </Field>
      </FormSection>

      {/* אירוח */}
      <FormSection title="אירוח (Hosting)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ספק אירוח" error={errors.hostingProvider} hint="Hostinger / Vercel / AWS …">
            <Input value={form.hostingProvider} onChange={set("hostingProvider")} />
          </Field>
          <Field label="תוכנית" error={errors.hostingPlan}>
            <Input value={form.hostingPlan} onChange={set("hostingPlan")} />
          </Field>
          <Field label="כתובת שרת / IP" error={errors.serverIpOrUrl} className="sm:col-span-2">
            <Input
              dir="ltr"
              className="text-right"
              value={form.serverIpOrUrl}
              onChange={set("serverIpOrUrl")}
            />
          </Field>
          <Field label="עלות" error={errors.hostingCostAmount}>
            <Input
              type="number"
              step="0.01"
              dir="ltr"
              className="text-right"
              value={form.hostingCostAmount}
              onChange={set("hostingCostAmount")}
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="מטבע">
              <Select value={form.hostingCostCurrency} onChange={set("hostingCostCurrency")}>
                {CURRENCY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="מחזור">
              <Select value={form.hostingBillingCycle} onChange={set("hostingBillingCycle")}>
                {BILLING_CYCLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="תאריך חידוש אירוח" error={errors.hostingRenewalDate}>
            <Input type="date" value={form.hostingRenewalDate} onChange={set("hostingRenewalDate")} />
          </Field>
          <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2 sm:self-end">
            <span className="text-sm font-medium">ניטור SSL וזמינות</span>
            <Switch
              checked={form.monitorEnabled}
              onCheckedChange={(v) => setForm((f) => ({ ...f, monitorEnabled: v }))}
            />
          </div>
        </div>
      </FormSection>

      {/* דומיין */}
      <FormSection title="דומיין">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ספק הדומיין (Registrar)" error={errors.domainRegistrar} hint="GoDaddy / Namecheap / Cloudflare …">
            <Input value={form.domainRegistrar} onChange={set("domainRegistrar")} />
          </Field>
          <Field label="תאריך חידוש דומיין" error={errors.domainRenewalDate}>
            <Input type="date" value={form.domainRenewalDate} onChange={set("domainRenewalDate")} />
          </Field>
          <Field label="עלות" error={errors.domainCostAmount}>
            <Input
              type="number"
              step="0.01"
              dir="ltr"
              className="text-right"
              value={form.domainCostAmount}
              onChange={set("domainCostAmount")}
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="מטבע">
              <Select value={form.domainCurrency} onChange={set("domainCurrency")}>
                {CURRENCY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="מחזור">
              <Select value={form.domainBillingCycle} onChange={set("domainBillingCycle")}>
                {BILLING_CYCLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </Field>
          </div>
        </div>
      </FormSection>

      {/* סטאק טכני */}
      <FormSection title="סטאק טכני / מסד נתונים">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="פלטפורמה / Framework" error={errors.framework} hint="WordPress / Next.js / Laravel …">
            <Input value={form.framework} onChange={set("framework")} />
          </Field>
          <Field label="שפה" error={errors.language}>
            <Input value={form.language} onChange={set("language")} />
          </Field>
          <Field label="סוג מסד נתונים" error={errors.dbType}>
            <Select value={form.dbType} onChange={set("dbType")}>
              {DB_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="כתובת Repo" error={errors.repoUrl}>
            <Input
              dir="ltr"
              className="text-right"
              value={form.repoUrl}
              onChange={set("repoUrl")}
            />
          </Field>
          <Field label="הערות DB / אירוח מסד" error={errors.dbHostNotes} className="sm:col-span-2">
            <Textarea value={form.dbHostNotes} onChange={set("dbHostNotes")} rows={2} />
          </Field>
        </div>
      </FormSection>

      {/* הכנסה */}
      <FormSection title="הכנסה מהלקוח (לחישוב רווחיות)">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="סכום חיוב ללקוח" error={errors.clientBillingAmount}>
            <Input
              type="number"
              step="0.01"
              dir="ltr"
              className="text-right"
              value={form.clientBillingAmount}
              onChange={set("clientBillingAmount")}
            />
          </Field>
          <Field label="מטבע">
            <Select value={form.clientBillingCurrency} onChange={set("clientBillingCurrency")}>
              {CURRENCY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="מחזור חיוב">
            <Select value={form.clientBillingCycle} onChange={set("clientBillingCycle")}>
              {BILLING_CYCLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </Field>
        </div>
      </FormSection>

      {formError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}

      <div className="flex justify-start gap-2">
        <Button type="submit" disabled={loading || clients.length === 0}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isEdit ? "שמירת שינויים" : "יצירת אתר"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          ביטול
        </Button>
      </div>
    </form>
  );
}
