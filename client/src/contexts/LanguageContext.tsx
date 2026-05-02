import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  defaultLocale,
  getLocaleDirection,
  localeMeta,
  resolveInitialLocale,
  supportedLocales,
  t,
  type Locale,
  type TranslationKey,
} from "@/lib/i18n";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  locales: typeof supportedLocales;
  localeMeta: typeof localeMeta;
  dir: ReturnType<typeof getLocaleDirection>;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
};

const STORAGE_KEY = "samploop.locale";

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  return resolveInitialLocale(window.localStorage.getItem(STORAGE_KEY));
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getStoredLocale());

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = getLocaleDirection(locale);
  }, [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      locales: supportedLocales,
      localeMeta,
      dir: getLocaleDirection(locale),
      t: (key, params) => t(locale, key, params),
    }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
