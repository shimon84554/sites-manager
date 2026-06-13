# 🗂️ Sites Manager — דשבורד ניהול אתרים

מערכת אישית (משתמש יחיד) לריכוז כל המידע התפעולי על האתרים שאתה מתחזק עבור לקוחות:
דומיינים, אירוח, סטאק טכני, מנויים, עלויות ורווחיות — עם **התראות מראש לפני כל חידוש**.

הכול בעברית מלאה, RTL, רספונסיבי, עם מצב כהה/בהיר.

---

## ✨ תכונות עיקריות

- **דשבורד מבט-על** — כרטיסי סיכום (אתרים, חידושים ב-30 יום, עלות חודשית, רווח חודשי) + טבלת חידושים מתקרבים צבעונית.
- **מנוע חידושים מאוחד** — דומיינים, אירוח, מנויים ותעודות SSL ברשימה אחת, ממוינת לפי דחיפות:
  🔴 אדום (פג / ≤7 ימים) · 🟠 כתום (8–30 יום) · 🟢 ירוק (מעבר לכך).
- **CRUD מלא** ללקוחות, אתרים ומנויים — טפסים נוחים בעברית עם ולידציה.
- **עמוד אתר בודד** — כל המידע במקום אחד: אירוח, דומיין, DB/סטאק, מנויים, עלות/רווחיות וטיימליין חידושים.
- **התראות דו-ערוציות** — פעמון בתוך המערכת + מיילים אוטומטיים X ימים לפני חידוש (ברירת מחדל 30/14/7 + פג תוקף), עם לוג שמונע כפילויות.
- **כספת סיסמאות** — שמירה מוצפנת (AES-256-GCM) של פרטי גישה (FTP/SSH/פאנל/DB), חשיפה רק בלחיצה.
- **ניטור SSL וזמינות** — בדיקה יומית שכל אתר עולה (HTTP) ומה תוקף ה-SSL, עם התראה מתחת ל-14 יום.
- **עלויות ורווחיות** — סיכום חודשי/שנתי לכל אתר ולכל הפורטפוליו, עם המרת מטבע (₪/$/€).
- **ייצוא CSV** — גיבוי אתרים/מנויים/לקוחות (נפתח גם ב-Excel, כולל עברית).

---

## 🧱 הסטאק

| תחום | טכנולוגיה |
|------|-----------|
| Framework | **Next.js 14** (App Router) + **TypeScript** |
| ORM / DB | **Prisma** מול **SQLite** (פיתוח) או **PostgreSQL** (פרודקשן) |
| עיצוב | **Tailwind CSS** + רכיבים בסגנון shadcn/ui, RTL מלא |
| אימות | **NextAuth (Auth.js)** — מייל+סיסמה, JWT, bcrypt |
| מייל | **Nodemailer** (SMTP) או **Resend**, עם נפילה לקונסול |
| Cron | **node-cron** (סקריפט עצמאי) או **Vercel Cron** |
| הצפנה | מודול `crypto` מובנה — **AES-256-GCM** |

> **הערות על בחירות טכניות:** השתמשתי ב-Next 14 (ולא 15) וב-NextAuth v4 (ולא Auth.js v5 beta) כי הם
> היציבים והמתועדים ביותר ל-App Router — מתאים למערכת "פשוטה לתחזוקה". רכיבי ה-UI נכתבו ידנית בסגנון
> shadcn/ui (במקום ה-CLI האינטראקטיבי) לשליטה מלאה ב-RTL. סוגי המידע בסכמה הם `String` (ולא enums)
> כדי לשמור תאימות מלאה בין SQLite ל-PostgreSQL.

---

## 🚀 התקנה והרצה (4 צעדים)

> **דרישות מוקדמות:** Node.js 18+ (נבדק על 20 ו-24).

```bash
# 1. התקנת תלויות (כולל יצירת Prisma Client אוטומטית)
npm install

# 2. הגדרת משתני סביבה — העתק את קובץ הדוגמה
#    Windows (PowerShell):  Copy-Item .env.example .env
#    macOS / Linux:         cp .env.example .env
#    כבר קיים קובץ .env מוכן לפיתוח עם סודות שנוצרו אוטומטית.

# 3. יצירת מסד הנתונים + מיגרציה + זריעת נתוני דמו (3 אתרים)
npm run db:migrate      # יוצר את dev.db ומריץ את הזריעה אוטומטית
# (אם ה-DB כבר קיים, להרצת הזריעה בלבד:  npm run db:seed)

# 4. הרצה
npm run dev
```

