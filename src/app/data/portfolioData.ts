export interface CollectionMeta {
  title: string;
  label: string;
  statement: string;
  accent: string;
  twoColumns?: boolean;
}

export interface Work {
  id: number | string;
  title: string;
  year: string;
  technique: string;
  size: string;
  price: string;
  available: boolean;
  img: string;
  imgPos: string;
  gridCol: string;
  aspect: string;
  publicId?: string;
  order?: number;
  featured?: boolean;
}

export const META: Record<string, CollectionMeta> = {
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

export const WORKS_BY_SLUG: Record<string, Work[]> = {
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
    { id: "rt14", title: "Cuerpos Cartoon",             year: "2024", technique: "Anatomía · Proporciones cartoon",   size: "Digital", price: "Encargo", available: true,  img: "https://res.cloudinary.com/doznr2qm4/image/upload/v1781820003/8-Cuerpos-Cartoon-copia_tcgads.jpg",   imgPos: "50% 20%", gridCol: "md:col-span-1", aspect: "3/4"   },
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
