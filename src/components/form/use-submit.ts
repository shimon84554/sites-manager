"use client";

import { useState } from "react";

interface SubmitState {
  loading: boolean;
  errors: Record<string, string>;
  formError: string | null;
}

// hook קטן לשליחת טפסים: ממפה שגיאות Zod מהשרת לשדות, ומנהל מצב טעינה.
export function useSubmit() {
  const [state, setState] = useState<SubmitState>({
    loading: false,
    errors: {},
    formError: null,
  });

  async function submit(
    url: string,
    method: "POST" | "PATCH" | "DELETE",
    body?: unknown,
    onSuccess?: (data: any) => void
  ): Promise<boolean> {
    setState({ loading: true, errors: {}, formError: null });
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errors: Record<string, string> = {};
        if (Array.isArray(data?.issues)) {
          for (const issue of data.issues) {
            errors[issue.field] = issue.message;
          }
        }
        setState({
          loading: false,
          errors,
          formError: data?.error || "אירעה שגיאה. נסה שוב.",
        });
        return false;
      }

      setState({ loading: false, errors: {}, formError: null });
      onSuccess?.(data);
      return true;
    } catch {
      setState({
        loading: false,
        errors: {},
        formError: "שגיאת רשת — בדוק את החיבור ונסה שוב.",
      });
      return false;
    }
  }

  return { ...state, submit };
}
