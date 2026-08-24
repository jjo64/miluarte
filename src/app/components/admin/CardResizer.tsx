import { motion } from "motion/react";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  Maximize2, 
  Columns, 
  Square, 
  RectangleHorizontal, 
  RectangleVertical,
  LayoutGrid
} from "lucide-react";
import { getOptimizedImageUrl } from "../../utils/cloudinary";

interface CardResizerProps {
  gridCol: string;
  aspect: string;
  imageUrl?: string;
  title?: string;
  technique?: string;
  year?: string;
  onChange: (updates: { gridCol: string; aspect: string }) => void;
}

const COL_OPTIONS = [
  { value: "md:col-span-4", span: 4, label: "1/3 Ancho", desc: "Estrecho (3 por fila)" },
  { value: "md:col-span-6", span: 6, label: "1/2 Ancho (Mitad)", desc: "Mitad (2 por fila)" },
  { value: "md:col-span-8", span: 8, label: "2/3 Ancho", desc: "Ancho (1 y otro estrecho)" },
  { value: "md:col-span-12", span: 12, label: "Ancho Completo", desc: "Completo (1 por fila)" },
];

const ASPECT_OPTIONS = [
  { value: "3/4", ratio: "3/4", label: "Vertical 3:4", icon: RectangleVertical, desc: "Retratos y personajes" },
  { value: "1/1", ratio: "1/1", label: "Cuadrado 1:1", icon: Square, desc: "Portadas y logos" },
  { value: "3/2", ratio: "3/2", label: "Horizontal 3:2", icon: RectangleHorizontal, desc: "Lienzos y paisajes" },
  { value: "16/9", ratio: "16/9", label: "Panorámico 16:9", icon: Maximize2, desc: "Escenarios y cine" },
];

