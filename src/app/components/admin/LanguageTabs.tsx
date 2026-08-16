interface LanguageTabsProps {
  activeLanguage: "es" | "en";
  onChange: (lang: "es" | "en") => void;
}

export function LanguageTabs({ activeLanguage, onChange }: LanguageTabsProps) {
  return (
    <div className="inline-flex p-1 bg-brand-dark border border-brand-cream/15 rounded-xl select-none">
      <button
        type="button"
        onClick={() => onChange("es")}
        className={`px-4 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
          activeLanguage === "es"
            ? "bg-brand-blush text-brand-ink shadow-xs"
            : "text-brand-cream/60 hover:text-brand-cream hover:bg-brand-cream/5"
        }`}
      >
        <span>🇪🇸</span>
        <span>Español</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("en")}
        className={`px-4 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
          activeLanguage === "en"
            ? "bg-brand-blush text-brand-ink shadow-xs"
            : "text-brand-cream/60 hover:text-brand-cream hover:bg-brand-cream/5"
        }`}
      >
        <span>🇬🇧</span>
        <span>English</span>
      </button>
    </div>
  );
}
