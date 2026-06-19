import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { ease, staggerContainer, staggerItem } from "../tokens";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { SharedFooter } from "../components/SharedFooter";
import { useLanguage } from "../context/LanguageContext";


gsap.registerPlugin(Flip);

const vp = { once: true, margin: "-60px" } as const;

// ─── Per-slug content ─────────────────────────────────────────────────────────

interface CollectionMeta {
  title: string;
  label: string;
  statement: string;
  accent: string;
}

const META: Record<string, CollectionMeta> = {
  ilustracion: {
    title: "Ilustración",
    label: "Obra personal",
    statement: "Obra personal que explora la tensión entre forma y vacío. Series que se construyen desde la intuición y se resuelven en el material. Cada pieza es un estado, no una conclusión.",
    accent: "var(--color-brand-blush)",
  },
  diggin: {
    title: "Diggin'",
    label: "Sello musical · Dirección de arte",
    statement: "Portadas, identidad y dirección de arte para el sello independiente Diggin'. Graffiti, psicodelia y hip-hop en formato visual.",
    accent: "var(--color-brand-neon)",
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

// Works grid — editorial asymmetric layout
interface Work {
  id: number | string; title: string; year: string; technique: string;
  size: string; price: string; available: boolean;
  img: string; imgPos: string; gridCol: string; aspect: string;
}

const WORKS_BY_SLUG: Record<string, Work[]> = {
  ilustracion: [
    { id: "mu1",  title: "Tell Me a Joke",               year: "2024", technique: "Acrílico sobre lienzo",     size: "100 × 80 cm",  price: "€650",            available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781819794/TELL_ME_A_JOKE_mq8n1l.jpg",         imgPos: "50% 30%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "mu2",  title: "Paranoia",                     year: "2024", technique: "Técnica mixta",              size: "50 × 70 cm",   price: "€380",            available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781819793/Paranoia_ieurx1.jpg",                 imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "mu3",  title: "Musizieren",                   year: "2024", technique: "Óleo sobre tabla",           size: "60 × 80 cm",   price: "No disponible",   available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781819793/Musizieren_gr_heqycu.jpg",         imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "mu4",  title: "Cabeza (Estudio)",             year: "2024", technique: "Carboncillo y acrílico",     size: "60 × 60 cm",   price: "€320",            available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781819795/Cabesa_copia_kak4hg.jpg",             imgPos: "50% 25%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "mu5",  title: "The Earth",                    year: "2023", technique: "Técnica mixta · Tríptico",   size: "80 × 80 cm",   price: "€450",            available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781819795/The_Earth_oomsjr.jpg",                imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1"   },
    { id: "mu6",  title: "The Sky",                      year: "2023", technique: "Técnica mixta · Tríptico",   size: "80 × 80 cm",   price: "€450",            available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781819796/The_Sky_jov9qc.jpg",                  imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1"   },
    { id: "mu7",  title: "The Ocean",                    year: "2023", technique: "Técnica mixta · Tríptico",   size: "80 × 80 cm",   price: "€450",            available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781819796/The_Ocean_fpiduo.jpg",                imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1"   },
    { id: "mu8",  title: "Just Sugar, No Daddy",         year: "2024", technique: "Acrílico sobre lienzo",     size: "120 × 90 cm",  price: "€890",            available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781819797/Just_Suggar_No_Daddy_f_eljdvl.jpg",   imgPos: "50% 20%", gridCol: "md:col-span-3", aspect: "16/9"  },
    { id: "mu9",  title: "Kreativität & Schreibkunst",   year: "2023", technique: "Tinta y acuarela",           size: "50 × 70 cm",   price: "No disponible",   available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781819798/Kreativit%C3%A4t_Schreibkunst_mzvltr.jpg", imgPos: "50% 30%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "mu10", title: "La cabeza",                    year: "2024", technique: "Acrílico y pigmento",        size: "70 × 90 cm",   price: "€550",            available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781819801/La_cabeza_copia_grtcrt.jpg",          imgPos: "50% 15%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "mu11", title: "Musae",                        year: "2024", technique: "Acrílico sobre lienzo",     size: "80 × 100 cm",  price: "€650",            available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781821775/musae_dkbruz.jpg",                    imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "3/4"   },
  ],
  diggin: [
    { id: "dg1",  title: "Smokin' On EP",       year: "2024", technique: "Tom Hodges",              size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811474/Tom_Hodges_-_Smokin_On_EP_eflsuv.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg3",  title: "Shimmy Shake EP",     year: "2024", technique: "Castelho",                size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811472/Castelho_nqzizi.jpg",            imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg12", title: "Art No Logia",       year: "2024", technique: "Art No Logia",            size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811475/Art_No_Logia_zhqeqm.jpg",       imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg13", title: "Vibin' EP",          year: "2023", technique: "Eros",                    size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811478/Eros_-_Vibin_ft2row.jpg",          imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg16", title: "Red Flag",           year: "2023", technique: "Doke",                    size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811479/Doke_Red_Flag_u1njsw.jpg",         imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg7",  title: "Cyava Vol. 1",        year: "2024", technique: "Cyava",                   size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811473/Cyava.1_sja6iz.jpg",             imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg8",  title: "Super Looper EP",     year: "2023", technique: "Red Effects",             size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811473/Red_Effects_-_Super_Looper_EP_awueze.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg23", title: "Worxxx Out EP",      year: "2024", technique: "Varios artistas",         size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811484/Worxxx_Out_EP_swxqgn.jpg",       imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg9",  title: "Remixes EP",          year: "2024", technique: "Daniel Orpi",             size: "12″ Vinyl",           price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811477/Daniel_Orpi_Chapa_Castelo_Remixes_njsyv9.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg2",  title: "Telling You",         year: "2023", technique: "Daniel Orpi",             size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811474/Telling_You_d1hffh.jpg",         imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg11", title: "Beamer EP",          year: "2024", technique: "Beamer",                  size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811476/Beamer_EP_qg8wyv.jpg",            imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg14", title: "Bingham EP",         year: "2023", technique: "Fabio Neural",            size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811477/FABIO_NEURAL_BINGHAM_EP_coyy1p.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg19", title: "Shimmy Shake EP",     year: "2024", technique: "Castilho",                size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811481/CASTILHO_-_SHIMMY_SHAKE_EP_m5pfg5.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg5",  title: "You4me EP",           year: "2022", technique: "Cribb",                   size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811472/Cribb_-_You4me_EP_fgbk8l.jpg",    imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg24", title: "Trapped in Bassline EP", year: "2023", technique: "Tyron Amory",         size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811483/Tyron_Amory_-_Trapped_in_Bassline_EP_1_1_ywn0zu.png", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg4",  title: "Guetto Unk EP",       year: "2023", technique: "DIGGS",                   size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811472/DIGGS_-_GUETTO_UNK_EP_xjt6zc.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg6",  title: "Kriol EP",            year: "2023", technique: "Kriol",                   size: "12″ Vinyl",           price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811472/Kriol_znr4cu.jpg",             imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg10", title: "Change",             year: "2023", technique: "Daniel Orpi",             size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811476/Daniel_Orpi_-_Change_tk64hl.jpg",   imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg15", title: "Watchu Doin'",       year: "2023", technique: "Hights",                  size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811479/Hights_-_Watchu_Doin_ulrwve.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg17", title: "The Groove Quest Vol. 45", year: "2024", technique: "Varios artistas",   size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811481/The_Groove_Quest_Vol._45_wcqeta.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg18", title: "House Jam EP",       year: "2023", technique: "Rhoowax",                 size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811480/Rhoowax_-_House_Jam_EP_bt9yyq.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg20", title: "Night Heroes",       year: "2024", technique: "Rokke",                   size: "Digital Release",     price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811481/Rokke_-_Night_Heroes_c6ekoz.jpg",         imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg21", title: "La puesta de Sol",   year: "2023", technique: "Magnuss",                 size: "12″ Vinyl / Digital", price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811483/Magnuss_-_La_puesta_de_Sol_s7hkab.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" },
    { id: "dg22", title: "Heyyo! EP",          year: "2024", technique: "Lonely and Friends",      size: "12″ Vinyl",           price: "Proyecto musical", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781811482/LONELY_AND_FRIENDS_HEYYO_EP_xcllie.jpg", imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1" }
  ],
  animas: [
    { id: "an1",  title: "Melisa — Arte Final",          year: "2024", technique: "Concept Art · Personaje principal",  size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820062/1_Melisa_Completo_nwlyro.jpg",       imgPos: "50% 15%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an2",  title: "Veive — Arte Final",           year: "2024", technique: "Concept Art · Personaje principal",  size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781819996/1_Veive_Completo_xb7mrs.jpg",        imgPos: "50% 12%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an3",  title: "Osceola — Arte Final",         year: "2024", technique: "Concept Art · Personaje principal",  size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820000/1_Osceola_Completo_pka4as.jpg",      imgPos: "50% 12%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an4",  title: "Melisa — Turn Around",         year: "2024", technique: "Model sheet · Vistas 360°",         size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820053/Melisa_Turn_Around_larkd4.jpg",       imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "an5",  title: "Melisa — Poses & Movimiento",  year: "2024", technique: "Model sheet · Dinamismo",           size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820050/Melisa_Poses_snx3wc.jpg",            imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an6",  title: "Veive — Turn Around",          year: "2024", technique: "Model sheet · Vistas 360°",         size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820008/Veive_Turn_Around_wkispd.jpg",        imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "an7",  title: "Veive — Expresiones",          year: "2024", technique: "Model sheet · Emociones",           size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820060/Veive_Expresiones_op3l2s.jpg",       imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an25", title: "Veive — Poses & Movimiento",  year: "2024", technique: "Model sheet · Dinamismo",           size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820061/Veive_Poses_ypg3zc.jpg",             imgPos: "50% 20%", gridCol: "md:col-span-3", aspect: "16/9"  },
    { id: "an8",  title: "Osceola — Turn Around",        year: "2024", technique: "Model sheet · Vistas 360°",         size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820055/Osceola_Turn_Around_kwqkgb.jpg",     imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "an9",  title: "Osceola — Expresiones",        year: "2024", technique: "Model sheet · Emociones",           size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820054/Osceola_Expresiones_udygm7.jpg",     imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an27", title: "Osceola — Poses & Movimiento", year: "2024", technique: "Model sheet · Dinamismo",           size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820004/Osceola_Poses_lifvbu.jpg",           imgPos: "50% 20%", gridCol: "md:col-span-3", aspect: "16/9"  },
    { id: "an10", title: "Atum — Arte Final",            year: "2024", technique: "Concept Art · Jefe del universo",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820052/Arte_Final_Atum_ma3k9g.jpg",          imgPos: "50% 15%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "an11", title: "Atum & Satres — Juntos",       year: "2024", technique: "Concept Art · Dúo de jefes",        size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781819998/Atum_y_Satres_Color_arz8wx.jpg",      imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an12", title: "Feronia — La Diosa Árbol",     year: "2024", technique: "Concept Art · Jefe del universo",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820057/Arte_final_Feronia_copia_y9cyel.jpg", imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "an13", title: "Mania — La Oscura",            year: "2024", technique: "Concept Art · Antagonista",         size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820030/16_Mania_zbpatm.jpg",              imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an14", title: "Personajes — Reunión General", year: "2024", technique: "Concept Art · Elenco completo",     size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820056/Personajes_Juntos_Color_wzpovc.jpg",  imgPos: "50% 20%", gridCol: "md:col-span-3", aspect: "16/9"  },
    { id: "an15", title: "Personajes Principales",       year: "2024", technique: "Concept Art · Trío protagonista",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820002/3_Principales_Juntos_wexhim.jpg",     imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an16", title: "Arsenal — Todas las Armas",    year: "2024", technique: "Props · Diseño de armas",           size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781819996/3_Todas_las_Armas_Juntas_a8i5m5.jpg", imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "an17", title: "Props del Universo",           year: "2024", technique: "Props · Objetos narrativos",         size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820059/Props_copia_heccxh.jpg",              imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an18", title: "El Reloj de Satres",           year: "2024", technique: "Props · Objeto clave del lore",    size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820007/Reloj_Satres_Color_kbnewg.jpg",       imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an19", title: "Mascotas — Metamorfosis",      year: "2024", technique: "Concept Art · Criaturas del mundo", size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820001/Mascotas_cmetamorfosis_Linea_z0abnh.jpg", imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4" },
    { id: "an20", title: "Melisa — Forma Larval",        year: "2024", technique: "Concept Art · Evolución",           size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820049/Melisa_Larva_lyhbea.jpg",             imgPos: "50% 30%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an21", title: "Personajes Secundarios — Usil & Losna", year: "2024", technique: "Concept Art · Elenco secundario", size: "Digital", price: "Encargo", available: true, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820004/Personajes_secundarios_extra_-_Usil_y_Losna_y_el_Gan_Espiritu_cjig3w.jpg", imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "an22", title: "Abuela Araña",                 year: "2024", technique: "Concept Art · Personaje icónico",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820058/Personajes_secundarios_extra_-_Abuela_Ara%C3%B1a_ydxazq.jpg", imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "an26", title: "Personajes Secundarios — Vesta & Nethuns", year: "2024", technique: "Concept Art · Elenco secundario", size: "Digital", price: "Encargo", available: true, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820006/Personajes_secundarios_extra_-_Vesta_y_Nethuns_fctcwr.jpg", imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "an23", title: "Animas — Logotipo del Universo", year: "2024", technique: "Diseño de marca · Mundo propio",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781819999/Logo_copia_re9s1a.png",               imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "1/1"   },
    { id: "an24", title: "Lindenii — La Orquídea",       year: "2024", technique: "Diseño · Símbolo del universo",     size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781819998/Lindenii_copia_nttkpw.jpg",           imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "2/1"   },
  ],
  retratos: [
    { id: "rt1",  title: "Anna Karina",                  year: "2024", technique: "Retrato digital · Icono del cine",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820993/2-Retrato-Anna-Karina_cb505e.jpg",   imgPos: "50% 15%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "rt2",  title: "Charles Bukowski",             year: "2024", technique: "Retrato digital · Icono literario",  size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820994/2-Rostro-Bukowski_qa3xcl.jpg",       imgPos: "50% 15%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "rt3",  title: "Mia Goth",                    year: "2024", technique: "Retrato digital · Icono del terror", size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820896/7-Retrato-Mia-Goth_nplucz.jpg",     imgPos: "50% 15%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "rt4",  title: "El Gran Lebowski — Cartoon",  year: "2024", technique: "Cartoon · Caricatura de personaje",  size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820894/3-Cartoon-Gran-Lebowski_unikym.jpg", imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "rt24", title: "Cartoon — Elenco Completo",    year: "2024", technique: "Cartoon · Galería de personajes",  size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820986/CARTOON-JUNTOS-copia_phdvqq.jpg",     imgPos: "50% 20%", gridCol: "md:col-span-3", aspect: "16/9"  },
    { id: "rt15", title: "Diferentes Edades — Pelirroja", year: "2024", technique: "Anatomía · Estudio de edades",    size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820991/Diferentes-edades-Pelirroja_re9ynt.jpg", imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4" },
    { id: "rt16", title: "Diferentes Edades — Japonesa", year: "2024", technique: "Anatomía · Estudio de edades",     size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820990/Diferentes-edades-Japonesa_pzylyx.jpg",  imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4" },
    { id: "rt25", title: "Diferentes Edades — Africano",  year: "2024", technique: "Anatomía · Estudio de edades",     size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820988/Diferentes-edades-Africano_uypvhf.jpg",  imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4" },
    { id: "rt17", title: "Poses Dinámicas",              year: "2024", technique: "Anatomía · Movimiento y acción",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820892/10-Poses-Dinamicas-copia_yly0nn.jpg",  imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "rt14", title: "Cuerpos Cartoon",             year: "2024", technique: "Anatomía · Proporciones cartoon",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781821003/8-Cuerpos-Cartoon-copia_tcgads.jpg",   imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "rt13", title: "Expresiones — Estudio",       year: "2024", technique: "Anatomía · Model sheet facial",     size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820996/6-Expresiones-nuevo-copia_lpojlm.jpg", imgPos: "50% 20%", gridCol: "md:col-span-3", aspect: "16/9"  },
    { id: "rt5",  title: "Ciudad Lovecraft",             year: "2024", technique: "Escenario · Concept art urbano",    size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781821002/Ciudad-Lovecraft-color_cmwxry.jpg",  imgPos: "50% 30%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "rt6",  title: "Ciudad Lovecraft — Línea",    year: "2024", technique: "Escenario · Line art final",        size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820999/Ciudad-Lovecraft-Linea-y-Luces_y1saq3.jpg", imgPos: "50% 30%", gridCol: "md:col-span-1", aspect: "3/4" },
    { id: "rt8",  title: "Fachada Isométrica",          year: "2024", technique: "Escenario · Vista isométrica",      size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820898/17-Fachada-Isometrica-1_pkmnvg.jpg", imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4" },
    { id: "rt7",  title: "Fachadas — Mundo propio",     year: "2024", technique: "Escenario · Arquitectura fantástica", size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820998/16-Fachadas-juntas_sahsg6.jpg",       imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "rt26", title: "Espacios Abiertos",            year: "2024", technique: "Escenario · Entorno natural",       size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820899/18-Espacios-Abiertos-copia_laqrr1.jpg", imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4" },
    { id: "rt23", title: "Espacios Acuáticos",           year: "2024", technique: "Escenario · Entorno submarino",     size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820900/19-Espacios-Acuaticos-copia_y2puti.jpg", imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "rt12", title: "Mantis Jade — Detalle",       year: "2024", technique: "Naturaleza · Insecto a detalle",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820893/Animal-a-detalle-Mantis-Jade_nmmvi3.jpg", imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4" },
    { id: "rt11", title: "Animales Marinos",             year: "2024", technique: "Naturaleza · Ilustración científica", size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820906/Animales-Marinos_ahzqeu.jpg",        imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "rt22", title: "Aves juntas",                  year: "2024", technique: "Naturaleza · Ilustración de aves",  size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820908/Aves-juntas_inckhn.jpg",             imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "rt20", title: "Plantigrados — Color",         year: "2024", technique: "Animales · Estudio de anatomía",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820902/21-Plantigrados-Color_yxhtya.jpg",    imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "rt21", title: "Digitígrados — Color",         year: "2024", technique: "Animales · Estudio de anatomía",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820903/22-Digitigrados-copia-color_gyf2u9.jpg", imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4" },
    { id: "rt27", title: "Ungulados — Color",            year: "2024", technique: "Animales · Estudio de anatomía",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820905/23-Ungulados-color_cnxoy8.jpg",       imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4" },
    { id: "rt28", title: "Animal Cartoon",               year: "2024", technique: "Cartoon · Diseño de criatura",      size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820890/24-Animal-Cartoon-copia_nu6la8.jpg",  imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "rt10", title: "Criatura Grotesca",            year: "2024", technique: "Criatura · Diseño de horror",      size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820987/Criatura-Grotesca-copia_oyzfyh.jpg", imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "rt9",  title: "Dragón — Caja Musical",       year: "2024", technique: "Criatura · Diseño de fantasía",     size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781821004/Dragon-caja-musical_a8vthw.jpg",     imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "rt18", title: "Cyberpunk — Fusión de eras",   year: "2024", technique: "Estilo · Cyberpunk concept",      size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820888/13-Cyberpunk-Fondo_xtd7ko.jpg",       imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "rt19", title: "Futuro y Pasado",              year: "2024", technique: "Estilo · Dualidad temporal",      size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820889/13-Futuro-y-Pasado-copia_gywxic.jpg",  imgPos: "50% 20%", gridCol: "md:col-span-2", aspect: "3/2"   }
  ],
  "pasta-ya": [
    { id: "py1", title: "Bravioli 'El Bravo' & Tortastini", year: "2024", technique: "Diseño de personajes · Dúo protagonista",      size: "Digital", price: "Campaña", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781821171/Bravioli-el-bravo-y-Tortastini_m1owbr.jpg",  imgPos: "50% 50%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "py2", title: "Sofría Caldina",                  year: "2024", technique: "Diseño de personajes · La jefa de cocina",    size: "Digital", price: "Campaña", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781821173/Sofria-Caldina_cjiqkz.jpg",                  imgPos: "50% 30%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "py3", title: "Macarrón & Wiener",              year: "2024", technique: "Diseño de personajes · Dúo secundario",        size: "Digital", price: "Campaña", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781821168/Macarron-y-Wiener_nrhspf.jpg",               imgPos: "50% 50%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "py4", title: "Spaguetti Western & Croqueta",   year: "2024", technique: "Diseño de personajes · El forajido y su sidekick", size: "Digital", price: "Campaña", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781821175/Spaguetti-Western-y-Croqueta_swuwzm.jpg", imgPos: "50% 50%", gridCol: "md:col-span-2", aspect: "3/2"   },
    { id: "py6", title: "Vito Canelone & Taco Carbonara", year: "2024", technique: "Diseño de personajes · Los pesos pesados",    size: "Digital", price: "Campaña", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781821167/Vito-Canelone-y-Taco-Carbonara_fh9xth.jpg", imgPos: "50% 50%", gridCol: "md:col-span-3", aspect: "16/9"  },
    { id: "py5", title: "Tallarinja",                     year: "2024", technique: "Diseño de personajes · El veloz",             size: "Digital", price: "Campaña", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781821176/Tallarinja_kdopfz.jpg",                     imgPos: "50% 30%", gridCol: "md:col-span-1", aspect: "3/4"   },
    { id: "py7", title: "Pasta — El Topo Filtrado",       year: "2024", technique: "Arte conceptual · El espía del grupo",        size: "Digital", price: "Campaña", available: false, img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781821170/Pasta---Topos-Filtrados_xd0tm1.jpg",         imgPos: "50% 30%", gridCol: "md:col-span-2", aspect: "16/9"  },
  ],
};


// ─── Work Card ────────────────────────────────────────────────────────────────

function WorkCard({ 
  work, 
  accent, 
  onClick, 
  imgRef 
}: { 
  work: Work; 
  accent: string; 
  onClick: () => void; 
  imgRef: (el: HTMLImageElement | null) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  const getLocalizedPrice = (price: string) => {
    if (price === "No disponible") return t("collection.availability.unavailable");
    if (price === "Proyecto musical") return t("collection.availability.musicalProject");
    if (price === "Encargo") return language === "es" ? "Encargo" : "Commission";
    if (price === "Campaña") return language === "es" ? "Proyecto de campaña" : "Campaign project";
    return price;
  };

  const getLocalizedTechnique = (tech: string) => {
    if (tech === "Acrílico sobre lienzo") return language === "es" ? "Acrílico sobre lienzo" : "Acrylic on canvas";
    if (tech === "Óleo sobre tabla") return language === "es" ? "Óleo sobre tabla" : "Oil on wood panel";
    if (tech === "Técnica mixta") return language === "es" ? "Técnica mixta" : "Mixed media";
    if (tech === "Acrílico y pigmento") return language === "es" ? "Acrílico y pigmento" : "Acrylic and pigment";
    if (tech === "Carboncillo y acrílico") return language === "es" ? "Carboncillo y acrílico" : "Charcoal and acrylic";
    if (tech === "Técnica mixta · Tríptico") return language === "es" ? "Técnica mixta · Tríptico" : "Mixed media · Triptych";
    if (tech === "Tinta y acuarela") return language === "es" ? "Tinta y acuarela" : "Ink and watercolor";
    
    // Retratos techniques
    if (tech === "Retrato digital · Icono del cine") return language === "es" ? "Retrato digital · Icono del cine" : "Digital portrait · Cinema icon";
    if (tech === "Retrato digital · Icono literario") return language === "es" ? "Retrato digital · Icono literario" : "Digital portrait · Literary icon";
    if (tech === "Retrato digital · Icono del terror") return language === "es" ? "Retrato digital · Icono del terror" : "Digital portrait · Horror icon";
    if (tech === "Cartoon · Caricatura de personaje") return language === "es" ? "Cartoon · Caricatura de personaje" : "Cartoon · Character caricature";
    if (tech === "Escenario · Concept art urbano") return language === "es" ? "Escenario · Concept art urbano" : "Environment · Urban concept art";
    if (tech === "Escenario · Line art final") return language === "es" ? "Escenario · Line art final" : "Environment · Final line art";
    if (tech === "Escenario · Arquitectura fantástica") return language === "es" ? "Escenario · Arquitectura fantástica" : "Environment · Fantastic architecture";
    if (tech === "Escenario · Vista isométrica") return language === "es" ? "Escenario · Vista isométrica" : "Environment · Isometric view";
    if (tech === "Criatura · Diseño de fantasía") return language === "es" ? "Criatura · Diseño de fantasía" : "Creature · Fantasy design";
    if (tech === "Criatura · Diseño de horror") return language === "es" ? "Criatura · Diseño de horror" : "Creature · Horror design";
    if (tech === "Naturaleza · Ilustración científica") return language === "es" ? "Naturaleza · Ilustración científica" : "Nature · Scientific illustration";
    if (tech === "Naturaleza · Insecto a detalle") return language === "es" ? "Naturaleza · Insecto a detalle" : "Nature · Detailed insect";
    if (tech === "Anatomía · Model sheet facial") return language === "es" ? "Anatomía · Model sheet facial" : "Anatomy · Facial model sheet";
    if (tech === "Anatomía · Proporciones cartoon") return language === "es" ? "Anatomía · Proporciones cartoon" : "Anatomy · Cartoon proportions";
    if (tech === "Anatomía · Estudio de edades") return language === "es" ? "Anatomía · Estudio de edades" : "Anatomy · Age study";
    if (tech === "Anatomía · Movimiento y acción") return language === "es" ? "Anatomía · Movimiento y acción" : "Anatomy · Movement and action";
    if (tech === "Estilo · Cyberpunk concept") return language === "es" ? "Estilo · Cyberpunk concept" : "Style · Cyberpunk concept";
    if (tech === "Estilo · Dualidad temporal") return language === "es" ? "Estilo · Dualidad temporal" : "Style · Temporal duality";
    if (tech === "Animales · Estudio de anatomía") return language === "es" ? "Animales · Estudio de anatomía" : "Animals · Anatomy study";
    if (tech === "Naturaleza · Ilustración de aves") return language === "es" ? "Naturaleza · Ilustración de aves" : "Nature · Bird illustration";
    if (tech === "Escenario · Entorno submarino") return language === "es" ? "Escenario · Entorno submarino" : "Environment · Underwater environment";
    if (tech === "Cartoon · Galería de personajes") return language === "es" ? "Cartoon · Galería de personajes" : "Cartoon · Character gallery";
    if (tech === "Escenario · Entorno natural") return language === "es" ? "Escenario · Entorno natural" : "Environment · Natural environment";
    if (tech === "Cartoon · Diseño de criatura") return language === "es" ? "Cartoon · Diseño de criatura" : "Cartoon · Creature design";
    
    // Animas techniques
    if (tech === "Concept Art · Personaje principal") return language === "es" ? "Concept Art · Personaje principal" : "Concept Art · Main character";
    if (tech === "Model sheet · Vistas 360°") return language === "es" ? "Model sheet · Vistas 360°" : "Model sheet · 360° views";
    if (tech === "Model sheet · Dinamismo") return language === "es" ? "Model sheet · Dinamismo" : "Model sheet · Dynamism";
    if (tech === "Model sheet · Emociones") return language === "es" ? "Model sheet · Emociones" : "Model sheet · Emotions";
    if (tech === "Concept Art · Jefe del universo") return language === "es" ? "Concept Art · Jefe del universo" : "Concept Art · Boss character";
    if (tech === "Concept Art · Dúo de jefes") return language === "es" ? "Concept Art · Dúo de jefes" : "Concept Art · Boss duo";
    if (tech === "Concept Art · Antagonista") return language === "es" ? "Concept Art · Antagonista" : "Concept Art · Antagonist";
    if (tech === "Concept Art · Elenco completo") return language === "es" ? "Concept Art · Elenco completo" : "Concept Art · Full cast";
    if (tech === "Concept Art · Trío protagonista") return language === "es" ? "Concept Art · Trío protagonista" : "Concept Art · Protagonist trio";
    if (tech === "Props · Diseño de armas") return language === "es" ? "Props · Diseño de armas" : "Props · Weapon design";
    if (tech === "Props · Objetos narrativos") return language === "es" ? "Props · Objetos narrativos" : "Props · Narrative objects";
    if (tech === "Props · Objeto clave del lore") return language === "es" ? "Props · Objeto clave del lore" : "Props · Key lore object";
    if (tech === "Concept Art · Criaturas del mundo") return language === "es" ? "Concept Art · Criaturas del mundo" : "Concept Art · World creatures";
    if (tech === "Concept Art · Evolución") return language === "es" ? "Concept Art · Evolución" : "Concept Art · Evolution";
    if (tech === "Concept Art · Elenco secundario") return language === "es" ? "Concept Art · Elenco secundario" : "Concept Art · Secondary cast";
    if (tech === "Concept Art · Personaje icónico") return language === "es" ? "Concept Art · Personaje icónico" : "Concept Art · Iconic character";
    if (tech === "Diseño de marca · Mundo propio") return language === "es" ? "Diseño de marca · Mundo propio" : "Brand design · Personal world";
    if (tech === "Diseño · Símbolo del universo") return language === "es" ? "Diseño · Símbolo del universo" : "Design · Universe symbol";
    
    return tech;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    const rX = -(mouseY / height) * 8; // max 8 degrees tilt
    const rY = (mouseX / width) * 8;
    setRotate({ x: rX, y: rY });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      variants={staggerItem}
      className={`relative overflow-hidden cursor-pointer col-span-3 ${work.gridCol}`}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: hovered ? "none" : "transform 0.4s ease-out",
        transformStyle: "preserve-3d",
      }}
      data-cursor={language === "es" ? "Ampliar" : "Zoom"}
    >
      <div className="relative overflow-hidden w-full h-full" style={{ aspectRatio: work.aspect }}>
        <img
          ref={imgRef}
          src={work.img}
          alt={work.title}
          className={`w-full h-full object-cover transition-all duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            hovered ? "scale-105 brightness-[0.82] saturate-[1.1]" : "brightness-[0.72]"
          }`}
          style={{ objectPosition: work.imgPos }}
        />

        {/* Museum label overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-brand-bg/97 via-brand-bg/30 to-transparent flex flex-col justify-end p-6 transition-opacity duration-400 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <p 
            className="font-sans text-[9px] tracking-widest uppercase mb-2.5" 
            style={{ color: accent }}
          >
            {getLocalizedTechnique(work.technique)} · {work.year}
          </p>
          <p className="font-serif text-brand-cream text-lg font-light mb-2 leading-tight">
            {work.title}
          </p>
          <p className="font-sans text-brand-cream/50 text-[11px] tracking-wide mb-2.5">
            {work.size}
          </p>
          <p 
            className="font-sans text-[11px] tracking-widest uppercase font-medium"
            style={{ color: work.available ? accent : "rgba(245,237,224,0.35)" }}
          >
            {getLocalizedPrice(work.price)}
          </p>
        </div>

        {/* Accent corner bar */}
        <div 
          className="absolute top-0 right-0 w-[2px] transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]" 
          style={{ 
            height: hovered ? 56 : 0, 
            backgroundColor: accent 
          }} 
        />
      </div>
    </motion.div>
  );
}

// ─── Animas Bible Section ─────────────────────────────────────────────────────

const ANIMAS_SLIDES = [
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820013/01_Portada_ljcbrq.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820014/02_Introducci%C3%B3n_vopmvs.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820016/03_Introducci%C3%B3n_rpdjrc.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820017/04_Veive_cgvvbf.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820018/05_Veive_rftpr5.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820019/06_Veive_pqy387.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820020/07_Veive_vee6mz.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820022/08_Melisa_crsc5e.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820023/09_Melisa_alxiqu.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820024/10_Melisa_teoite.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820025/11_Melisa_yf3wfk.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820026/12_Osceola_fsumn6.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820027/13_Osceola_fqorrq.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820028/14_Osceola_gp4zuk.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820029/15_Mania_ehtvh0.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820030/16_Mania_zbpatm.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820031/17_Feronia_ww6zmk.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820032/18_Feronia_qmleha.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820033/19_Atum_y_Satres_myxu2c.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820034/20_Gran_Espiritu_gnfaxn.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820036/21_Abuela_Ara%C3%B1a_dja5v6.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820037/22_Vesta_ynqsgg.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820038/23_Nethus_notptk.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820039/24_Usil_y_Losna_nib3my.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820040/25_Nortia_y_Vant_kblzdr.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820041/26_Nortia_y_Vant_niuvw7.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820042/27_Line_Up_nhbloe.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820043/28_Props_sttvlg.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820045/29_Arte_final_1_nkseuc.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820044/30_Arte_final_2_ns9rdp.jpg",
  "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820046/31_Resumen_w5ipcb.jpg"
];

function AnimasBibleSection() {
  const { t, language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const updateScrollArrows = () => {
    const el = scrollRef.current;
    if (el) {
      setShowLeftArrow(el.scrollLeft > 10);
      setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (el) {
      const scrollAmount = el.clientWidth * 0.75;
      el.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollLeft > 40);
    updateScrollArrows();
  };

  useEffect(() => {
    updateScrollArrows();
    const handleResize = () => {
      updateScrollArrows();
    };
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(updateScrollArrows, 150);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="bg-[#0e0b07] py-20">
      <div className="px-6 md:px-10 mb-10">
        <motion.div
          initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
          className="flex gap-2.5 items-center mb-6"
        >
          <div className="w-8 h-0.5" style={{ backgroundColor: "#C8A96E" }} />
          <div className="w-2 h-0.5 opacity-35" style={{ backgroundColor: "#C8A96E" }} />
        </motion.div>
        <motion.p
          variants={fadeUp} initial="hidden" animate="visible"
          className="font-sans text-[10px] tracking-[0.32em] uppercase mb-4" style={{ color: "#C8A96E" }}
        >
          {t("collection.animasBible.tagline")}
        </motion.p>
        <motion.h2
          variants={fadeUp} initial="hidden" animate="visible"
          className="font-serif text-brand-cream text-[2.5rem] md:text-[4.5rem] font-light italic leading-[0.95] tracking-tight mb-5"
        >
          {t("collection.animasBible.title")}
        </motion.h2>
        <motion.p
          variants={fadeUp} initial="hidden" animate="visible"
          className="font-sans text-brand-cream/35 text-[12px] leading-relaxed max-w-[520px]"
        >
          {t("collection.animasBible.description")}
        </motion.p>
      </div>

      {/* Horizontal scroll strip container */}
      <div className="relative group/slider">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1, backgroundColor: "rgba(200, 169, 110, 0.15)", borderColor: "rgba(200, 169, 110, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll("left")}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full border border-[#C8A96E]/20 bg-black/50 backdrop-blur-md text-[#C8A96E] shadow-2xl cursor-pointer transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </motion.button>
        )}

        {/* Right Arrow Button */}
        {showRightArrow && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1, backgroundColor: "rgba(200, 169, 110, 0.15)", borderColor: "rgba(200, 169, 110, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll("right")}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full border border-[#C8A96E]/20 bg-black/50 backdrop-blur-md text-[#C8A96E] shadow-2xl cursor-pointer transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </motion.button>
        )}

        {!scrolled && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2 pointer-events-none group-hover/slider:opacity-0 transition-opacity duration-300">
            <span className="font-sans text-[9px] tracking-widest uppercase text-brand-cream/30">
              {language === "es" ? "desplazar" : "scroll"}
            </span>
            <div className="w-6 h-[1px] bg-brand-cream/20" />
          </div>
        )}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto px-6 md:px-10 pb-4 scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {ANIMAS_SLIDES.map((src, i) => (
            <div
              key={i}
              className="flex-shrink-0 relative overflow-hidden rounded group"
              style={{ width: "clamp(260px, 28vw, 420px)", aspectRatio: "16/9" }}
            >
              <img
                src={src}
                alt={`Animas slide ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute bottom-3 left-4 font-sans text-[9px] tracking-widest text-brand-cream/50 uppercase">
                {String(i + 1).padStart(2, "0")} / 31
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ghost watermark */}
      <div className="mt-16 overflow-hidden select-none px-6">
        <p className="font-serif text-brand-cream opacity-[0.03] text-[4rem] md:text-[9rem] font-light italic tracking-tighter leading-none whitespace-nowrap">
          Animas
        </p>
      </div>
    </section>
  );
}

// ─── Collection Page ──────────────────────────────────────────────────────────

export function CollectionPage() {
  const { slug = "ilustracion" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const meta = META[slug] ?? META["ilustracion"];
  
  // Localize metadata dynamically
  const localizedMeta = {
    ...meta,
    title: t(`collection.meta.${slug}.title`) || meta.title,
    label: t(`collection.meta.${slug}.label`) || meta.label,
    statement: t(`collection.meta.${slug}.statement`) || meta.statement,
  };

  const [ctaH, setCtaH] = useState(false);
  const works = WORKS_BY_SLUG[slug] ?? WORKS_BY_SLUG["ilustracion"];

  // Localize work titles on the fly if needed
  const getLocalizedWorkTitle = (title: string) => {
    if (title === "Sin título (Serie verde)") return language === "es" ? "Sin título (Serie verde)" : "Untitled (Green Series)";
    if (title === "Estructura invisible") return language === "es" ? "Estructura invisible" : "Invisible Structure";
    if (title === "Cabeza (Estudio)") return language === "es" ? "Cabeza (Estudio)" : "Head (Study)";
    if (title === "La cabeza") return language === "es" ? "La cabeza" : "The Head";
    if (title === "Kreativität & Schreibkunst") return language === "es" ? "Kreativität & Schreibkunst" : "Creativity & Writing";
    if (title === "The Earth") return language === "es" ? "La Tierra" : "The Earth";
    if (title === "The Sky") return language === "es" ? "El Cielo" : "The Sky";
    if (title === "The Ocean") return language === "es" ? "El Océano" : "The Ocean";

    // Retratos titles localization
    if (title === "Diferentes Edades — Pelirroja") return language === "es" ? "Diferentes Edades — Pelirroja" : "Different Ages — Redhead";
    if (title === "Diferentes Edades — Japonesa") return language === "es" ? "Diferentes Edades — Japonesa" : "Different Ages — Japanese";
    if (title === "Diferentes Edades — Africano") return language === "es" ? "Diferentes Edades — Africano" : "Different Ages — African";
    if (title === "Poses Dinámicas") return language === "es" ? "Poses Dinámicas" : "Dynamic Poses";
    if (title === "Cuerpos Cartoon") return language === "es" ? "Cuerpos Cartoon" : "Cartoon Bodies";
    if (title === "Expresiones — Estudio") return language === "es" ? "Expresiones — Estudio" : "Expressions — Study";
    if (title === "Ciudad Lovecraft") return language === "es" ? "Ciudad Lovecraft" : "Lovecraft City";
    if (title === "Ciudad Lovecraft — Línea") return language === "es" ? "Ciudad Lovecraft — Línea" : "Lovecraft City — Line";
    if (title === "Fachadas — Mundo propio") return language === "es" ? "Fachadas — Mundo propio" : "Facades — Personal World";
    if (title === "Fachada Isométrica") return language === "es" ? "Fachada Isométrica" : "Isometric Facade";
    if (title === "Espacios Abiertos") return language === "es" ? "Espacios Abiertos" : "Open Spaces";
    if (title === "Espacios Acuáticos") return language === "es" ? "Espacios Acuáticos" : "Aquatic Spaces";
    if (title === "Dragón — Caja Musical") return language === "es" ? "Dragón — Caja Musical" : "Dragon — Music Box";
    if (title === "Criatura Grotesca") return language === "es" ? "Criatura Grotesca" : "Grotesque Creature";
    if (title === "Animales Marinos") return language === "es" ? "Animales Marinos" : "Marine Animals";
    if (title === "Mantis Jade — Detalle") return language === "es" ? "Mantis Jade — Detalle" : "Jade Mantis — Detail";
    if (title === "Aves juntas") return language === "es" ? "Aves juntas" : "Birds Together";
    if (title === "Plantigrados — Color") return language === "es" ? "Plantígrados — Color" : "Plantigrades — Color";
    if (title === "Digitígrados — Color") return language === "es" ? "Digitígrados — Color" : "Digitigrades — Color";
    if (title === "Ungulados — Color") return language === "es" ? "Ungulados — Color" : "Ungulates — Color";
    if (title === "Animal Cartoon") return language === "es" ? "Animal Cartoon" : "Cartoon Animal";
    if (title === "Cartoon — Elenco Completo") return language === "es" ? "Cartoon — Elenco Completo" : "Cartoon — Full Cast";
    if (title === "Cyberpunk — Fusión de eras") return language === "es" ? "Cyberpunk — Fusión de eras" : "Cyberpunk — Fusion of Eras";
    if (title === "Futuro y Pasado") return language === "es" ? "Futuro y Pasado" : "Future and Past";
    return title;
  };

  const localizedWorks = works.map((w) => ({
    ...w,
    title: getLocalizedWorkTitle(w.title),
  }));

  // GSAP Flip states and refs
  const [activeWork, setActiveWork] = useState<Work | null>(null);
  const gridRefs = useRef<Record<string | number, HTMLImageElement | null>>({});
  const modalImgRef = useRef<HTMLImageElement | null>(null);
  const modalOverlayRef = useRef<HTMLDivElement | null>(null);

  // Magnifying glass detail zoom state
  const [zoomState, setZoomState] = useState({ show: false, x: 0, y: 0, bgX: 0, bgY: 0 });

  const handleModalMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate background position percentages
    const bgX = (x / rect.width) * 100;
    const bgY = (y / rect.height) * 100;

    setZoomState({
      show: true,
      x: x - 80, // Center of a 160px magnifier
      y: y - 80,
      bgX,
      bgY
    });
  };

  const handleModalMouseLeave = () => {
    setZoomState((prev) => ({ ...prev, show: false }));
  };

  const handleWorkClick = (work: Work) => {
    const gridImg = gridRefs.current[work.id];
    if (gridImg) {
      const state = Flip.getState(gridImg);
      (gridImg as any)._flipState = state;
      gsap.set(gridImg, { opacity: 0 });
    }
    setActiveWork(work);
  };

  useLayoutEffect(() => {
    if (activeWork) {
      const gridImg = gridRefs.current[activeWork.id];
      const modalImg = modalImgRef.current;
      const state = (gridImg as any)?._flipState;
      if (modalImg && state) {
        Flip.from(state, {
          targets: modalImg,
          duration: 0.65,
          ease: "power2.out",
        });
        gsap.to(modalOverlayRef.current, {
          opacity: 0.8,
          duration: 0.35,
          ease: "power2.out"
        });
      }
    }
  }, [activeWork]);

  const closeModal = () => {
    if (!activeWork) return;
    setZoomState((prev) => ({ ...prev, show: false }));
    const gridImg = gridRefs.current[activeWork.id];
    const modalImg = modalImgRef.current;
    if (gridImg && modalImg) {
      const state = Flip.getState(modalImg);
      gsap.set(gridImg, { opacity: 1 });
      setActiveWork(null);
      Flip.from(state, {
        targets: gridImg,
        duration: 0.65,
        ease: "power2.inOut",
        absolute: true
      });
      gsap.to(modalOverlayRef.current, {
        opacity: 0,
        duration: 0.35,
        ease: "power2.inOut"
      });
    } else {
      setActiveWork(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeWork]);

  return (
    <div className="bg-brand-bg text-brand-cream min-h-screen">

      {/* Collection header */}
      <div className="pt-32 pb-14 px-6 md:px-10 max-w-[820px]">
        <motion.div
          initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
          className="flex gap-2.5 items-center mb-6"
        >
          <div className="w-8 h-0.5" style={{ backgroundColor: localizedMeta.accent }} />
          <div className="w-2 h-0.5 opacity-35" style={{ backgroundColor: localizedMeta.accent }} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease }}
          className="font-sans text-[10px] tracking-[0.32em] uppercase mb-4.5"
          style={{ color: localizedMeta.accent }}
        >
          {localizedMeta.label}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease }}
          className="font-serif text-brand-cream text-[4rem] md:text-[7rem] font-light leading-[0.92] tracking-tight mb-9"
        >
          {localizedMeta.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.55, ease }}
          className="font-sans text-brand-cream/50 text-[12.5px] leading-relaxed max-w-[500px]"
        >
          {localizedMeta.statement}
        </motion.p>
      </div>

      {/* Editorial works grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-0.5 mb-1"
      >
        {localizedWorks.map((w) => (
          <WorkCard 
            key={w.id} 
            work={w} 
            accent={localizedMeta.accent} 
            onClick={() => handleWorkClick(w)}
            imgRef={(el) => { gridRefs.current[w.id] = el; }}
          />
        ))}
      </motion.div>

      {/* ─── Animas: Biblia Visual ───────────────────────────────────────── */}
      {slug === "animas" && (
        <AnimasBibleSection />
      )}

      <SharedFooter />

      {/* GSAP Flip Modal */}
      <div 
        className="fixed inset-0 z-55 flex items-center justify-center transition-all duration-300"
        style={{ 
          visibility: activeWork ? "visible" : "hidden",
          pointerEvents: activeWork ? "auto" : "none"
        }}
      >
        {/* Overlay */}
        <div 
          ref={modalOverlayRef}
          className="absolute inset-0 bg-black opacity-0 cursor-pointer"
          onClick={closeModal}
        />
        
        {/* Modal Content container */}
        <div 
          className="relative max-h-[85vh] max-w-[85vw] z-10 flex items-center justify-center overflow-hidden rounded shadow-2xl select-none"
          style={{ aspectRatio: activeWork?.aspect }}
          onMouseMove={handleModalMouseMove}
          onMouseLeave={handleModalMouseLeave}
        >
          {activeWork && (
            <>
              <img
                ref={modalImgRef}
                src={activeWork.img}
                alt={activeWork.title}
                className="w-full h-full object-contain cursor-pointer"
                onClick={closeModal}
              />
              {zoomState.show && (
                <div
                  className="absolute w-[160px] h-[160px] rounded-full pointer-events-none border border-brand-blush/60 shadow-2xl overflow-hidden z-20 hidden md:block"
                  style={{
                    left: zoomState.x,
                    top: zoomState.y,
                    backgroundImage: `url(${activeWork.img})`,
                    backgroundPosition: `${zoomState.bgX}% ${zoomState.bgY}%`,
                    backgroundSize: "280%",
                    backgroundRepeat: "no-repeat",
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Fade up animation helper
const fadeUp = {
  hidden:  { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
};