פתח את [http://localhost:3000](http://localhost:3000).

### 🔑 פרטי התחברות ברירת מחדל (מוגדרים ב-`.env`)

| | |
|---|---|
| **אימייל** | `admin@example.com` |
| **סיסמה** | `Admin!123` |

> לשינוי: ערוך את `ADMIN_EMAIL` / `ADMIN_PASSWORD` ב-`.env` והרץ שוב `npm run db:seed`
> (הזריעה מעדכנת את המשתמש הקיים — upsert).

---

## 🗄️ הגדרת מסד הנתונים

ברירת המחדל היא **SQLite** — אפס התקנה, הקובץ נוצר ב-`prisma/dev.db`.

### מעבר ל-PostgreSQL (פרודקשן)

1. ערוך את `prisma/schema.prisma` ושנה את ה-provider:
   ```prisma
   datasource db {
     provider = "postgresql"   // היה "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
2. עדכן את `DATABASE_URL` ב-`.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/sites_manager?schema=public"
   ```
3. הרץ מיגרציה חדשה:
   ```bash
   npm run db:migrate
   ```

> מגבלה ידועה של Prisma: ה-`provider` לא יכול להיות משתנה סביבה, לכן נדרש שינוי שורה אחת בסכמה.
> כל שאר הקוד והטיפוסים תואמים לשני מסדי הנתונים ללא שינוי.

---

## 📧 הגדרת שליחת מייל

ללא הגדרה — **המערכת עובדת מהקופסה** וההתראות מודפסות לקונסול (נוח לבדיקה).
לשליחה אמיתית, מלא אחת מהאופציות ב-`.env`:

### אופציה א' — SMTP (Gmail / Mailgun / כל ספק)
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"          # true עבור פורט 465
SMTP_USER="you@gmail.com"
SMTP_PASS="app-password"     # ב-Gmail: סיסמת אפליקציה
EMAIL_FROM="Sites Manager <you@gmail.com>"
EMAIL_TO="me@example.com"    # יעד ההתראות
```

### אופציה ב' — Resend (מקבל עדיפות אם מוגדר)
```env
RESEND_API_KEY="re_xxxxxxxx"
EMAIL_FROM="Sites Manager <no-reply@yourdomain.com>"
EMAIL_TO="me@example.com"
```

**בדיקה ידנית:** היכנס ל**הגדרות → הרץ בדיקות עכשיו**, או הוסף אתר עם תאריך חידוש קרוב והרץ את ה-cron.

---

## ⏰ הגדרת ה-Cron (בדיקה יומית)

הבדיקה היומית מבצעת: (1) ניטור זמינות+SSL לכל האתרים, ואז (2) בדיקת חידושים ושליחת מיילים.
הנתיב המוגן: `POST /api/cron` (דורש `CRON_SECRET`). שלוש דרכים:

### 1. סקריפט עצמאי (VPS / הרצה מקומית מתמשכת)
```bash
npm run cron            # רץ ברקע ומפעיל כל יום ב-08:00
npm run cron -- --now   # להרצה מיידית לבדיקה
```
ניתן לשנות את הלו"ז עם `CRON_SCHEDULE` ב-`.env` (ברירת מחדל `"0 8 * * *"`).

### 2. Vercel Cron (בפריסה ל-Vercel)
הקובץ `vercel.json` כבר מוגדר. הגדר את `CRON_SECRET` במשתני הסביבה של Vercel —
היא תשלח אותו אוטומטית בכותרת `Authorization`.

### 3. Cron של מערכת ההפעלה
```bash
# crontab -e  (כל יום ב-08:00)
0 8 * * * curl -X POST "https://your-domain.com/api/cron?secret=YOUR_CRON_SECRET"
```

---

## 🔐 כספת הסיסמאות (הצפנה)

פרטי הגישה נשמרים **מוצפנים** (AES-256-GCM) ולעולם לא כ-plaintext. נדרש מפתח הצפנה:

```env
# 64 תווי hex (= 32 בייט). צור עם:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY="..."
```

> ⚠️ **שמור על המפתח!** אם תאבד אותו — לא ניתן יהיה לפענח את הסיסמאות השמורות.
> בפרודקשן החזק אותו כסוד (Secret) ולא בקוד.

---

## 📜 סקריפטים זמינים

| פקודה | תיאור |
|-------|-------|
| `npm run dev` | שרת פיתוח |
| `npm run build` | בילד לפרודקשן (כולל `prisma generate`) |
| `npm start` | הרצת בילד הפרודקשן |
| `npm run db:migrate` | יצירת/החלת מיגרציה (+ זריעה) |
| `npm run db:seed` | זריעת נתוני דמו בלבד |
| `npm run db:studio` | Prisma Studio (עיון ב-DB) |
| `npm run db:reset` | איפוס DB + מיגרציה + זריעה |
| `npm run cron` | הפעלת ה-cron העצמאי |
| `npm run lint` | בדיקת ESLint |

---

## 📁 מבנה הפרויקט

```
src/
├── app/
│   ├── (app)/              # עמודים מאומתים (דשבורד, אתרים, לקוחות, מנויים, כספת, ניטור, דוחות, הגדרות)
│   ├── api/                # API routes (CRUD, cron, export, monitoring, auth)
│   ├── login/              # מסך התחברות
│   ├── layout.tsx          # שורש: RTL, גופן Heebo, ספקי קונטקסט
│   └── globals.css         # ערכת נושא + צבעי דחיפות
├── components/
│   ├── ui/                 # רכיבי בסיס (button, card, input, select, modal, table…)
│   ├── layout/             # sidebar, topbar, app-shell, ניווט
│   ├── clients|sites|subscriptions|credentials|renewals|monitoring|settings/
│   └── …                   # רכיבים משותפים (stat-card, empty-state, delete-button…)
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # NextAuth config
│   ├── crypto.ts           # הצפנת כספת (AES-256-GCM)
│   ├── renewals.ts         # מנוע החידושים המאוחד
│   ├── notifications.ts    # בדיקת חידושים + שליחת מייל + dedup
│   ├── email.ts            # שכבת מייל (Resend/SMTP/קונסול)
│   ├── ssl.ts              # ניטור זמינות + SSL
│   ├── monitoring.ts       # הרצת ניטור + שמירה ל-DB
│   ├── stats.ts            # חישובי עלות/רווחיות
│   ├── currency.ts         # המרת מטבע ונרמול עלויות
│   └── validations.ts      # סכמות Zod
├── middleware.ts           # הגנת נתיבים (הפניה ל-login)
prisma/
├── schema.prisma           # סכמת הנתונים
├── seed.ts                 # זריעת דמו
└── migrations/             # מיגרציות
scripts/cron.ts             # cron עצמאי (node-cron)
```

---

## 🌐 פריסה לפרודקשן (Vercel)

1. דחוף את הפרויקט ל-GitHub וחבר ל-Vercel.
2. עבור ל-PostgreSQL (ראה למעלה) — למשל Vercel Postgres / Neon / Supabase.
3. הגדר ב-Vercel את כל משתני הסביבה מ-`.env.example` (כולל `NEXTAUTH_SECRET`, `ENCRYPTION_KEY`, `CRON_SECRET`, `DATABASE_URL`, פרטי מייל).
4. ה-`vercel.json` כבר מפעיל את ה-cron היומי.
5. לאחר הפריסה הראשונה, הרץ מיגרציה מול ה-DB:  `npx prisma migrate deploy`.

---

## 🔒 אבטחה

- סיסמאות מאוחסנות כ-hash (bcrypt), לא כטקסט גלוי.
- שדות רגישים בכספת מוצפנים (AES-256-GCM).
- כל ה-API מאחורי אימות (401 ללא סשן); ה-cron מוגן ב-secret.
- כל ה-secrets במשתני סביבה — **אין מפתחות בקוד**. קובץ `.env` ב-`.gitignore`.

---

## 🛠️ פתרון תקלות

- **המיילים לא נשלחים** — בדוק שהגדרת `SMTP_*` או `RESEND_API_KEY`. ללא הגדרה, ההתראות מודפסות לקונסול (זו התנהגות תקינה בפיתוח).
- **"מפתח ההצפנה אינו מוגדר" בכספת** — הגדר `ENCRYPTION_KEY` (64 תווי hex) ב-`.env`.
- **ניטור מראה "לא זמין" לאתרי הדמו** — תקין: הדומיינים בדמו אינם אמיתיים. הוסף אתר עם דומיין אמיתי ולחץ "בדוק עכשיו".
- **שגיאת מסד נתונים אחרי שינוי הסכמה** — הרץ `npm run db:migrate` (או `npm run db:reset` לאיפוס מלא).
```
