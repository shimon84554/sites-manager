/**
 * זריעת נתוני דמו — יוצר משתמש מנהל ו-3 אתרים לדוגמה עם חידושים מגוונים
 * (חלקם דחופים/אדומים, חלקם בקרוב/כתומים, חלקם רגועים/ירוקים).
 *
 * הרצה:  npm run db:seed   (או אוטומטית עם prisma migrate reset)
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays } from "date-fns";
import { encrypt } from "../src/lib/crypto";

const prisma = new PrismaClient();

const today = new Date();
const d = (days: number) => addDays(today, days);

async function main() {
  // --- משתמש מנהל (idempotent) ---
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin!123";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name: process.env.ADMIN_NAME || "מנהל המערכת" },
    create: { email, passwordHash, name: process.env.ADMIN_NAME || "מנהל המערכת" },
  });
  console.log(`✔ משתמש מנהל: ${email}`);

  // --- ניקוי נתוני דמו קודמים (לזריעה חוזרת נקייה) ---
  await prisma.notificationLog.deleteMany();
  await prisma.client.deleteMany(); // מוחק בקסקדה אתרים, מנויים, כספת והיסטוריה

  // אם מפתח ההצפנה מוגדר — נשמור גם פרטי גישה לדוגמה
  let canEncrypt = true;
  try {
    encrypt("test");
  } catch {
    canEncrypt = false;
    console.warn("⚠ ENCRYPTION_KEY לא מוגדר — מדלג על פרטי גישה לדוגמה.");
  }

  // ===== לקוח 1: סטודיו אורן =====
  const oren = await prisma.client.create({
    data: {
      name: "סטודיו אורן",
      contactName: "אורן לוי",
      contactEmail: "oren@orenstudio.co.il",
      contactPhone: "050-1234567",
      notes: "סטודיו לעיצוב גרפי. אתר תדמית + בלוג.",
      sites: {
        create: {
          name: "אתר התדמית של סטודיו אורן",
          primaryDomain: "orenstudio.co.il",
          status: "active",
          framework: "WordPress",
          language: "PHP",
          dbType: "MySQL",
          repoUrl: "https://github.com/example/oren-studio",
          notes: "אתר וורדפרס עם תוסף Elementor.",
          // אירוח — חידוש בעוד 25 יום (כתום)
          hostingProvider: "Hostinger",
          hostingPlan: "Premium Web Hosting",
          serverIpOrUrl: "153.92.10.45",
          hostingCostAmount: 45,
          hostingCostCurrency: "ILS",
          hostingBillingCycle: "monthly",
          hostingRenewalDate: d(25),
          // דומיין — חידוש בעוד 5 ימים (אדום!)
          domainRegistrar: "GoDaddy",
          domainCostAmount: 60,
          domainCurrency: "ILS",
          domainBillingCycle: "yearly",
          domainRenewalDate: d(5),
          // הכנסה
          clientBillingAmount: 350,
          clientBillingCurrency: "ILS",
          clientBillingCycle: "monthly",
          monitorEnabled: true,
          subscriptions: {
            create: [
              {
                serviceName: "WhatsApp API אוטומטי",
                provider: "Twilio",
                costAmount: 25,
                currency: "USD",
                billingCycle: "monthly",
                renewalDate: d(6), // אדום
                autoRenew: true,
                notes: "שליחת אישורי הזמנה אוטומטיים.",
              },
              {
                serviceName: "Mailchimp",
                provider: "Mailchimp",
                costAmount: 50,
                currency: "USD",
                billingCycle: "monthly",
                renewalDate: d(45), // ירוק
                autoRenew: true,
              },
            ],
          },
        },
      },
    },
    include: { sites: true },
  });

  // ===== לקוח 2: מסעדת הגליל =====
  await prisma.client.create({
    data: {
      name: "מסעדת הגליל",
      contactName: "רונית בר",
      contactEmail: "ronit@galilee-rest.com",
      contactPhone: "052-7654321",
      notes: "מסעדה עם מערכת הזמנות אונליין.",
      sites: {
        create: {
          name: "אתר הזמנות — מסעדת הגליל",
          primaryDomain: "galilee-rest.com",
          status: "active",
          framework: "Next.js",
          language: "TypeScript",
          dbType: "PostgreSQL",
          dbHostNotes: "Supabase — אזור פרנקפורט.",
          repoUrl: "https://github.com/example/galilee",
          // אירוח — Vercel, חידוש בעוד 90 יום (ירוק)
          hostingProvider: "Vercel",
          hostingPlan: "Pro",
          serverIpOrUrl: "https://galilee-rest.com",
          hostingCostAmount: 20,
          hostingCostCurrency: "USD",
          hostingBillingCycle: "monthly",
          hostingRenewalDate: d(90),
          // דומיין — חידוש בעוד 60 יום (ירוק)
          domainRegistrar: "Cloudflare",
          domainCostAmount: 12,
          domainCurrency: "USD",
          domainBillingCycle: "yearly",
          domainRenewalDate: d(60),
          clientBillingAmount: 600,
          clientBillingCurrency: "ILS",
          clientBillingCycle: "monthly",
          monitorEnabled: true,
          subscriptions: {
            create: [
              {
                serviceName: "SMS שליחת הזמנות",
                provider: "019 SMS",
                costAmount: 120,
                currency: "ILS",
                billingCycle: "monthly",
                renewalDate: d(18), // כתום
                autoRenew: false,
              },
            ],
          },
        },
      },
    },
  });

  // ===== לקוח 3: עו״ד כהן ושות׳ =====
  const cohen = await prisma.client.create({
    data: {
      name: "עו״ד כהן ושות׳",
      contactName: "דניאל כהן",
      contactEmail: "daniel@cohen-law.co.il",
      contactPhone: "054-9988776",
      notes: "משרד עורכי דין. אתר תדמית + אזור לקוחות מאובטח.",
      sites: {
        create: {
          name: "אתר משרד עו״ד כהן",
          primaryDomain: "cohen-law.co.il",
          status: "active",
          framework: "Laravel",
          language: "PHP",
          dbType: "MySQL",
          // אירוח — חידוש בעוד 200 יום (ירוק)
          hostingProvider: "AWS",
          hostingPlan: "Lightsail 2GB",
          serverIpOrUrl: "13.49.22.180",
          hostingCostAmount: 120,
          hostingCostCurrency: "ILS",
          hostingBillingCycle: "monthly",
          hostingRenewalDate: d(200),
          // דומיין — פג לפני 3 ימים (אדום — פג תוקף!)
          domainRegistrar: "Namecheap",
          domainCostAmount: 55,
          domainCurrency: "ILS",
          domainBillingCycle: "yearly",
          domainRenewalDate: d(-3),
          clientBillingAmount: 800,
          clientBillingCurrency: "ILS",
          clientBillingCycle: "monthly",
          monitorEnabled: true,
          subscriptions: {
            create: [
              {
                serviceName: "תעודת SSL בתשלום (EV)",
                provider: "DigiCert",
                costAmount: 300,
                currency: "ILS",
                billingCycle: "yearly",
                renewalDate: d(40), // ירוק
                autoRenew: false,
                notes: "תעודת EV לאזור הלקוחות.",
              },
            ],
          },
        },
      },
    },
    include: { sites: true },
  });

  // --- פרטי גישה לדוגמה (מוצפנים) ---
  if (canEncrypt) {
    await prisma.credential.createMany({
      data: [
        {
          siteId: oren.sites[0].id,
          label: "גישת FTP ראשית",
          type: "ftp",
          username: "u123_oren",
          url: "ftp://153.92.10.45",
          secretCipher: encrypt("Sup3rS3cret!FTP"),
          notes: "פורט 21.",
        },
        {
          siteId: oren.sites[0].id,
          label: "כניסת WordPress Admin",
          type: "panel",
          username: "admin",
          url: "https://orenstudio.co.il/wp-admin",
          secretCipher: encrypt("wpAdmin#2024"),
        },
        {
          siteId: cohen.sites[0].id,
          label: "SSH לשרת AWS",
          type: "ssh",
          username: "ubuntu",
          url: "ssh://13.49.22.180",
          secretCipher: encrypt("ssh-key-passphrase-9921"),
        },
      ],
    });
    console.log("✔ נשמרו 3 פרטי גישה מוצפנים");
  }

  console.log("✔ נזרעו 3 לקוחות, 3 אתרים ומנויים לדוגמה");
  console.log("\n🎉 הזריעה הושלמה. התחבר עם:");
  console.log(`   אימייל: ${email}`);
  console.log(`   סיסמה:  ${password}\n`);
}

main()
  .catch((e) => {
    console.error("✖ שגיאה בזריעה:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
