import { useState } from "react";
import { Plus, X } from "lucide-react";

interface TagEditorProps {
  tags: string[];
  onChange: (newTags: string[]) => void;
  label?: string;
  placeholder?: string;
}

export function TagEditor({
  tags = [],
  onChange,
  label = "Etiquetas",
  placeholder = "Escribe y presiona Enter o Añadir",
}: TagEditorProps) {
  const [inputVal, setInputVal] = useState("");

  const handleAdd = () => {
    const trimmed = inputVal.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputVal("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="flex flex-col gap-2 select-none">
      {label && (
        <span className="font-sans text-brand-cream/70 text-[11px] tracking-wider uppercase font-medium">
          {label}
        </span>
      )}

      {/* Tags pill list */}
      <div className="flex flex-wrap gap-2 min-h-[32px] p-2 bg-brand-bg/80 border border-brand-cream/15 rounded-xl">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-dark border border-brand-cream/15 text-xs text-brand-cream font-sans animate-fadeIn"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="text-brand-cream/40 hover:text-brand-orange transition-colors p-0.5"
              aria-label={`Eliminar ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {tags.length === 0 && (
          <span className="font-sans text-xs text-brand-cream/40 p-1 italic">
            No hay elementos añadidos aún
          </span>
        )}
      </div>

      {/* Input to add */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-brand-bg border border-brand-cream/15 rounded-xl px-3.5 py-2 text-brand-cream text-xs focus:border-brand-blush outline-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-2 rounded-xl bg-brand-cream/10 hover:bg-brand-blush text-brand-cream hover:text-brand-ink text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Añadir</span>
        </button>
      </div>
    </div>
  );
}
