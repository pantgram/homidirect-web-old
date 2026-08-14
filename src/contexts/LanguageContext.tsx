import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import en from "@/locales/en.json";
import el from "@/locales/el.json";

type Language = "en" | "el";

const translations = { en, el } as const;

export type TranslationKey = keyof (typeof translations)["en"];

interface LanguageContextType {
  language: Language;
  locale: string;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  /** Translate and interpolate `{placeholder}` tokens. */
  tt: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return saved === "en" || saved === "el" ? saved : "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language][key] || key;
    },
    [language],
  );

  const tt = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      let str = translations[language][key] || key;
      if (params) {
        for (const [token, value] of Object.entries(params)) {
          str = str.replace(new RegExp(`\\{${token}\\}`, "g"), String(value));
        }
      }
      return str;
    },
    [language],
  );

  const locale = language === "el" ? "el-GR" : "en-US";

  return (
    <LanguageContext.Provider value={{ language, locale, setLanguage, t, tt }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
