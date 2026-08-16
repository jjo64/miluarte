import { GalleryMeta } from "../../types/cms";
import { Images, Edit3, Trash2, ArrowRight, Star } from "lucide-react";
import { motion } from "motion/react";

interface GalleryCardProps {
  gallery: GalleryMeta;
  worksCount?: number;
  onOpen: () => void;
  onEditMeta: () => void;
  onDelete: () => void;
  isReorderMode?: boolean;
}

export function GalleryCard({
  gallery,
  worksCount = 0,
  onOpen,
  onEditMeta,
  onDelete,
  isReorderMode = false,
}: GalleryCardProps) {
  return (
    <div className="rounded-2xl bg-brand-dark border border-brand-cream/10 hover:border-brand-cream/25 transition-all overflow-hidden flex flex-col justify-between group">
      {/* Header / Accent bar */}
      <div
        className="h-2 w-full transition-opacity"
        style={{ backgroundColor: gallery.accent || "var(--color-brand-blush)" }}
      />

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Top badges */}
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-[10px] tracking-wider uppercase text-brand-cream/50">
              {gallery.label || "Galería"}
            </span>

            {gallery.featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-blush/10 border border-brand-blush/20 text-[9px] font-sans text-brand-blush">
                <Star className="w-3 h-3 fill-brand-blush" />
                <span>Destacada</span>
              </span>
            )}
          </div>

          <h3 className="font-serif text-xl text-brand-cream group-hover:text-brand-blush transition-colors mb-2">
            {gallery.title}
          </h3>

          <p className="font-sans text-xs text-brand-cream/60 line-clamp-2 leading-relaxed mb-4">
            {gallery.statement || "Sin descripción"}
          </p>
        </div>

        {/* Footer info & actions */}
        <div>
          <div className="flex items-center justify-between pt-4 border-t border-brand-cream/5 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-brand-cream/60 font-sans">
              <Images className="w-4 h-4 text-brand-cream/40" />
              <span>{worksCount} obras</span>
            </div>

            <span className="font-mono text-[10px] text-brand-cream/30 bg-brand-bg px-2 py-0.5 rounded-md">
              /{gallery.slug}
            </span>
          </div>

          {/* Action buttons */}
          {!isReorderMode && (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpen}
                className="flex-1 py-2 px-3 rounded-xl bg-brand-blush/15 hover:bg-brand-blush text-brand-blush hover:text-brand-ink text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Ver Obras</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onEditMeta}
                title="Editar información"
                className="p-2 rounded-xl border border-brand-cream/15 text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={onDelete}
                title="Eliminar galería"
                className="p-2 rounded-xl border border-brand-orange/20 text-brand-orange hover:bg-brand-orange/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
