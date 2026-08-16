import { Work } from "../../types/cms";
import { Edit3, Trash2, Star, Eye } from "lucide-react";
import { getOptimizedImageUrl } from "../../utils/cloudinary";

interface WorkCardProps {
  work: Work;
  onEdit: () => void;
  onDelete: () => void;
  isReorderMode?: boolean;
}

export function WorkCard({ work, onEdit, onDelete, isReorderMode = false }: WorkCardProps) {
  return (
    <div className="group relative rounded-2xl bg-brand-dark border border-brand-cream/10 hover:border-brand-blush/40 transition-all overflow-hidden flex flex-col select-none">
      {/* Image container */}
      <div className="relative w-full aspect-square bg-brand-bg overflow-hidden">
        <img
          src={getOptimizedImageUrl(work.img, 400)}
          alt={work.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ objectPosition: work.imgPos || "50% 50%" }}
        />

        {/* Featured badge */}
        {work.featured && (
          <div className="absolute top-2.5 left-2.5 z-10 bg-brand-dark/90 backdrop-blur-xs border border-brand-blush/40 px-2 py-0.5 rounded-full flex items-center gap-1 text-[9px] font-sans text-brand-blush">
            <Star className="w-3 h-3 fill-brand-blush" />
            <span>Destacada</span>
          </div>
        )}

        {/* Hover overlay with action buttons */}
        {!isReorderMode && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
            <button
              onClick={onEdit}
              className="p-2.5 rounded-xl bg-brand-blush hover:bg-brand-cream text-brand-ink transition-colors shadow-lg cursor-pointer"
              title="Editar detalles"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white transition-colors shadow-lg cursor-pointer"
              title="Eliminar obra"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Info details */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          <h4 className="font-serif text-sm text-brand-cream truncate font-light mb-0.5">
            {work.title || "Sin título"}
          </h4>
          <p className="font-sans text-[11px] text-brand-cream/50 truncate">
            {work.technique || "Digital"} · {work.year}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-brand-cream/5 text-[10px] font-sans">
          <span
            className={`font-medium ${
              work.available ? "text-emerald-400" : "text-brand-cream/40"
            }`}
          >
            {work.available ? "Disponible" : "No disponible"}
          </span>
          <span className="text-brand-blush font-medium">{work.price || "—"}</span>
        </div>
      </div>
    </div>
  );
}
