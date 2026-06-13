"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// כפתור "בדוק עכשיו" — מפעיל בדיקת זמינות/SSL ומרענן.
export function CheckButton({
  siteId,
  label = "בדוק עכשיו",
  variant = "outline",
}: {
  siteId?: string;
  label?: string;
  variant?: "outline" | "default" | "ghost";
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function check() {
    setLoading(true);
    try {
      await fetch("/api/monitoring/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteId ? { siteId } : {}),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={variant} size="sm" onClick={check} disabled={loading}>
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <RefreshCw className="size-4" />
      )}
      {label}
    </Button>
  );
}
