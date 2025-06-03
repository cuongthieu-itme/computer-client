// src/contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { allLocales, LanguageResources } from "../locales";

export type Language = "en" | "ms" | "zh-CN";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const storedLang = localStorage.getItem("appLanguage") as Language | null;
    return storedLang && (storedLang === "en" || storedLang === "ms" || storedLang === "zh-CN") ? storedLang : "ms";
  });

  const [loadedTranslations] = useState<Record<string, LanguageResources>>(allLocales);

  useEffect(() => {
    localStorage.setItem("appLanguage", language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const keyParts = key.split("."); // e.g., ["pages", "Index", "welcome.badge.officialPlatform"]
    const currentLangKey = language as keyof typeof loadedTranslations;
    const fallbackLangKey = "ms" as keyof typeof loadedTranslations;

    const currentLanguageResourceSet = loadedTranslations[currentLangKey] || loadedTranslations[fallbackLangKey];
    const fallbackLanguageResourceSet = loadedTranslations[fallbackLangKey];

    let translatedString: string | undefined;

    // Revised findTranslation:
    // - It takes the full resource set for the language.
    // - It takes all key parts.
    // - It navigates through the resource set using the initial parts to get to the correct "file content" object.
    // - Then, it uses the remaining part(s) of the key (joined back together if necessary) to look up in that file content.
    const findTranslation = (resources: LanguageResources | undefined, parts: string[]): string | undefined => {
      if (!resources) return undefined;
      let currentObject: any = resources; // Starts with the full LanguageResources object { common: {}, pages: {}, components: {} }
      let finalKeyToLookup: string;

      // Determine how many parts are for navigation vs. the final key
      // This logic assumes:
      // 1 part: common.someKey -> currentObject = resources.common, finalKeyToLookup = "someKey"
      // 2 parts: pages.Index -> (If this was a direct key, it might be in resources.pages itself, or parts[1] is the key in resources.pages)
      // 3+ parts: pages.Index.some.key -> currentObject = resources.pages.Index, finalKeyToLookup = "some.key"
      //            components.Navbar.title -> currentObject = resources.components.Navbar, finalKeyToLookup = "title"

      if (parts.length === 0) return undefined;

      if (parts[0] === "common" && parts.length > 1) {
        currentObject = resources.common;
        finalKeyToLookup = parts.slice(1).join("."); // e.g., "login" or "error.network"
      } else if (parts[0] === "pages" && parts.length > 2) {
        currentObject = resources.pages?.[parts[1]]; // e.g., resources.pages.Index
        finalKeyToLookup = parts.slice(2).join("."); // e.g., "welcome.badge.officialPlatform"
      } else if (parts[0] === "components" && parts.length > 2) {
        currentObject = resources.components?.[parts[1]]; // e.g., resources.components.Navbar
        finalKeyToLookup = parts.slice(2).join("."); // e.g., "title"
      } else {
        // This case might be for keys directly under common or if the path is shorter.
        // Or it indicates a key structure we haven't explicitly handled, potentially leading to fallback.
        // For a key like "pages.Index.somekey", keyParts = ["pages", "Index", "somekey"]
        // parts[0] = "pages", parts[1] = "Index" (the file/object name)
        // finalKeyToLookup should be parts.slice(2).join('.')
        // Let's refine the navigation to be more general:
        let pathDepth = 0;
        if (parts[0] === "common") {
          currentObject = resources.common;
          pathDepth = 1;
        } else if (parts[0] === "pages" && resources.pages && parts.length > 1 && parts[1] in resources.pages) {
          currentObject = resources.pages[parts[1]];
          pathDepth = 2;
        } else if (parts[0] === "components" && resources.components && parts.length > 1 && parts[1] in resources.components) {
          currentObject = resources.components[parts[1]];
          pathDepth = 2;
        } else {
          // If the first part is not common, pages, or components, or the structure is unexpected
          // We might be trying to lookup a key that doesn't fit the common/pages/components pattern.
          // Or it's a very short key like "common.myKey" which the above should handle.
          // This path means we couldn't identify a specific sub-object (like pages.Index).
          // So, we'll try to look up the whole key from the root (less likely for your structure).
          // For now, if it doesn't match the main categories, assume the key is meant to be looked up directly,
          // or it's an unhandled structure leading to fallback.
          // To keep it simple, if it's not common/pages/components, it will likely fail and use the key.
          // This part could be more robust based on all possible key structures.
          // For your logged key "pages.Index.welcome.badge.officialPlatform", it should take the `pages` path.
          if (!currentObject || typeof currentObject !== "object") return undefined;
          finalKeyToLookup = parts.join("."); // Attempt to use the full key if no specific category matched
          // The logic below this block handles the actual lookup
        }

        finalKeyToLookup = parts.slice(pathDepth).join(".");
      }

      if (currentObject && typeof currentObject === "object" && Object.prototype.hasOwnProperty.call(currentObject, finalKeyToLookup)) {
        return currentObject[finalKeyToLookup];
      }

      return undefined;
    };

    translatedString = findTranslation(currentLanguageResourceSet, keyParts);

    if (translatedString === undefined && language !== fallbackLangKey) {
      // console.warn(`Translation for '${key}' in '${language}' not found. Trying fallback '${fallbackLangKey}'.`);
      translatedString = findTranslation(fallbackLanguageResourceSet, keyParts);
    }

    if (translatedString === undefined) {
      // console.warn(`Translation for '${key}' ('${keyParts.join('/')}') not found. Using key itself as fallback.`);
      translatedString = key;
    }

    if (replacements && translatedString !== key) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        translatedString = (translatedString as string).replace(new RegExp(`{{${placeholder}}}`, "g"), String(value));
      });
    }

    // console.log(`Translation for key '${key}' in language '${language}': ${translatedString}`);
    return translatedString as string;
  };

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
