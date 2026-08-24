import { createContext, useContext, useEffect, useState } from "react";
import { translations, type TranslationKeys } from "../locales/translations";

type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => any;
}

function deepMerge(target: any, source: any): any {
  if (typeof target !== "object" || target === null) return source;
  if (typeof source !== "object" || source === null) return target;

  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!(key in target)) {
        Object.assign(output, { [key]: source[key] });
      } else {
        output[key] = deepMerge(target[key], source[key]);
      }
    } else {
      Object.assign(output, { [key]: source[key] });
    }
  }
  return output;
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

  const [activeTranslations, setActiveTranslations] = useState<typeof translations>(() => translations);

  useEffect(() => {
    let isMounted = true;

    async function loadDynamicTexts() {
      try {
        const res = await fetch("/api/admin/texts");
        if (res.ok) {
          const remoteTexts = await res.json();
          if (remoteTexts && isMounted) {
            const merged = {
              ...remoteTexts,
              es: deepMerge(translations.es, remoteTexts.es || {}),
              en: deepMerge(translations.en, remoteTexts.en || {}),
            };
            setActiveTranslations(merged as any);
          }
        }
      } catch (e) {
        // Fallback a traducciones estáticas
      }
    }

    loadDynamicTexts();

    return () => {
      isMounted = false;
    };
  }, []);

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

    // 1. Buscar en el idioma activo (es o en)
    let current: any = activeTranslations[language];
    let found = true;
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        found = false;
        break;
      }
    }
    if (found && current !== undefined && current !== null && current !== "") {
      return current;
    }

    // 2. Fallback al español si el idioma actual es inglés
    if (language !== "es") {
      let esCurrent: any = activeTranslations.es;
      let esFound = true;
      for (const part of parts) {
        if (esCurrent && typeof esCurrent === "object" && part in esCurrent) {
          esCurrent = esCurrent[part];
        } else {
          esFound = false;
          break;
        }
      }
      if (esFound && esCurrent !== undefined && esCurrent !== null && esCurrent !== "") {
        return esCurrent;
      }
    }

    // 3. Buscar en la raíz de activeTranslations (para resumePhoto, heroImage, animasSlides, servicesImages, etc.)
    let rootCurrent: any = activeTranslations;
    let rootFound = true;
    for (const part of parts) {
      if (rootCurrent && typeof rootCurrent === "object" && part in rootCurrent) {
        rootCurrent = rootCurrent[part];
      } else {
        rootFound = false;
        break;
      }
    }
    if (rootFound && rootCurrent !== undefined && rootCurrent !== null && rootCurrent !== "") {
      return rootCurrent;
    }

    // Devolver undefined para permitir fallbacks limpios con ||
    return undefined;
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
