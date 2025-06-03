
import React, { createContext, useContext, useEffect, useState } from "react";

type DesignTheme = "typeA" | "typeB" | "typeC";

interface DesignThemeContextType {
  designTheme: DesignTheme;
  setDesignTheme: (theme: DesignTheme) => void;
}

const DesignThemeContext = createContext<DesignThemeContextType | undefined>(undefined);

export function DesignThemeProvider({ children }: { children: React.ReactNode }) {
  const [designTheme, setDesignTheme] = useState<DesignTheme>("typeC");
  const [mounted, setMounted] = useState(false);

  // Store the theme preference in localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("design-theme", designTheme);
      document.documentElement.setAttribute("data-design-theme", designTheme);
    }
  }, [designTheme, mounted]);

  // Load the theme preference from localStorage
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("design-theme") as DesignTheme | null;
    if (savedTheme) {
      setDesignTheme(savedTheme);
    }
  }, []);

  const contextValue = {
    designTheme,
    setDesignTheme,
  };

  return (
    <DesignThemeContext.Provider value={contextValue}>
      {children}
    </DesignThemeContext.Provider>
  );
}

export function useDesignTheme() {
  const context = useContext(DesignThemeContext);
  if (context === undefined) {
    throw new Error("useDesignTheme must be used within a DesignThemeProvider");
  }
  return context;
}
