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
  process: { src: string; label: string }[];
  makingOfVideoMp4?: string;
  makingOfVideoWebm?: string;
  order?: number;
}

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
    makingOfVideoWebm: "/videos/miluarte/archivo/sample-bbb.mp4"
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
    ]
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
    makingOfVideoWebm: "/videos/miluarte/archivo/sample-bbb.mp4"
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
    ]
  }
];
