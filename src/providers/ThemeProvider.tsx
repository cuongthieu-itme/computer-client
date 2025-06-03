
import { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { DesignThemeProvider } from "@/contexts/DesignThemeContext";

// Simple theme provider that uses next-themes under the hood
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Return null instead of children to prevent hydration mismatch
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
    >
      <DesignThemeProvider>{children}</DesignThemeProvider>
    </NextThemesProvider>
  );
}
