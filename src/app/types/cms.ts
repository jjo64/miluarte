export interface GalleryMeta {
  slug: string;          // ej: "ilustracion", "diggin"
  title: string;
  label: string;
  statement: string;
  accent: string;        // CSS color o CSS var
  twoColumns?: boolean;
  order: number;         // posición en listas (0-indexed)
  featured?: boolean;    // ¿aparece en home horizontal gallery?
}

export interface Work {
  id: string;            // ej: "mu1", nanoid()
  title: string;
  year: string;
  technique: string;
  size: string;
  price: string;
  available: boolean;
  img: string;           // URL Cloudinary
  publicId?: string;     // Para gestión en Cloudinary
  imgPos: string;        // CSS object-position, ej: "50% 30%"
  gridCol: string;       // Tailwind class, ej: "md:col-span-2"
  aspect: string;        // ratio, ej: "3/2"
  order: number;
  featured?: boolean;    // ¿aparece en galería destacada de home?
}

export interface RenderProcessStep {
  src: string;
  label: string;
  publicId?: string;
}

export interface RenderItem {
  id: string;
  title: string;
  client: string;
  year: string;
  badge: string;
  software: string[];
  delivery: string;
  description: string;
  img: string;
  publicId?: string;
  videoSrcMp4?: string;
  videoSrcWebm?: string;
  process: RenderProcessStep[];
  makingOfVideoMp4?: string;
  makingOfVideoWebm?: string;
  order: number;
}

export interface SiteTexts {
  es: Record<string, any>;
  en: Record<string, any>;
}

export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
  behance?: string;
  tiktok?: string;
  twitter?: string;
}

export interface ChangelogEntry {
  id: string;
  timestamp: string;     // ISO 8601
  action: string;        // "Subió 3 fotos a Ilustración"
  section: "galleries" | "works" | "renders" | "texts" | "social" | "messages" | "system";
}

export interface ContactMessage {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  read: boolean;
  type: "contact" | "booking";
  details?: Record<string, any>;
}

export interface CmsBackup {
  exportedAt: string;
  version: string;
  galleries: GalleryMeta[];
  works: Record<string, Work[]>;
  renders: RenderItem[];
  texts: SiteTexts;
  social: SocialLinks;
  changelog: ChangelogEntry[];
  messages: {
    contact: ContactMessage[];
    booking: ContactMessage[];
  };
}