export function CardResizer({
  gridCol,
  aspect,
  imageUrl,
  title,
  technique,
  year,
  onChange,
}: CardResizerProps) {
  const resolvedGridCol = 
    gridCol === "md:col-span-1" ? "md:col-span-4" :
    gridCol === "md:col-span-2" ? "md:col-span-8" :
    gridCol === "md:col-span-3" ? "md:col-span-12" :
    gridCol || "md:col-span-4";

  const currentSpanIndex = Math.max(0, COL_OPTIONS.findIndex((c) => c.value === resolvedGridCol));
  const currentAspectIndex = Math.max(0, ASPECT_OPTIONS.findIndex((a) => a.value === aspect));

  const handlePrevCol = () => {
    if (currentSpanIndex > 0) {
      onChange({ gridCol: COL_OPTIONS[currentSpanIndex - 1].value, aspect });
    }
  };

  const handleNextCol = () => {
    if (currentSpanIndex < COL_OPTIONS.length - 1) {
      onChange({ gridCol: COL_OPTIONS[currentSpanIndex + 1].value, aspect });
    }
  };

  const handlePrevAspect = () => {
    if (currentAspectIndex > 0) {
      onChange({ gridCol, aspect: ASPECT_OPTIONS[currentAspectIndex - 1].value });
    }
  };

  const handleNextAspect = () => {
    if (currentAspectIndex < ASPECT_OPTIONS.length - 1) {
      onChange({ gridCol, aspect: ASPECT_OPTIONS[currentAspectIndex + 1].value });
    }
  };

  const currentSpan = COL_OPTIONS[currentSpanIndex] || COL_OPTIONS[0];
  const currentAspect = ASPECT_OPTIONS[currentAspectIndex] || ASPECT_OPTIONS[0];

  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl bg-brand-bg/90 border border-brand-cream/10 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-brand-blush" />
          <span className="font-sans text-brand-cream text-xs font-semibold uppercase tracking-wider">
            Tamaño y Proporción en el Mosaico
          </span>
        </div>
        <span className="font-mono text-[10px] text-brand-blush bg-brand-blush/10 px-2 py-0.5 rounded-full border border-brand-blush/20">
          {currentSpan.span} Columna{currentSpan.span > 1 ? "s" : ""} · {currentAspect.value}
        </span>
      </div>

      {/* Contenedor de simulación de Grid interactivo tipo puzzle */}
      <div className="relative p-6 rounded-xl bg-brand-dark/95 border border-brand-cream/10 overflow-hidden flex flex-col items-center justify-center min-h-[260px]">
        {/* Fondo con rejilla guía sutil */}
        <div className="absolute inset-0 grid grid-cols-3 gap-3 p-4 opacity-15 pointer-events-none">
          <div className="border border-dashed border-brand-cream/40 rounded-lg h-full" />
          <div className="border border-dashed border-brand-cream/40 rounded-lg h-full" />
          <div className="border border-dashed border-brand-cream/40 rounded-lg h-full" />
        </div>

        {/* Flechas interactivas en los laterales para expandir/reducir ancho */}
        <button
          type="button"
          onClick={handlePrevCol}
          disabled={currentSpanIndex === 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-brand-dark/90 hover:bg-brand-blush text-brand-cream hover:text-brand-ink disabled:opacity-20 disabled:hover:bg-brand-dark/90 disabled:hover:text-brand-cream border border-brand-cream/15 shadow-xl transition-all cursor-pointer disabled:cursor-not-allowed"
          title="Reducir ancho (menos columnas)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleNextCol}
          disabled={currentSpanIndex === COL_OPTIONS.length - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-brand-dark/90 hover:bg-brand-blush text-brand-cream hover:text-brand-ink disabled:opacity-20 disabled:hover:bg-brand-dark/90 disabled:hover:text-brand-cream border border-brand-cream/15 shadow-xl transition-all cursor-pointer disabled:cursor-not-allowed"
          title="Ampliar ancho (más columnas)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Flechas interactivas arriba/abajo para cambiar proporción */}
        <button
          type="button"
          onClick={handlePrevAspect}
          disabled={currentAspectIndex === 0}
          className="absolute top-2 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-brand-dark/90 hover:bg-brand-blush text-brand-cream hover:text-brand-ink disabled:opacity-20 disabled:hover:bg-brand-dark/90 disabled:hover:text-brand-cream border border-brand-cream/15 shadow-xl transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 text-[10px] font-sans"
          title="Proporción más vertical"
        >
          <ChevronUp className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Más vertical</span>
        </button>

        <button
          type="button"
          onClick={handleNextAspect}
          disabled={currentAspectIndex === ASPECT_OPTIONS.length - 1}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-brand-dark/90 hover:bg-brand-blush text-brand-cream hover:text-brand-ink disabled:opacity-20 disabled:hover:bg-brand-dark/90 disabled:hover:text-brand-cream border border-brand-cream/15 shadow-xl transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 text-[10px] font-sans"
          title="Proporción más apaisada"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Más apaisado</span>
        </button>

        {/* Card miniatura animada en vivo */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          style={{
            aspectRatio: currentAspect.value === "3/4" ? "3/4" : currentAspect.value === "1/1" ? "1/1" : currentAspect.value === "3/2" ? "3/2" : "16/9",
            width:
              currentSpan.span === 4 ? "140px" :
              currentSpan.span === 6 ? "200px" :
              currentSpan.span === 8 ? "260px" :
              "320px",
            maxWidth: "85%",
          }}
          className="relative rounded-xl overflow-hidden bg-brand-bg border-2 border-brand-blush shadow-2xl shadow-brand-blush/20 z-10 flex flex-col justify-end group transition-all"
        >
          {imageUrl ? (
            <img
              src={getOptimizedImageUrl(imageUrl, 400)}
              alt="Vista previa de tamaño"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blush/20 via-brand-dark to-brand-bg flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-brand-blush/40" />
            </div>
          )}

          {/* Overlay simulado del portafolio */}
          <div className="relative z-10 p-3 bg-gradient-to-t from-brand-bg/95 via-brand-bg/70 to-transparent">
            <p className="font-serif text-brand-cream text-xs truncate font-light">
              {title || "Título de la obra"}
            </p>
            <p className="font-sans text-[9px] text-brand-blush truncate">
              {technique || "Técnica"} · {year || "2026"}
            </p>
          </div>

          {/* Badge indicador en esquina */}
          <div className="absolute top-2 right-2 z-10 bg-brand-dark/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-brand-blush/40 text-[9px] font-mono text-brand-blush">
            {currentSpan.span} col · {currentAspect.value}
          </div>
        </motion.div>
      </div>

      {/* Controles directos en cuadrícula táctil / visual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Selector visual de Columnas */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-brand-cream/60 text-[10px] uppercase tracking-wider font-semibold">
            Ancho en el Grid
          </label>
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-brand-dark border border-brand-cream/10">
            {COL_OPTIONS.map((c) => {
              const active = c.value === resolvedGridCol;
              const barCount = c.span === 4 ? 1 : c.span === 6 ? 2 : c.span === 8 ? 3 : 4;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => onChange({ gridCol: c.value, aspect })}
                  className={`py-2 px-1 rounded-lg text-[10px] font-sans flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    active
                      ? "bg-brand-blush text-brand-ink font-semibold shadow-md"
                      : "text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5"
                  }`}
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: barCount }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-3 rounded-xs ${
                          active ? "bg-brand-ink" : "bg-brand-cream/40"
                        }`}
                      />
                    ))}
                  </div>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selector visual de Proporción */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-brand-cream/60 text-[10px] uppercase tracking-wider font-semibold">
            Proporción (Aspect Ratio)
          </label>
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-brand-dark border border-brand-cream/10">
            {ASPECT_OPTIONS.map((a) => {
              const active = a.value === aspect;
              const Icon = a.icon;
              return (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => onChange({ gridCol, aspect: a.value })}
                  className={`py-2 px-1 rounded-lg text-[10px] font-sans flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    active
                      ? "bg-brand-blush text-brand-ink font-semibold shadow-md"
                      : "text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5"
                  }`}
                  title={a.label}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="font-mono text-[9px]">{a.value}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
