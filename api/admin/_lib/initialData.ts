// Tipos autosuficientes para la API Serverless sin dependencias de frontend
export interface GalleryMeta {
  slug: string;
  title: string;
  label: string;
  statement: string;
  accent: string;
  twoColumns?: boolean;
  order: number;
  featured?: boolean;
}

export interface Work {
  id: string;
  title: string;
  year: string;
  technique: string;
  size: string;
  price?: string;
  available?: boolean;
  img: string;
  publicId?: string;
  imgPos: string;
  gridCol: string;
  aspect: string;
  order?: number;
  featured?: boolean;
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

export interface ContactMessage {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  company?: string;
  subject?: string;
  projectType?: string;
  budget?: string;
  deadline?: string;
  description?: string;
  message?: string;
  read: boolean;
  type: "contact" | "booking";
}

export interface ChangelogEntry {
  id: string;
  timestamp: string;
  action: string;
  section: "galleries" | "works" | "renders" | "texts" | "social" | "system";
  snapshotId?: string;
  canRollback?: boolean;
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

export interface CollectionMeta {
  title: string;
  label: string;
  statement: string;
  accent: string;
  twoColumns?: boolean;
}

export const BASE_GALLERY_SLUGS = new Set([
  "musae",
  "diggin",
  "concept-art",
  "diseno-grafico",
  "3d-stands",
  "animas",
  "retratos",
  "pasta-ya",
]);

export const META: Record<string, CollectionMeta> = {
  musae: {
    title: "Serie Musae",
    label: "Obra personal",
    statement: "Obra personal que explora la tensión entre forma y vacío. Series que se construyen desde la intuición y se resuelven en el material. Cada pieza es un estado, no una conclusión.",
    accent: "var(--color-brand-blush)",
  },
  diggin: {
    title: "Diggin'",
    label: "Sello musical · Dirección de arte",
    statement: "Portadas, identidad y dirección de arte para el sello independiente Diggin'. Graffiti, psicodelia y hip-hop en formato visual.",
    accent: "var(--color-brand-neon)",
    twoColumns: true,
  },
  "concept-art": {
    title: "Concept Art",
    label: "Desarrollo visual",
    statement: "Concept art e ilustración editorial. Personajes, atmósferas y narrativa visual construidos desde la emoción.",
    accent: "var(--color-brand-orange)",
  },
  "diseno-grafico": {
    title: "Diseño Gráfico",
    label: "Identidad visual",
    statement: "Sistemas de identidad, publicaciones y diseño editorial. La imagen al servicio del mensaje.",
    accent: "var(--color-brand-orange)",
  },
  "3d-stands": {
    title: "3D & Stands",
    label: "Diseño de espacios · Ferias",
    statement: "Diseño y visualización 3D de stands y espacios expositivos para ferias y eventos.",
    accent: "var(--color-brand-blush)",
  },
  animas: {
    title: "Animas",
    label: "Concept Art · Universo propio",
    statement: "Un mundo construido desde dentro: criaturas que nacen de la naturaleza, personajes con historia propia y un bestiario de formas que nunca termina de revelarse.",
    accent: "#C8A96E",
  },
  retratos: {
    title: "Retratos y más",
    label: "Estudio artístico · Obra de clase",
    statement: "El cuaderno de trabajo. Retratos de iconos que se niegan al olvido, anatomía al límite del cartoon y ciudades que Lovecraft hubiera firmado.",
    accent: "#9B7FA6",
  },
  "pasta-ya": {
    title: "Pasta Ya",
    label: "Diseño de personajes · Campaña",
    statement: "Cuando la pasta italiana cobra vida propia y muy mal carácter. Siete personajes de diseño para campaña: expresivos, únicos e inconfundibles.",
    accent: "#E8854A",
  },
};

export function getBaseGalleries(): GalleryMeta[] {
  return Object.entries(META).map(([slug, meta], index) => ({
    slug,
    title: meta.title,
    label: meta.label,
    statement: meta.statement,
    accent: meta.accent,
    twoColumns: meta.twoColumns || false,
    order: index,
    featured: ["musae", "concept-art", "diggin", "animas"].includes(slug),
  }));
}

export const WORKS_BY_SLUG: Record<string, Work[]> = {
  musae: [
    {
        "id": "mu1",
        "title": "Tell Me a Joke",
        "year": "2024",
        "technique": "Acrílico sobre lienzo",
        "size": "100 × 80 cm",
        "price": "€650",
        "available": true,
        "img": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/TELL_ME_A_JOKE_mq8n1l.jpg",
        "imgPos": "50% 30%",
        "gridCol": "md:col-span-2",
        "aspect": "3/2",
        "order": 0
    },
    {
        "id": "mu2",
        "title": "Paranoia",
        "year": "2024",
        "technique": "Técnica mixta",
        "size": "50 × 70 cm",
        "price": "€380",
        "available": true,
        "img": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/Paranoia_ieurx1.jpg",
        "imgPos": "50% 20%",
        "gridCol": "md:col-span-1",
        "aspect": "3/4",
        "order": 1
    },
    {
        "id": "mu3",
        "title": "Musizieren",
        "year": "2024",
        "technique": "Óleo sobre tabla",
        "size": "60 × 80 cm",
        "price": "No disponible",
        "available": false,
        "img": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/Musizieren_gr_heqycu.jpg",
        "imgPos": "50% 20%",
        "gridCol": "md:col-span-1",
        "aspect": "3/4",
        "order": 2
    },
    {
        "id": "mu4",
        "title": "Cabeza (Estudio)",
        "year": "2024",
        "technique": "Carboncillo y acrílico",
        "size": "60 × 60 cm",
        "price": "€320",
        "available": true,
        "img": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/Cabesa_copia_kak4hg.jpg",
        "imgPos": "50% 25%",
        "gridCol": "md:col-span-2",
        "aspect": "3/2",
        "order": 3
    },
    {
        "id": "mu5",
        "title": "The Earth",
        "year": "2023",
        "technique": "Técnica mixta · Tríptico",
        "size": "80 × 80 cm",
        "price": "€450",
        "available": true,
        "img": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/The_Earth_oomsjr.jpg",
        "imgPos": "50% 50%",
        "gridCol": "md:col-span-1",
        "aspect": "1/1",
        "order": 4
    },
    {
        "id": "mu6",
        "title": "The Sky",
        "year": "2023",
        "technique": "Técnica mixta · Tríptico",
        "size": "80 × 80 cm",
        "price": "€450",
        "available": true,
        "img": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/The_Sky_jov9qc.jpg",
        "imgPos": "50% 50%",
        "gridCol": "md:col-span-1",
        "aspect": "1/1",
        "order": 5
    },
    {
        "id": "mu7",
        "title": "The Ocean",
        "year": "2023",
        "technique": "Técnica mixta · Tríptico",
        "size": "80 × 80 cm",
        "price": "€450",
        "available": true,
        "img": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/The_Ocean_fpiduo.jpg",
        "imgPos": "50% 50%",
        "gridCol": "md:col-span-1",
        "aspect": "1/1",
        "order": 6
    },
    {
        "id": "mu8",
        "title": "Just Sugar, No Daddy",
        "year": "2024",
        "technique": "Acrílico sobre lienzo",
        "size": "120 × 90 cm",
        "price": "€890",
        "available": true,
        "img": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/Just_Suggar_No_Daddy_f_eljdvl.jpg",
        "imgPos": "50% 20%",
        "gridCol": "md:col-span-3",
        "aspect": "16/9",
        "order": 7
    },
    {
        "id": "mu9",
        "title": "Kreativität & Schreibkunst",
        "year": "2023",
        "technique": "Tinta y acuarela",
        "size": "50 × 70 cm",
        "price": "No disponible",
        "available": false,
        "img": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/Kreativit%C3%A4t_Schreibkunst_mzvltr.jpg",
        "imgPos": "50% 30%",
        "gridCol": "md:col-span-2",
        "aspect": "3/2",
        "order": 8
    },
    {
        "id": "mu10",
        "title": "La cabeza",
        "year": "2024",
        "technique": "Acrílico y pigmento",
        "size": "70 × 90 cm",
        "price": "€550",
        "available": true,
        "img": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/La_cabeza_copia_grtcrt.jpg",
        "imgPos": "50% 15%",
        "gridCol": "md:col-span-1",
        "aspect": "3/4",
        "order": 9
    },
    {
        "id": "mu11",
        "title": "Musae",
        "year": "2024",
        "technique": "Acrílico sobre lienzo",
        "size": "80 × 100 cm",
        "price": "€650",
        "available": true,
        "img": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/musae_dkbruz.jpg",
        "imgPos": "50% 50%",
        "gridCol": "md:col-span-1",
        "aspect": "3/4",
        "order": 10
    },
    {
        "id": "mu13",
        "title": "Composición Musae I",
        "year": "2024",
        "technique": "Técnica mixta",
        "size": "100 × 120 cm",
        "price": "€750",
        "available": true,
        "img": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/axtt8y6owprqrjralpyy.jpg",
        "imgPos": "50% 30%",
        "gridCol": "md:col-span-2",
        "aspect": "3/2",
        "order": 11
    },
    {
        "id": "mu14",
        "title": "Composición Musae II",
        "year": "2024",
        "technique": "Acrílico sobre lienzo",
        "size": "70 × 100 cm",
        "price": "€580",
        "available": true,
        "img": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/oqx4tad3bvkzxl3xw4hx.jpg",
        "imgPos": "50% 50%",
        "gridCol": "md:col-span-1",
        "aspect": "3/4",
        "order": 12
    },
    {
        "id": "mu15",
        "title": "Composición Musae III",
        "year": "2024",
        "technique": "Óleo sobre lienzo",
        "size": "60 × 80 cm",
        "price": "€490",
        "available": true,
        "img": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/g5cfda0warrtmljjvgzs.jpg",
        "imgPos": "50% 50%",
        "gridCol": "md:col-span-1",
        "aspect": "3/4",
        "order": 13
    },
    {
        "id": "mu16",
        "title": "Composición Musae IV",
        "year": "2024",
        "technique": "Pigmento y carboncillo",
        "size": "80 × 80 cm",
        "price": "€520",
        "available": true,
        "img": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/jxs4go9hxxubri6nv5xd.jpg",
        "imgPos": "50% 50%",
        "gridCol": "md:col-span-1",
        "aspect": "1/1",
        "order": 14
    },
    {
        "id": "mu17",
        "title": "Composición Musae V",
        "year": "2024",
        "technique": "Técnica mixta",
        "size": "90 × 120 cm",
        "price": "€680",
        "available": true,
        "img": "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/tqvdzd4wlub46jphqjyz.jpg",
        "imgPos": "50% 25%",
        "gridCol": "md:col-span-2",
        "aspect": "3/2",
        "order": 15
    }
],
  diggin: [
    { id: "dg1",  title: "Smokin' On EP",       year: "2024", technique: "Tom Hodges",              size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Tom_Hodges_-_Smokin_On_EP_eflsuv.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg3",  title: "Shimmy Shake EP",     year: "2024", technique: "Castelho",                size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Castelho_nqzizi.jpg",            imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg12", title: "Art No Logia",       year: "2024", technique: "Art No Logia",            size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Art_No_Logia_zhqeqm.jpg",       imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg13", title: "Vibin' EP",          year: "2023", technique: "Eros",                    size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Eros_-_Vibin_ft2row.jpg",          imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg16", title: "Red Flag",           year: "2023", technique: "Doke",                    size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/Doke_Red_Flag_u1njsw.jpg",         imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg7",  title: "Cyava Vol. 1",        year: "2024", technique: "Cyava",                   size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Cyava.1_sja6iz.jpg",             imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg8",  title: "Super Looper EP",     year: "2023", technique: "Red Effects",             size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Red_Effects_-_Super_Looper_EP_awueze.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg23", title: "Worxxx Out EP",      year: "2024", technique: "Varios artistas",         size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Worxxx_Out_EP_swxqgn.jpg",       imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg9",  title: "Remixes EP",          year: "2024", technique: "Daniel Orpi",             size: "12″ Vinyl",           price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Daniel_Orpi_Chapa_Castelo_Remixes_njsyv9.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg2",  title: "Telling You",         year: "2023", technique: "Daniel Orpi",             size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Telling_You_d1hffh.jpg",         imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg11", title: "Beamer EP",          year: "2024", technique: "Beamer",                  size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Beamer_EP_qg8wyv.jpg",            imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg14", title: "Bingham EP",         year: "2023", technique: "Fabio Neural",            size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/FABIO_NEURAL_BINGHAM_EP_coyy1p.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg19", title: "Shimmy Shake EP",     year: "2024", technique: "Castilho",                size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/CASTILHO_-_SHIMMY_SHAKE_EP_m5pfg5.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg5",  title: "You4me EP",           year: "2022", technique: "Cribb",                   size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Cribb_-_You4me_EP_fgbk8l.jpg",    imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg24", title: "Trapped in Bassline EP", year: "2023", technique: "Tyron Amory",         size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Tyron_Amory_-_Trapped_in_Bassline_EP_1_1_ywn0zu.png", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg4",  title: "Guetto Unk EP",       year: "2023", technique: "DIGGS",                   size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/DIGGS_-_GUETTO_UNK_EP_xjt6zc.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg6",  title: "Kriol EP",            year: "2023", technique: "Kriol",                   size: "12″ Vinyl",           price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Kriol_znr4cu.jpg",             imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg10", title: "Change",             year: "2023", technique: "Daniel Orpi",             size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Daniel_Orpi_-_Change_tk64hl.jpg",   imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg15", title: "Watchu Doin'",       year: "2023", technique: "Hights",                  size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Hights_-_Watchu_Doin_ulrwve.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg17", title: "The Groove Quest Vol. 45", year: "2024", technique: "Varios artistas",   size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/The_Groove_Quest_Vol._45_wcqeta.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg18", title: "House Jam EP",       year: "2023", technique: "Rhoowax",                 size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Rhoowax_-_House_Jam_EP_bt9yyq.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg20", title: "Night Heroes",       year: "2024", technique: "Rokke",                   size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Rokke_-_Night_Heroes_c6ekoz.jpg",         imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg21", title: "La puesta de Sol",   year: "2023", technique: "Magnuss",                 size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Magnuss_-_La_puesta_de_Sol_s7hkab.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg22", title: "Heyyo! EP",          year: "2024", technique: "Lonely and Friends",      size: "12″ Vinyl",           price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/LONELY_AND_FRIENDS_HEYYO_EP_xcllie.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" }
  ],
  animas: [
    { id: "an1",  title: "Melisa — Arte Final",          year: "2024", technique: "Concept Art · Personaje principal",  size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/1_Melisa_Completo_nwlyro.jpg",       imgPos: "50% 15%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an2",  title: "Veive — Arte Final",           year: "2024", technique: "Concept Art · Personaje principal",  size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/1_Veive_Completo_xb7mrs.jpg",        imgPos: "50% 12%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an3",  title: "Osceola — Arte Final",         year: "2024", technique: "Concept Art · Personaje principal",  size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/1_Osceola_Completo_pka4as.jpg",      imgPos: "50% 12%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an4",  title: "Melisa — Turn Around",         year: "2024", technique: "Model sheet · Vistas 360°",         size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Melisa_Turn_Around_larkd4.jpg",       imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "an5",  title: "Melisa — Poses & Movimiento",  year: "2024", technique: "Model sheet · Dinamismo",           size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Melisa_Poses_snx3wc.jpg",            imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an6",  title: "Veive — Turn Around",          year: "2024", technique: "Model sheet · Vistas 360°",         size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Veive_Turn_Around_wkispd.jpg",        imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "an7",  title: "Veive — Expresiones",          year: "2024", technique: "Model sheet · Emociones",           size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Veive_Expresiones_op3l2s.jpg",       imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an25", title: "Veive — Poses & Movimiento",  year: "2024", technique: "Model sheet · Dinamismo",           size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Veive_Poses_ypg3zc.jpg",             imgPos: "50% 20%", gridCol: "md:col-span-3", aspect: "16/9"  },
    { id: "an8",  title: "Osceola — Turn Around",        year: "2024", technique: "Model sheet · Vistas 360°",         size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Osceola_Turn_Around_kwqkgb.jpg",     imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "an9",  title: "Osceola — Expresiones",        year: "2024", technique: "Model sheet · Emociones",           size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Osceola_Expresiones_udygm7.jpg",     imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an27", title: "Osceola — Poses & Movimiento", year: "2024", technique: "Model sheet · Dinamismo",           size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Osceola_Poses_lifvbu.jpg",           imgPos: "50% 20%", gridCol: "md:col-span-3", aspect: "16/9"  },
    { id: "an10", title: "Atum — Arte Final",            year: "2024", technique: "Concept Art · Jefe del universo",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Arte_Final_Atum_ma3k9g.jpg",          imgPos: "50% 15%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "an11", title: "Atum & Satres — Juntos",       year: "2024", technique: "Concept Art · Dúo de jefes",        size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Atum_y_Satres_Color_arz8wx.jpg",      imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an12", title: "Feronia — La Diosa Árbol",     year: "2024", technique: "Concept Art · Jefe del universo",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Arte_final_Feronia_copia_y9cyel.jpg", imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "an13", title: "Mania — La Oscura",            year: "2024", technique: "Concept Art · Antagonista",         size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/16_Mania_zbpatm.jpg",              imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an14", title: "Personajes — Reunión General", year: "2024", technique: "Concept Art · Elenco completo",     size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Personajes_Juntos_Color_wzpovc.jpg",  imgPos: "50% 20%", gridCol: "md:col-span-3", aspect: "16/9"  },
    { id: "an15", title: "Personajes Principales",       year: "2024", technique: "Concept Art · Trío protagonista",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/3_Principales_Juntos_wexhim.jpg",     imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an16", title: "Arsenal — Todas las Armas",    year: "2024", technique: "Props · Diseño de armas",           size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/3_Todas_las_Armas_Juntas_a8i5m5.jpg", imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "an17", title: "Props del Universo",           year: "2024", technique: "Props · Objetos narrativos",         size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Props_copia_heccxh.jpg",              imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an18", title: "El Reloj de Satres",           year: "2024", technique: "Props · Objeto clave del lore",    size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Reloj_Satres_Color_kbnewg.jpg",       imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an19", title: "Mascotas — Metamorfosis",      year: "2024", technique: "Concept Art · Criaturas del mundo", size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Mascotas_cmetamorfosis_Linea_z0abnh.jpg", imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4" },
    { id: "an20", title: "Melisa — Forma Larval",        year: "2024", technique: "Concept Art · Evolución",           size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Melisa_Larva_lyhbea.jpg",             imgPos: "50% 30%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an21", title: "Personajes Secundarios — Usil & Losna", year: "2024", technique: "Concept Art · Elenco secundario", size: "Digital", price: "Encargo", available: true, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Personajes_secundarios_extra_-_Usil_y_Losna_y_el_Gan_Espiritu_cjig3w.jpg", imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "an22", title: "Abuela Araña",                 year: "2024", technique: "Concept Art · Personaje icónico",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Personajes_secundarios_extra_-_Abuela_Ara%C3%B1a_ydxazq.jpg", imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an26", title: "Personajes Secundarios — Vesta & Nethuns", year: "2024", technique: "Concept Art · Elenco secundario", size: "Digital", price: "Encargo", available: true, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Personajes_secundarios_extra_-_Vesta_y_Nethuns_fctcwr.jpg", imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "an23", title: "Animas — Logotipo del Universo", year: "2024", technique: "Diseño de marca · Mundo propio",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Logo_copia_re9s1a.png",               imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1"   },
    { id: "an24", title: "Lindenii — La Orquídea",       year: "2024", technique: "Diseño · Símbolo del universo",     size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/Lindenii_copia_nttkpw.jpg",           imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "2/1"   },
  ],
  retratos: [
    { id: "rt1",  title: "Anna Karina",                  year: "2024", technique: "Retrato digital · Icono del cine",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/2-Retrato-Anna-Karina_cb505e.jpg",   imgPos: "50% 15%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "rt2",  title: "Charles Bukowski",             year: "2024", technique: "Retrato digital · Icono literario",  size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/2-Rostro-Bukowski_qa3xcl.jpg",       imgPos: "50% 15%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "rt3",  title: "Mia Goth",                    year: "2024", technique: "Retrato digital · Icono del terror", size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/7-Retrato-Mia-Goth_nplucz.jpg",     imgPos: "50% 15%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "rt4",  title: "El Gran Lebowski — Cartoon",  year: "2024", technique: "Cartoon · Caricatura de personaje",  size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/3-Cartoon-Gran-Lebowski_unikym.jpg", imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "rt24", title: "Cartoon — Elenco Completo",    year: "2024", technique: "Cartoon · Galería de personajes",  size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/CARTOON-JUNTOS-copia_phdvqq.jpg",     imgPos: "50% 20%", gridCol: "md:col-span-3", aspect: "16/9"  },
    { id: "rt15", title: "Diferentes Edades — Pelirroja", year: "2024", technique: "Anatomía · Estudio de edades",    size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Diferentes-edades-Pelirroja_re9ynt.jpg", imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4" },
    { id: "rt16", title: "Diferentes Edades — Japonesa", year: "2024", technique: "Anatomía · Estudio de edades",     size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Diferentes-edades-Japonesa_pzylyx.jpg",  imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4" },
    { id: "rt25", title: "Diferentes Edades — Africano",  year: "2024", technique: "Anatomía · Estudio de edades",     size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Diferentes-edades-Africano_uypvhf.jpg",  imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4" },
    { id: "rt17", title: "Poses Dinámicas",              year: "2024", technique: "Anatomía · Movimiento y acción",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/10-Poses-Dinamicas-copia_yly0nn.jpg",  imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "rt14", title: "Cuerpos Cartoon",             year: "2024", technique: "Anatomía · Proporciones cartoon",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/galerias/pasta-ya/8-Cuerpos-Cartoon-copia_tcgads.jpg",   imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "rt13", title: "Expresiones — Estudio",       year: "2024", technique: "Anatomía · Model sheet facial",     size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/6-Expresiones-nuevo-copia_lpojlm.jpg", imgPos: "50% 20%", gridCol: "md:col-span-3", aspect: "16/9"  },
    { id: "rt5",  title: "Ciudad Lovecraft",             year: "2024", technique: "Escenario · Concept art urbano",    size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Ciudad-Lovecraft-color_cmwxry.jpg",  imgPos: "50% 30%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "rt6",  title: "Ciudad Lovecraft — Línea",    year: "2024", technique: "Escenario · Line art final",        size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Ciudad-Lovecraft-Linea-y-Luces_y1saq3.jpg", imgPos: "50% 30%", gridCol: "md:col-span-1", aspect: "3/4" },
    { id: "rt8",  title: "Fachada Isométrica",          year: "2024", technique: "Escenario · Vista isométrica",      size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/17-Fachada-Isometrica-1_pkmnvg.jpg", imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4" },
    { id: "rt7",  title: "Fachadas — Mundo propio",     year: "2024", technique: "Escenario · Arquitectura fantástica", size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/16-Fachadas-juntas_sahsg6.jpg",       imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "rt26", title: "Espacios Abiertos",            year: "2024", technique: "Escenario · Entorno natural",       size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/18-Espacios-Abiertos-copia_laqrr1.jpg", imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4" },
    { id: "rt23", title: "Espacios Acuáticos",           year: "2024", technique: "Escenario · Entorno submarino",     size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/19-Espacios-Acuaticos-copia_y2puti.jpg", imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "rt12", title: "Mantis Jade — Detalle",       year: "2024", technique: "Naturaleza · Insecto a detalle",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Animal-a-detalle-Mantis-Jade_nmmvi3.jpg", imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4" },
    { id: "rt11", title: "Animales Marinos",             year: "2024", technique: "Naturaleza · Ilustración científica", size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Animales-Marinos_ahzqeu.jpg",        imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "rt22", title: "Aves juntas",                  year: "2024", technique: "Naturaleza · Ilustración de aves",  size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Aves-juntas_inckhn.jpg",             imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "rt20", title: "Plantigrados — Color",         year: "2024", technique: "Animales · Estudio de anatomía",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/21-Plantigrados-Color_yxhtya.jpg",    imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "rt21", title: "Digitígrados — Color",         year: "2024", technique: "Animales · Estudio de anatomía",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/22-Digitigrados-copia-color_gyf2u9.jpg", imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4" },
    { id: "rt27", title: "Ungulados — Color",            year: "2024", technique: "Animales · Estudio de anatomía",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/23-Ungulados-color_cnxoy8.jpg",       imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4" },
    { id: "rt28", title: "Animal Cartoon",               year: "2024", technique: "Cartoon · Diseño de criatura",      size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/24-Animal-Cartoon-copia_nu6la8.jpg",  imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "rt10", title: "Criatura Grotesca",            year: "2024", technique: "Criatura · Diseño de horror",      size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Criatura-Grotesca-copia_oyzfyh.jpg", imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "rt9",  title: "Dragón — Caja Musical",       year: "2024", technique: "Criatura · Diseño de fantasía",     size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Dragon-caja-musical_a8vthw.jpg",     imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "rt18", title: "Cyberpunk — Fusión de eras",   year: "2024", technique: "Estilo · Cyberpunk concept",      size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/13-Cyberpunk-Fondo_xtd7ko.jpg",       imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "rt19", title: "Futuro y Pasado",              year: "2024", technique: "Estilo · Dualidad temporal",      size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/13-Futuro-y-Pasado-copia_gywxic.jpg",  imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   }
  ],
  "pasta-ya": [
    { id: "py1", title: "Bravioli 'El Bravo' & Tortastini", year: "2024", technique: "Diseño de personajes · Dúo protagonista",      size: "Digital", price: "Campaña", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Bravioli-el-bravo-y-Tortastini_m1owbr.jpg",  imgPos: "50% 50%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "py2", title: "Sofría Caldina",                  year: "2024", technique: "Diseño de personajes · La jefa de cocina",    size: "Digital", price: "Campaña", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Sofria-Caldina_cjiqkz.jpg",                  imgPos: "50% 30%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "py3", title: "Macarrón & Wiener",              year: "2024", technique: "Diseño de personajes · Dúo secundario",        size: "Digital", price: "Campaña", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Macarron-y-Wiener_nrhspf.jpg",               imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "py4", title: "Spaguetti Western & Croqueta",   year: "2024", technique: "Diseño de personajes · El forajido y su sidekick", size: "Digital", price: "Campaña", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Spaguetti-Western-y-Croqueta_swuwzm.jpg", imgPos: "50% 50%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "py6", title: "Vito Canelone & Taco Carbonara", year: "2024", technique: "Diseño de personajes · Los pesos pesados",    size: "Digital", price: "Campaña", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/musae/Vito-Canelone-y-Taco-Carbonara_fh9xth.jpg", imgPos: "50% 50%", gridCol: "md:col-span-3", aspect: "16/9"  },
    { id: "py5", title: "Tallarinja",                     year: "2024", technique: "Diseño de personajes · El veloz",             size: "Digital", price: "Campaña", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Tallarinja_kdopfz.jpg",                     imgPos: "50% 30%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "py7", title: "Pasta — El Topo Filtrado",       year: "2024", technique: "Arte conceptual · El espía del grupo",        size: "Digital", price: "Campaña", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/archivo/Pasta---Topos-Filtrados_xd0tm1.jpg",         imgPos: "50% 30%", gridCol: "md:col-span-2", aspect: "16/9"  },
  ],
};

export const RENDERS: RenderItem[] = [
  {
    id: "stand-feria-milan",
    title: "Stand Modular de Feria — Milán",
    client: "Fiera Milano S.p.A.",
    year: "2025",
    badge: "STAND · FERIA",
    software: ["Blender", "SketchUp", "AutoCAD"],
    delivery: "Planos técnicos + Renders fotorrealistas",
    description:
      "Propuesta de stand fotorrealista para exhibición de mobiliario de vanguardia. La estructura utiliza materiales ecológicos de alta durabilidad y un sistema modular desmontable de rápida construcción.",
    img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/Doke_Red_Flag_u1njsw.jpg",
    videoSrcMp4: "/videos/miluarte/archivo/sample-3d.mp4",
    videoSrcWebm: "/videos/miluarte/archivo/sample-3d.mp4",
    process: [
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/Captura_de_pantalla_2026-06-18_224728_qvosll.png", label: "Boceto en papel" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/532613326_18320483857235254_170206825296032194_n_mcewf6.jpg", label: "Blockout 3D" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/533637781_18320483821235254_4718922861619683556_n_ddrhz1.jpg", label: "Clay render" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/Doke_Red_Flag_u1njsw.jpg", label: "Render final" }
    ],
    makingOfVideoMp4: "/videos/miluarte/archivo/sample-bbb.mp4",
    makingOfVideoWebm: "/videos/miluarte/archivo/sample-bbb.mp4",
    order: 0,
  },
  {
    id: "altavoz-inteligente",
    title: "Altavoz Hi-Fi Inteligente 3D",
    client: "Soundwave Technologies",
    year: "2024",
    badge: "PRODUCTO · 3D",
    software: ["Cinema 4D", "Octane Render", "Photoshop"],
    delivery: "Renders promocionales + Animación publicitaria",
    description:
      "Visualización publicitaria para el lanzamiento de un altavoz inteligente. Se modelaron con máxima fidelidad las texturas de aluminio cepillado y tela acústica, usando iluminación de estudio realista.",
    img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/532613326_18320483857235254_170206825296032194_n_mcewf6.jpg",
    videoSrcMp4: "/videos/miluarte/archivo/sample-bbb.mp4",
    videoSrcWebm: "/videos/miluarte/archivo/sample-bbb.mp4",
    process: [
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/624072385_18076991993069555_3759238577248943847_n_zjw6f8.jpg", label: "Referencia" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/Captura_de_pantalla_2026-06-18_224728_qvosll.png", label: "Blockout 3D" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/533637781_18320483821235254_4718922861619683556_n_ddrhz1.jpg", label: "Clay render" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/532613326_18320483857235254_170206825296032194_n_mcewf6.jpg", label: "Render final" }
    ],
    order: 1,
  },
  {
    id: "pabellon-cristal",
    title: "Pabellón Botánico de Cristal",
    client: "Proyecto de investigación",
    year: "2025",
    badge: "ARQUITECTURA",
    software: ["Blender", "V-Ray", "Photoshop"],
    delivery: "Renders fotorrealistas + Recorrido virtual",
    description:
      "Modelado de un pabellón botánico de cristal integrado en el bosque. Destaca el comportamiento de la luz natural a través de los cristales estructurados y la vegetación circundante.",
    img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/533637781_18320483821235254_4718922861619683556_n_ddrhz1.jpg",
    videoSrcMp4: "/videos/miluarte/archivo/sample-3d.mp4",
    videoSrcWebm: "/videos/miluarte/archivo/sample-3d.mp4",
    process: [
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/Captura_de_pantalla_2026-06-18_224728_qvosll.png", label: "Boceto en papel" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/624072385_18076991993069555_3759238577248943847_n_zjw6f8.jpg", label: "Blockout 3D" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/532613326_18320483857235254_170206825296032194_n_mcewf6.jpg", label: "Clay render" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/533637781_18320483821235254_4718922861619683556_n_ddrhz1.jpg", label: "Render final" }
    ],
    makingOfVideoMp4: "/videos/miluarte/archivo/sample-bbb.mp4",
    makingOfVideoWebm: "/videos/miluarte/archivo/sample-bbb.mp4",
    order: 2,
  },
  {
    id: "stand-cosmetica-bio",
    title: "Stand de Cosmética Orgánica",
    client: "Natura Cosmetics",
    year: "2024",
    badge: "STAND · FERIA",
    software: ["Blender", "SketchUp", "Substance Painter"],
    delivery: "Todos (planos técnicos, renders y animación de recorrido)",
    description:
      "Visualización de un stand expositivo de cosmética bio. Combina iluminación cálida con texturas de madera y vegetación para transmitir pureza y sostenibilidad.",
    img: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/624072385_18076991993069555_3759238577248943847_n_zjw6f8.jpg",
    videoSrcMp4: "/videos/miluarte/archivo/sample-bbb.mp4",
    videoSrcWebm: "/videos/miluarte/archivo/sample-bbb.mp4",
    process: [
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/Captura_de_pantalla_2026-06-18_224728_qvosll.png", label: "Boceto en papel" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/532613326_18320483857235254_170206825296032194_n_mcewf6.jpg", label: "Blockout 3D" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/533637781_18320483821235254_4718922861619683556_n_ddrhz1.jpg", label: "Clay render" },
      { src: "https://res.cloudinary.com/doznr2qm4/image/upload/miluarte/renders/624072385_18076991993069555_3759238577248943847_n_zjw6f8.jpg", label: "Render final" }
    ],
    order: 3,
  }
];

export const translations = {
  es: {
    hero: {
      tagline: "Ilustradora & artista digital · Madrid",
      greetingBefore: "Hola,\nsoy ",
      greetingItalic: "Nerea",
      artline: "Transformo ideas en mundos visuales con alma.",
      bio1: "Me llamo Nerea Lucas Pajares, artísticamente conocida como Miluartedenara. Con un Máster en Ilustración y Arte Digital, creo desde lienzos expuestos en galerías de Madrid hasta muñecas personalizadas en arcilla, joyería artesanal hecha a mano y concept art para proyectos musicales. Cada pieza está hecha con dedicación y amor por los detalles.",
      bio2: "Realizo cualquier tipo de encargo artístico. Si tienes una idea, puedo darle vida.",
      viewWorks: "Ver trabajos",
      sendInquiry: "Escribir encargo"
    }
  },
  en: {
    hero: {
      tagline: "Illustrator & Digital Artist · Madrid",
      greetingBefore: "Hello,\nI'm ",
      greetingItalic: "Nerea",
      artline: "Transforming ideas into visual worlds with soul.",
      bio1: "My name is Nerea Lucas Pajares, artistically known as Miluartedenara. With a Master's degree in Illustration and Digital Art, I create everything from canvases exhibited in Madrid galleries to custom handmade clay dolls, artisanal jewelry, and concept art for musical projects. Every piece is crafted with dedication and love for details.",
      bio2: "I take all kinds of artistic commissions. If you have an idea, I can bring it to life.",
      viewWorks: "View works",
      sendInquiry: "Commission inquiry"
    }
  }
};
