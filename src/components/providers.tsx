"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

// ספקי קונטקסט גלובליים: סשן (NextAuth) + ערכת נושא כהה/בהיר (next-themes)
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
