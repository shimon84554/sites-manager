/**
 * זריעה ראשונית — יוצר אך ורק את משתמש המנהל (admin) מתוך משתני הסביבה.
 * אין נתוני דמו. idempotent — אפשר להריץ שוב בבטחה.
 *
 * הרצה:  npm run db:seed
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin!123";
  const name = process.env.ADMIN_NAME || "מנהל המערכת";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { name, role: "admin" },
    create: { email, passwordHash, name, role: "admin" },
  });

  console.log(`✔ משתמש מנהל מוכן: ${email}`);
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
