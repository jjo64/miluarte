import { createContext, useContext, useEffect, useState } from "react";
import { translations, type TranslationKeys } from "../locales/translations";

type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    if (saved === "es" || saved === "en") return saved;
    // Default to browser language or "es"
    const browserLang = navigator.language.split("-")[0];
    return browserLang === "en" ? "en" : "es";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    // Sync html tag lang attribute
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (path: string): any => {
    const parts = path.split(".");
    let current: any = translations[language];
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return path;
      }
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
