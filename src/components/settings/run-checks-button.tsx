"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// כפתור "הרץ בדיקות עכשיו" — מפעיל ניטור + בדיקת חידושים ושליחת מיילים.
export function RunChecksButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/run-checks", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        const sent = data?.renewals?.sent ?? 0;
        const checked = data?.monitoring?.checked ?? 0;
        const channel = data?.renewals?.emailConfigured
          ? "מייל"
          : "קונסול (מייל לא מוגדר)";
        setResult(
          `הסתיים: נבדקו ${checked} אתרים, נשלחו ${sent} התראות דרך ${channel}.`
        );
        router.refresh();
      } else {
        setResult(data?.error || "אירעה שגיאה.");
      }
    } catch {
      setResult("שגיאת רשת.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={run} disabled={loading}>
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Play className="size-4" />
        )}
        הרץ בדיקות עכשיו
      </Button>
      {result && (
        <p className="flex items-center gap-1.5 text-sm text-ok">
          <CheckCircle2 className="size-4" />
          {result}
        </p>
      )}
    </div>
  );
}
