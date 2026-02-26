import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  availableLanguages,
  dateLocales,
  getHandicapRangeLabel,
  getHandicapRangeText,
  getRoundFormatLabel,
  getRoundStatusLabel,
  type Language,
  translate,
  type TranslateParams,
} from "@/i18n/translations";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  dateLocale: (typeof dateLocales)[Language];
  t: (key: Parameters<typeof translate>[1], params?: TranslateParams) => string;
  formatLabel: (format: string) => string;
  handicapLabel: (range: string) => string;
  handicapRangeText: (min: number, max: number) => string;
  statusLabel: (status: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = "golfconnect-language";

function getBrowserLanguage(): Language {
  const browserLanguage = navigator.language.toLowerCase();
  return browserLanguage.startsWith("fr") ? "fr" : "en";
}

function getInitialLanguage(): Language {
  const savedLanguage = localStorage.getItem(STORAGE_KEY);
  if (savedLanguage && availableLanguages.includes(savedLanguage as Language)) {
    return savedLanguage as Language;
  }
  return getBrowserLanguage();
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      language,
      setLanguage,
      dateLocale: dateLocales[language],
      t: (key, params) => translate(language, key, params),
      formatLabel: (format) => getRoundFormatLabel(format, language),
      handicapLabel: (range) => getHandicapRangeLabel(range, language),
      handicapRangeText: (min, max) => getHandicapRangeText(min, max, language),
      statusLabel: (status) => getRoundStatusLabel(status, language),
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
