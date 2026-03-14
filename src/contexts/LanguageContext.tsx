"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fr } from "@/lib/translations/fr";
import { en } from "@/lib/translations/en";
import { ar } from "@/lib/translations/ar";

export type Locale = "fr" | "en" | "ar";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const translations: Record<Locale, any> = { fr, en, ar };

type LanguageContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextType>({
  locale: "fr",
  setLocale: () => {},
  t: (key) => key,
  dir: "ltr",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("vv-locale") as Locale;
    if (saved && ["fr", "en", "ar"].includes(saved)) setLocaleState(saved);
  }, []);

  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
    localStorage.setItem("vv-locale", locale);
  }, [locale]);

  const setLocale = (l: Locale) => setLocaleState(l);

  function t(key: string): string {
    const keys = key.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let val: any = translations[locale];
    for (const k of keys) {
      if (val && typeof val === "object" && k in val) {
        val = val[k];
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let fallback: any = translations["fr"];
        for (const fk of keys) {
          if (fallback && typeof fallback === "object" && fk in fallback) fallback = fallback[fk];
          else return key;
        }
        return typeof fallback === "string" ? fallback : key;
      }
    }
    return typeof val === "string" ? val : key;
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, dir: locale === "ar" ? "rtl" : "ltr" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
