import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowUpRight, Sparkles, FolderArchive } from "lucide-react";
import { ease, staggerContainer, staggerItem } from "../tokens";
import { SharedFooter } from "../components/SharedFooter";
import { useLanguage } from "../context/LanguageContext";
import { getOptimizedImageUrl } from "../utils/cloudinary";
import { META, WORKS_BY_SLUG } from "./CollectionPage";
import { GalleryMeta } from "../types/cms";

// Fallback por si la galería no tiene obras todavía
const DEFAULT_COVER = "https://res.cloudinary.com/doznr2qm4/image/upload/v1781821775/musae_dkbruz.jpg";

const STATIC_THUMBNAILS: Record<string, string> = {
  ilustracion: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781821775/musae_dkbruz.jpg",
  diggin: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811474/Tom_Hodges_-_Smokin_On_EP_eflsuv.jpg",
  animas: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820062/1_Melisa_Completo_nwlyro.jpg",
  retratos: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820993/2-Retrato-Anna-Karina_cb505e.jpg",
  "pasta-ya": "https://res.cloudinary.com/doznr2qm4/image/upload/v1781821171/Bravioli-el-bravo-y-Tortastini_m1owbr.jpg",
  "concept-art": "https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/533637781_18320483821235254_4718922861619683556_n_ddrhz1.jpg",
  "diseno-grafico": "https://res.cloudinary.com/doznr2qm4/image/upload/v1781819798/Kreativit%C3%A4t_Schreibkunst_mzvltr.jpg",
};

interface GalleryWithCount extends GalleryMeta {
  worksCount: number;
  coverImage: string;
}

