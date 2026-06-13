import crypto from "crypto";

// כספת סיסמאות — הצפנה סימטרית AES-256-GCM.
// המפתח מגיע מ-ENV (ENCRYPTION_KEY) ולעולם לא נשמר במסד הנתונים.
// פורמט הטקסט המוצפן: iv(hex):authTag(hex):ciphertext(hex)

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "ENCRYPTION_KEY חסר. הגדר 64 תווי hex ב-.env (ראה .env.example)."
    );
  }
  const key = Buffer.from(raw, "hex");
  if (key.length !== 32) {
    throw new Error(
      "ENCRYPTION_KEY חייב להיות באורך 64 תווי hex (32 בייט) עבור AES-256."
    );
  }
  return key;
}

/** האם מפתח ההצפנה מוגדר תקין (לבדיקה ב-UI / בריאות המערכת) */
export function isEncryptionConfigured(): boolean {
  try {
    getKey();
    return true;
  } catch {
    return false;
  }
}

/** הצפנת טקסט גלוי -> מחרוזת מוצפנת לשמירה */
export function encrypt(plainText: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12); // 96-bit IV מומלץ ל-GCM
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString(
    "hex"
  )}`;
}

/** פענוח מחרוזת מוצפנת -> טקסט גלוי */
export function decrypt(payload: string): string {
  const key = getKey();
  const parts = payload.split(":");
  if (parts.length !== 3) {
    throw new Error("פורמט טקסט מוצפן לא תקין");
  }
  const [ivHex, tagHex, dataHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(tagHex, "hex");
  const data = Buffer.from(dataHex, "hex");

  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}
