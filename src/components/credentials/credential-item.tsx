"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Check, KeyRound, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/delete-button";
import { CREDENTIAL_TYPE, type CredentialType } from "@/lib/constants";

export interface CredentialItemData {
  id: string;
  label: string;
  type: string;
  username: string | null;
  url: string | null;
  notes: string | null;
}

export function CredentialItem({
  cred,
  siteName,
}: {
  cred: CredentialItemData;
  siteName?: string;
}) {
  const [secret, setSecret] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function reveal() {
    if (shown) {
      setShown(false);
      return;
    }
    if (secret) {
      setShown(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/credentials/${cred.id}/reveal`);
      const data = await res.json();
      if (res.ok && data.secret != null) {
        setSecret(data.secret);
        setShown(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!secret) {
      const res = await fetch(`/api/credentials/${cred.id}/reveal`);
      const data = await res.json();
      if (res.ok) setSecret(data.secret);
      if (data.secret) await navigator.clipboard.writeText(data.secret);
    } else {
      await navigator.clipboard.writeText(secret);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <KeyRound className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium">{cred.label}</span>
          <Badge variant="muted">
            {CREDENTIAL_TYPE[cred.type as CredentialType] ?? cred.type}
          </Badge>
          {siteName && (
            <span className="truncate text-xs text-muted-foreground">· {siteName}</span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground" dir="ltr">
          {cred.username && <span>👤 {cred.username}</span>}
          {cred.url && <span className="truncate">🔗 {cred.url}</span>}
        </div>
        {/* הסוד — מוסתר עד לחיצה */}
        <div className="mt-1.5 font-mono text-sm" dir="ltr">
          {shown && secret ? (
            <span className="rounded bg-muted px-2 py-0.5">{secret}</span>
          ) : (
            <span className="tracking-widest text-muted-foreground">••••••••••</span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="icon" onClick={reveal} disabled={loading} aria-label="הצג/הסתר">
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : shown ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={copy} aria-label="העתק">
          {copied ? <Check className="size-4 text-ok" /> : <Copy className="size-4" />}
        </Button>
        <DeleteButton
          url={`/api/credentials/${cred.id}`}
          title={`למחוק את "${cred.label}"?`}
          description="פריט הגישה יימחק לצמיתות."
        />
      </div>
    </div>
  );
}
