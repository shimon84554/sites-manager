"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useSubmit } from "@/components/form/use-submit";

// כפתור מחיקה עם אישור — מבצע DELETE ומרענן/מנווט.
export function DeleteButton({
  url,
  title,
  description,
  redirectTo,
  variant = "ghost",
  size = "icon",
  label,
}: {
  url: string;
  title: string;
  description?: string;
  redirectTo?: string;
  variant?: "ghost" | "outline" | "destructive";
  size?: "icon" | "sm" | "default";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { submit, loading } = useSubmit();

  async function onConfirm() {
    const ok = await submit(url, "DELETE", undefined, () => {
      setOpen(false);
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    });
    if (!ok) setOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={variant === "ghost" ? "text-muted-foreground hover:text-destructive" : ""}
        aria-label="מחיקה"
      >
        <Trash2 className="size-4" />
        {label}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        description={description}
        className="max-w-md"
      >
        <div className="flex justify-start gap-2">
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            מחק
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            ביטול
          </Button>
        </div>
      </Modal>
    </>
  );
}