export function CollectionsPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [galleries, setGalleries] = useState<GalleryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = language === "es" ? "Todas las Colecciones | Miluarte" : "All Collections | Miluarte";
    window.scrollTo(0, 0);
  }, [language]);

  useEffect(() => {
    let isMounted = true;

    async function loadAllGalleries() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/galleries");
        let remoteGalleries: GalleryMeta[] = [];

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            remoteGalleries = data;
          }
        }

        // Si no hay datos de la API, fallback estático
        if (remoteGalleries.length === 0) {
          remoteGalleries = Object.entries(META).map(([slug, meta], idx) => ({
            slug,
            title: meta.title,
            label: meta.label,
            statement: meta.statement,
            accent: meta.accent,
            twoColumns: meta.twoColumns,
            order: idx,
            featured: true,
          }));
        }

        // Cargar obras/portadas de cada una
        const fullGalleries: GalleryWithCount[] = await Promise.all(
          remoteGalleries.map(async (g) => {
            let count = 0;
            let cover = STATIC_THUMBNAILS[g.slug] || DEFAULT_COVER;

            try {
              const worksRes = await fetch(`/api/admin/works?slug=${g.slug}`);
              if (worksRes.ok) {
                const worksData = await worksRes.json();
                if (Array.isArray(worksData)) {
                  count = worksData.length;
                  if (worksData.length > 0 && worksData[0].img) {
                    cover = worksData[0].img;
                  }
                }
              }
            } catch {
              if (WORKS_BY_SLUG[g.slug]) {
                count = WORKS_BY_SLUG[g.slug].length;
                cover = WORKS_BY_SLUG[g.slug][0]?.img || cover;
              }
            }

            return {
              ...g,
              worksCount: count,
              coverImage: cover,
            };
          })
        );

        if (isMounted) {
          setGalleries(fullGalleries);
        }
      } catch (e) {
        console.warn("Error cargando colecciones:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAllGalleries();

    return () => {
      isMounted = false;
    };
  }, []);

  const getLocalizedTitle = (slug: string, fallback: string) => {
    const key = `collection.meta.${slug}.title`;
    const res = t(key);
    return res && res !== key ? res : fallback;
  };

  const getLocalizedLabel = (slug: string, fallback: string) => {
    const key = `collection.meta.${slug}.label`;
    const res = t(key);
    return res && res !== key ? res : fallback;
  };

  const getLocalizedStatement = (slug: string, fallback: string) => {
    const key = `collection.meta.${slug}.statement`;
    const res = t(key);
    return res && res !== key ? res : fallback;
  };

  return (
    <div className="bg-brand-bg text-brand-cream min-h-screen select-none">
      {/* ── Header Editorial ── */}
      <section className="pt-32 pb-16 px-6 md:px-10 max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="flex items-center gap-2 mb-4"
        >
          <div className="w-8 h-0.5 bg-brand-blush" />
          <p className="font-sans text-[10px] tracking-[0.34em] uppercase text-brand-blush font-semibold">
            {language === "es" ? "ARCHIVO ARTÍSTICO" : "ARTISTIC ARCHIVE"}
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
          className="font-serif text-brand-cream text-[3.2rem] md:text-[6.5rem] font-light leading-[0.95] tracking-tight mb-6"
        >
          {language === "es" ? "Todas las Colecciones" : "All Collections"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
          className="font-sans text-brand-cream/60 text-xs md:text-sm leading-relaxed max-w-[620px]"
        >
          {language === "es"
            ? "Explora el cuerpo de obra completo de Nerea Lucas Pajares: series de ilustración personal, dirección de arte musical, biblia visual de personajes y proyectos de encargo."
            : "Explore the complete body of work by Nerea Lucas Pajares: personal illustration series, musical art direction, visual character bible, and commissioned projects."}
        </motion.p>
      </section>

      {/* ── Grid de Colecciones ── */}
      <section className="pb-28 px-6 md:px-10 max-w-[1200px] mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-2xl bg-brand-dark/50 border border-brand-cream/5 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
          >
            {galleries.map((gallery) => {
              const title = getLocalizedTitle(gallery.slug, gallery.title);
              const label = getLocalizedLabel(gallery.slug, gallery.label);
              const statement = getLocalizedStatement(gallery.slug, gallery.statement);

              return (
                <motion.div
                  key={gallery.slug}
                  variants={staggerItem}
                  onClick={() => navigate(`/coleccion/${gallery.slug}`)}
                  className="group relative cursor-pointer flex flex-col bg-brand-dark border border-brand-cream/10 hover:border-brand-blush/40 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5"
                >
                  {/* Imagen de Portada con Zoom */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
                    <img
                      src={getOptimizedImageUrl(gallery.coverImage, 800)}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-108 group-hover:brightness-[0.88]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-80" />

                    {/* Tag / Badge en esquina */}
                    <div className="absolute top-4 left-4">
                      <span
                        className="px-3 py-1 rounded-full text-[9px] font-sans font-semibold uppercase tracking-widest backdrop-blur-md shadow-md"
                        style={{
                          backgroundColor: "rgba(13, 9, 8, 0.75)",
                          color: gallery.accent || "var(--color-brand-blush)",
                          border: `1px solid ${gallery.accent ? `${gallery.accent}40` : "rgba(234, 168, 152, 0.3)"}`,
                        }}
                      >
                        {label}
                      </span>
                    </div>

                    {/* Conteo de Obras en esquina derecha */}
                    <div className="absolute top-4 right-4">
                      <span className="px-2.5 py-1 rounded-md text-[9px] font-sans font-bold uppercase tracking-wider bg-black/60 text-brand-cream/80 border border-brand-cream/10 backdrop-blur-md">
                        {gallery.worksCount} {gallery.worksCount === 1 ? "obra" : "obras"}
                      </span>
                    </div>
                  </div>

                  {/* Cuerpo de la Tarjeta */}
                  <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h2 className="font-serif text-2xl md:text-3xl text-brand-cream font-light group-hover:text-brand-blush transition-colors duration-300">
                          {title}
                        </h2>
                        <div className="w-8 h-8 rounded-full border border-brand-cream/15 flex items-center justify-center text-brand-cream/50 group-hover:text-brand-ink group-hover:bg-brand-blush group-hover:border-brand-blush transition-all duration-300 flex-shrink-0">
                          <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </div>

                      {statement && (
                        <p className="font-sans text-xs text-brand-cream/55 leading-relaxed line-clamp-2 mt-2">
                          {statement}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-brand-cream/5 flex items-center justify-between text-xs text-brand-cream/40 group-hover:text-brand-blush transition-colors">
                      <span className="font-sans text-[11px] tracking-wider uppercase font-medium">
                        {language === "es" ? "Explorar galería" : "Explore gallery"}
                      </span>
                      <span className="font-mono text-xs">/coleccion/{gallery.slug}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* ── Footer ── */}
      <SharedFooter />
    </div>
  );
}
