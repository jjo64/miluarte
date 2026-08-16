import { GalleryMeta, Work, RenderItem, SiteTexts, SocialLinks } from "../../../src/app/types/cms";
import { META, WORKS_BY_SLUG, CollectionMeta } from "../../../src/app/data/portfolioData";
import { RENDERS } from "../../../src/app/data/rendersData";
import { translations } from "../../../src/app/locales/translations";

export const BASE_GALLERY_SLUGS = new Set([
  "ilustracion",
  "diggin",
  "concept-art",
  "diseno-grafico",
  "3d-stands",
  "animas",
  "retratos",
  "pasta-ya",
]);

export function getBaseGalleries(): GalleryMeta[] {
  return Object.entries(META).map(([slug, meta], index) => ({
    slug,
    title: meta.title,
    label: meta.label,
    statement: meta.statement,
    accent: meta.accent,
    twoColumns: meta.twoColumns || false,
    order: index,
    featured: ["ilustracion", "concept-art", "diggin", "animas"].includes(slug),
  }));
}

export { META, WORKS_BY_SLUG, RENDERS, translations };
export type { CollectionMeta, Work, RenderItem, SiteTexts, SocialLinks, GalleryMeta };
