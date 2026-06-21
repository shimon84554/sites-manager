import { z } from "zod";

// סכמות ולידציה משותפות ל-API ולטפסים.
// הטפסים שולחים מחרוזות; כאן ממירים למספרים/תאריכים ומנקים שדות ריקים ל-null.

const emptyToNull = (v: unknown) =>
  v === "" || v === undefined ? null : v;

const optionalText = (max = 2000) =>
  z.preprocess(
    emptyToNull,
    z.string().trim().max(max, `מקסימום ${max} תווים`).nullable()
  );

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
  z
    .number({ invalid_type_error: "יש להזין מספר" })
    .nonnegative("המספר חייב להיות חיובי")
    .nullable()
);

const optionalDate = z.preprocess((v) => {
  if (v === "" || v === null || v === undefined) return null;
  if (v instanceof Date) return v;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
}, z.date().nullable());

const currency = z.enum(["ILS", "USD", "EUR"]);
const billingCycle = z.enum(["monthly", "quarterly", "yearly", "one_time"]);

// ---- לקוח ----
export const clientSchema = z.object({
  name: z.string().trim().min(1, "שם הלקוח הוא שדה חובה").max(200),
  contactName: optionalText(200),
  contactEmail: z.preprocess(
    emptyToNull,
    z.string().trim().email("כתובת מייל לא תקינה").nullable()
  ),
  contactPhone: optionalText(50),
  notes: optionalText(),
});
export type ClientInput = z.infer<typeof clientSchema>;

// ---- אתר ----
export const siteSchema = z.object({
  clientId: z.string().min(1, "יש לבחור לקוח"),
  name: z.string().trim().min(1, "שם האתר הוא שדה חובה").max(200),
  primaryDomain: optionalText(255),
  status: z.enum(["active", "building", "paused", "closed"]).default("active"),
  notes: optionalText(),

  // אירוח
  hostingProvider: optionalText(200),
  hostingPlan: optionalText(200),
  serverIpOrUrl: optionalText(255),
  hostingCostAmount: optionalNumber,
  hostingCostCurrency: currency.default("ILS"),
  hostingBillingCycle: billingCycle.default("monthly"),
  hostingRenewalDate: optionalDate,

  // דומיין
  domainRegistrar: optionalText(200),
  domainCostAmount: optionalNumber,
  domainCurrency: currency.default("ILS"),
  domainBillingCycle: billingCycle.default("yearly"),
  domainRenewalDate: optionalDate,

  // סטאק
  framework: optionalText(200),
  language: optionalText(200),
  dbType: optionalText(100),
  dbHostNotes: optionalText(),
  repoUrl: optionalText(500),

  // הכנסה
  clientBillingAmount: optionalNumber,
  clientBillingCurrency: currency.default("ILS"),
  clientBillingCycle: billingCycle.default("monthly"),

  // ניטור
  monitorEnabled: z.preprocess(
    (v) => v === "true" || v === true || v === "on" || v === 1,
    z.boolean()
  ).default(true),
});
export type SiteInput = z.infer<typeof siteSchema>;

// ---- מנוי ----
export const subscriptionSchema = z.object({
  siteId: z.string().min(1, "יש לבחור אתר"),
  serviceName: z.string().trim().min(1, "שם השירות הוא שדה חובה").max(200),
  provider: optionalText(200),
  costAmount: optionalNumber,
  currency: currency.default("ILS"),
  billingCycle: billingCycle.default("monthly"),
  renewalDate: optionalDate,
  autoRenew: z.preprocess(
    (v) => v === "true" || v === true || v === "on" || v === 1,
    z.boolean()
  ).default(false),
  notes: optionalText(),
});
export type SubscriptionInput = z.infer<typeof subscriptionSchema>;

// ---- פרטי גישה (כספת) ----
export const credentialSchema = z.object({
  siteId: z.string().min(1, "יש לבחור אתר"),
  label: z.string().trim().min(1, "תווית היא שדה חובה").max(200),
  type: z.enum(["ftp", "ssh", "panel", "db", "api", "other"]).default("other"),
  username: optionalText(200),
  url: optionalText(500),
  // הסוד הגלוי — יוצפן בשרת לפני השמירה
  secret: z.string().min(1, "יש להזין סיסמה / סוד"),
  notes: optionalText(),
});
export type CredentialInput = z.infer<typeof credentialSchema>;

// ---- פרופיל אישי (עדכון עצמי של שם/סיסמה) ----
export const profileSchema = z
  .object({
    name: optionalText(200),
    currentPassword: z.preprocess(emptyToNull, z.string().nullable()),
    newPassword: z.preprocess(
      emptyToNull,
      z.string().min(8, "סיסמה חדשה באורך 8 תווים לפחות").nullable()
    ),
  })
  .refine((d) => !d.newPassword || !!d.currentPassword, {
    message: "יש להזין את הסיסמה הנוכחית כדי לשנות סיסמה",
    path: ["currentPassword"],
  });
export type ProfileInput = z.infer<typeof profileSchema>;

// ---- ניהול משתמשים (מנהל בלבד) ----
const roleEnum = z.enum(["admin", "user"]);

export const userCreateSchema = z.object({
  name: optionalText(200),
  email: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.string().email("כתובת מייל לא תקינה")
  ),
  password: z.string().min(8, "סיסמה באורך 8 תווים לפחות"),
  role: roleEnum.default("user"),
});
export type UserCreateInput = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = z.object({
  name: optionalText(200),
  role: roleEnum,
  // ריק = לא משנים סיסמה
  password: z.preprocess(
    emptyToNull,
    z.string().min(8, "סיסמה באורך 8 תווים לפחות").nullable()
  ),
});
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
