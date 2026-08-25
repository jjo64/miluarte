import { GalleryMeta } from "../../types/cms";
import { Images, Edit3, Trash2, ArrowRight, Star, Image as ImageIcon, Camera } from "lucide-react";
import { getOptimizedImageUrl } from "../../utils/cloudinary";

interface GalleryCardProps {
  gallery: GalleryMeta;
  worksCount?: number;
  onOpen: () => void;
  onEditMeta: () => void;
  onDelete: () => void;
  onChangeCover?: () => void;
  isReorderMode?: boolean;
}

export function GalleryCard({
  gallery,
  worksCount = 0,
  onOpen,
  onEditMeta,
  onDelete,
  onChangeCover,
  isReorderMode = false,
}: GalleryCardProps) {
  const hasCover = Boolean(gallery.coverImage && gallery.coverImage.trim().length > 0);

  return (
    <div className="rounded-2xl bg-brand-dark border border-brand-cream/10 hover:border-brand-cream/25 transition-all overflow-hidden flex flex-col justify-between group shadow-xl">
      {/* 1. SECCIÓN DE PORTADA VISUAL */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-bg/90 border-b border-brand-cream/10 group/cover">
        {hasCover ? (
          <>
            <img
              src={getOptimizedImageUrl(gallery.coverImage!, 600)}
              alt={`Portada de ${gallery.title}`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/cover:scale-105"
            />
            {/* Gradientes sutiles para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-black/20 to-black/50 pointer-events-none" />

            {/* Badges superiores sobre la foto */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
              <span className="font-sans text-[10px] tracking-wider uppercase font-medium text-brand-cream/90 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 shadow-sm">
                {gallery.label || "Galería"}
              </span>

              {gallery.featured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-blush/25 border border-brand-blush/40 text-[10px] font-sans text-brand-blush font-semibold backdrop-blur-md shadow-sm">
                  <Star className="w-3 h-3 fill-brand-blush" />
                  <span>Destacada</span>
                </span>
              )}
            </div>

            {/* Botón flotante para cambiar portada directamente */}
            {!isReorderMode && onChangeCover && (
              <div className="absolute bottom-3 right-3 z-20">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeCover();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-black/75 hover:bg-brand-blush text-brand-cream hover:text-brand-ink border border-white/20 hover:border-brand-blush text-xs font-medium tracking-wide transition-all duration-300 flex items-center gap-1.5 backdrop-blur-md shadow-lg cursor-pointer hover:scale-105 active:scale-95"
                  title="Cambiar la imagen de portada de esta galería"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Cambiar Portada</span>
                </button>
              </div>
            )}
          </>
        ) : (
          /* Estado sin portada */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-brand-dark/50 to-brand-bg relative">
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${gallery.accent || "#EAA898"} 0%, transparent 70%)`,
              }}
            />

            <div className="w-12 h-12 rounded-2xl bg-brand-cream/5 border border-brand-cream/10 text-brand-cream/40 flex items-center justify-center mb-3">
              <ImageIcon className="w-6 h-6" />
            </div>

            <p className="font-serif italic text-brand-wall text-xs mb-3">Sin imagen de portada</p>

            {!isReorderMode && onChangeCover && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeCover();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-brand-blush/20 hover:bg-brand-blush text-brand-blush hover:text-brand-ink border border-brand-blush/40 text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>+ Asignar Portada</span>
              </button>
            )}
          </div>
        )}

        {/* Línea de acento sutil entre la foto y el contenido */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 z-10 transition-opacity"
          style={{ backgroundColor: gallery.accent || "var(--color-brand-blush)" }}
        />
      </div>

      {/* 2. CONTENIDO Y DATOS DE LA GALERÍA */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-xl text-brand-cream group-hover:text-brand-blush transition-colors mb-2">
            {gallery.title}
          </h3>

          <p className="font-sans text-xs text-brand-cream/60 line-clamp-2 leading-relaxed mb-4">
            {gallery.statement || "Sin descripción artística"}
          </p>
        </div>

        {/* 3. FOOTER INFO Y ACCIONES */}
        <div>
          <div className="flex items-center justify-between pt-4 border-t border-brand-cream/5 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-brand-cream/60 font-sans">
              <Images className="w-4 h-4 text-brand-cream/40" />
              <span>{worksCount} {worksCount === 1 ? "obra" : "obras"}</span>
            </div>

            <span className="font-mono text-[10px] text-brand-cream/40 bg-brand-bg border border-brand-cream/5 px-2 py-0.5 rounded-md">
              /{gallery.slug}
            </span>
          </div>

          {/* Botones de acción */}
          {!isReorderMode && (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpen}
                className="flex-1 py-2.5 px-3 rounded-xl bg-brand-blush/15 hover:bg-brand-blush text-brand-blush hover:text-brand-ink text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Gestionar Obras</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onEditMeta}
                title="Editar información y textos de la galería"
                className="p-2.5 rounded-xl border border-brand-cream/15 text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              {!["ilustracion", "diggin", "animas", "retratos", "pasta-ya", "concept-art", "diseno-grafico", "3d-stands"].includes(gallery.slug) && (
                <button
                  onClick={onDelete}
                  title="Eliminar galería"
                  className="p-2.5 rounded-xl border border-brand-orange/20 text-brand-orange hover:bg-brand-orange/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
