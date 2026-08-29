import { useState, useRef } from "react";
import { X, Check, Crosshair } from "lucide-react";
import { getOptimizedImageUrl } from "../../utils/cloudinary";

interface FocalPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  workTitle: string;
  imageUrl: string;
  initialPos?: string;
  onSavePos: (newPos: string) => void;
}

const PRESETS = [
  { label: "↖ Arriba Izq", pos: "20% 20%" },
  { label: "↑ Arriba Centro", pos: "50% 15%" },
  { label: "↗ Arriba Der", pos: "80% 20%" },
  { label: "← Centro Izq", pos: "15% 50%" },
  { label: "⊙ Centro", pos: "50% 50%" },
  { label: "→ Centro Der", pos: "85% 50%" },
  { label: "↙ Abajo Izq", pos: "20% 80%" },
  { label: "↓ Abajo Centro", pos: "50% 85%" },
  { label: "↘ Abajo Der", pos: "80% 80%" },
];

export function FocalPointModal({
  isOpen,
  onClose,
  workTitle,
  imageUrl,
  initialPos = "50% 50%",
  onSavePos,
}: FocalPointModalProps) {
  if (!isOpen) return null;

  // Parse initial position like "50% 30%"
  const parsePos = (str: string) => {
    const parts = str.replace(/%/g, "").trim().split(/\s+/);
    const x = parseFloat(parts[0]) || 50;
    const y = parseFloat(parts[1]) || 50;
    return { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) };
  };

  const [currentPos, setCurrentPos] = useState<{ x: number; y: number }>(() => parsePos(initialPos));
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handlePointerUpdate = (clientX: number, clientY: number) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    const roundedX = Math.round(x);
    const roundedY = Math.round(y);
    setCurrentPos({ x: roundedX, y: roundedY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    handlePointerUpdate(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      handlePointerUpdate(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleApply = () => {
    const posStr = `${currentPos.x}% ${currentPos.y}%`;
    onSavePos(posStr);
    onClose();
  };

  const posString = `${currentPos.x}% ${currentPos.y}%`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none"
      onMouseUp={handleMouseUp}
    >
      <div className="relative w-full max-w-3xl bg-brand-dark border border-brand-cream/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-brand-cream/10 flex items-center justify-between bg-brand-bg/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-blush/20 border border-brand-blush/30 flex items-center justify-center text-brand-blush">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-medium text-brand-cream truncate max-w-md">
                Punto Focal — {workTitle || "Obra"}
              </h3>
              <p className="font-sans text-[11px] text-brand-cream/50">
                Haz clic o arrastra la mira sobre la zona clave que debe quedar centrada al recortar.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-brand-cream/10 text-brand-cream/60 hover:text-brand-cream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col md:flex-row gap-6">
          {/* Main Interactive Image Stage */}
          <div className="flex-1 flex flex-col items-center">
            <div
              ref={imageContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              className="relative max-w-full max-h-[380px] rounded-xl overflow-hidden cursor-crosshair border border-brand-cream/20 shadow-inner group/stage bg-black"
            >
              <img
                src={getOptimizedImageUrl(imageUrl, 900)}
                alt={workTitle}
                className="max-w-full max-h-[380px] object-contain pointer-events-none"
              />

              {/* Grid 3x3 overlay */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-25 group-hover/stage:opacity-40 transition-opacity">
                <div className="border-r border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div />
              </div>

              {/* Bullseye Marker */}
              <div
                className="absolute w-8 h-8 -ml-4 -mt-4 pointer-events-none transition-all duration-75 flex items-center justify-center"
                style={{ left: `${currentPos.x}%`, top: `${currentPos.y}%` }}
              >
                <div className="w-7 h-7 rounded-full border-2 border-brand-blush bg-brand-blush/30 shadow-[0_0_12px_rgba(235,160,140,0.8)] flex items-center justify-center animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-cream shadow-xs" />
                </div>
              </div>
            </div>

            {/* Coordinate display */}
            <div className="mt-3 flex items-center gap-2">
              <span className="font-mono text-xs text-brand-blush bg-brand-blush/10 px-3 py-1 rounded-md border border-brand-blush/20">
                Punto Focal: {posString}
              </span>
            </div>
          </div>

          {/* Sidebar with Presets & Live Crop Previews */}
          <div className="w-full md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-brand-cream/10 md:pl-6 pt-4 md:pt-0">
            <div>
              <p className="font-sans text-xs uppercase tracking-wider text-brand-cream/60 font-semibold mb-2.5">
                Presets Rápidos
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {PRESETS.map((p) => {
                  const active = p.pos === posString;
                  return (
                    <button
                      key={p.pos}
                      type="button"
                      onClick={() => setCurrentPos(parsePos(p.pos))}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-sans text-center transition-all cursor-pointer ${
                        active
                          ? "bg-brand-blush text-brand-ink font-semibold shadow-xs"
                          : "bg-brand-cream/5 hover:bg-brand-cream/10 text-brand-cream/70 hover:text-brand-cream"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Previews under different aspects */}
              <div className="mt-5">
                <p className="font-sans text-xs uppercase tracking-wider text-brand-cream/60 font-semibold mb-2">
                  Vista Previa con Recorte
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {/* 1:1 Preview */}
                  <div>
                    <div className="aspect-square rounded-lg overflow-hidden border border-brand-cream/20 bg-brand-bg">
                      <img
                        src={getOptimizedImageUrl(imageUrl, 300)}
                        alt="1:1"
                        className="w-full h-full object-cover transition-all"
                        style={{ objectPosition: posString }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-brand-cream/40 block text-center mt-1">1:1</span>
                  </div>

                  {/* 3:4 Preview */}
                  <div>
                    <div className="aspect-[3/4] rounded-lg overflow-hidden border border-brand-cream/20 bg-brand-bg">
                      <img
                        src={getOptimizedImageUrl(imageUrl, 300)}
                        alt="3:4"
                        className="w-full h-full object-cover transition-all"
                        style={{ objectPosition: posString }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-brand-cream/40 block text-center mt-1">3:4</span>
                  </div>

                  {/* 16:9 Preview */}
                  <div>
                    <div className="aspect-[16/9] rounded-lg overflow-hidden border border-brand-cream/20 bg-brand-bg">
                      <img
                        src={getOptimizedImageUrl(imageUrl, 300)}
                        alt="16:9"
                        className="w-full h-full object-cover transition-all"
                        style={{ objectPosition: posString }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-brand-cream/40 block text-center mt-1">16:9</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-5 mt-4 border-t border-brand-cream/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl border border-brand-cream/15 text-xs text-brand-cream/70 hover:text-brand-cream transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-1.5 rounded-xl bg-brand-blush hover:bg-brand-cream text-brand-ink text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Aplicar Foco</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
