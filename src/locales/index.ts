// src/locales/index.ts
export interface CommonTranslations {
  [key: string]: string;
}

export interface ComponentTranslations {
  [componentName: string]: { [key: string]: string };
}

export interface PageTranslations {
  [pageName: string]: { [key: string]: string };
}

export interface LanguageResources {
  common: CommonTranslations;
  components?: ComponentTranslations;
  pages?: PageTranslations;
}

// --- English Translations ---
import enCommon from "./en/common.json";
import enIndexPage from "./en/pages/Index.json";
import enNavbar from "./en/components/Navbar.json";
import enFooter from "./en/components/Footer.json";
import enAuthPage from "./en/pages/AuthPage.json";

// --- Bahasa Malaysia Translations ---
import msCommon from "./ms/common.json";
import msIndexPage from "./ms/pages/Index.json";
import msNavbar from "./ms/components/Navbar.json";
import msFooter from "./ms/components/Footer.json";
import msAuthPage from "./ms/pages/AuthPage.json";

// --- Chinese Translations (Simplified) ---
import zhCNCommon from "./zh-CN/common.json";
import zhCNIndexPage from "./zh-CN/pages/Index.json";
import zhCNNavbar from "./zh-CN/components/Navbar.json";
import zhCNFooter from "./zh-CN/components/Footer.json";
import zhCNAuthPage from "./zh-CN/pages/AuthPage.json";

const enCommonTyped = enCommon as CommonTranslations;
const msCommonTyped = msCommon as CommonTranslations;
const zhCNCommonTyped = zhCNCommon as CommonTranslations;

export const enResources: LanguageResources = {
  common: enCommonTyped,
  components: { Navbar: enNavbar as ComponentTranslations["Navbar"], Footer: enFooter as ComponentTranslations["Footer"] },
  pages: { Index: enIndexPage as PageTranslations["Index"], AuthPage: enAuthPage as PageTranslations["AuthPage"] },
};

export const msResources: LanguageResources = {
  common: msCommonTyped,
  components: { Navbar: msNavbar as ComponentTranslations["Navbar"], Footer: msFooter as ComponentTranslations["Footer"] },
  pages: { Index: msIndexPage as PageTranslations["Index"], AuthPage: msAuthPage as PageTranslations["AuthPage"] },
};

export const zhCNResources: LanguageResources = {
  common: zhCNCommonTyped,
  components: { Navbar: zhCNNavbar as ComponentTranslations["Navbar"], Footer: zhCNFooter as ComponentTranslations["Footer"] },
  pages: { Index: zhCNIndexPage as PageTranslations["Index"], AuthPage: zhCNAuthPage as PageTranslations["AuthPage"] },
};

export const allLocales: Record<string, LanguageResources> = {
  en: enResources,
  ms: msResources,
  "zh-CN": zhCNResources,
};
