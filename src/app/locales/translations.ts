export type TranslationKeys = typeof translations.es;

export const translations = {
  es: {
    nav: {
      services: "Servicios",
      projects: "Proyectos",
      contact: "Contacto",
      commission: "ENCARGO",
      resume: "Currículum",
      closeMenu: "Cerrar menú",
      openMenu: "Abrir menú"
    },
    hero: {
      tagline: "Ilustradora & artista digital · Madrid",
      greetingBefore: "Hola,\nsoy ",
      greetingItalic: "Nerea",
      artline: "Transformo ideas en mundos visuales con alma.",
      bio1: "Con un Máster en Ilustración y Arte Digital, creo desde lienzos expuestos en galerías de Madrid hasta muñecas personalizadas, joyería y concept art para proyectos musicales. Cada pieza hecha con dedicación y amor por los detalles.",
      bio2: "Realizo cualquier tipo de encargo artístico. Si tienes una idea, puedo darle vida.",
      viewWorks: "Ver trabajos",
      sendInquiry: "Escribir encargo",
      skills: [
        "Ilustración", 
        "Concept art", 
        "Diseño gráfico", 
        "Desarrollo de personajes", 
        "Joyería & arcilla", 
        "Merchandising musical", 
        "Lienzos & galería"
      ]
    },
    gallery: {
      title: "Galería",
      subtitle: "Obras recientes.\nDesplázate para explorar.",
      hint: "scroll para explorar",
      filters: {
        all: "Todos",
        ilustracion: "🎨 Ilustración",
        concept: "🧠 Concept Art",
        musica: "🎵 Diseño musical",
        joyeria: "💍 Joyería"
      },
      alts: {
        obra1: "Ilustración digital de una flor antropomorfa con tipografía pop, serie Musae",
        obra2: "Retrato ilustrado de personaje femenino con cabello azul y elementos marinos",
        obra3: "Personaje femenino envuelto en llamas con bocadillo de cómic, ilustración narrativa",
        obra4: "Bodegón ilustrado de herramientas creativas y setas psicodélicas para el sello musical Diggin'",
        obra5: "Escena de estudio ilustrado con estantería de libros y caballete de pintura",
        obra6: "Pieza de joyería artesanal con detalle ilustrado a mano",
        obra7: "Concept art de paisaje isométrico con cabaña y vegetación",
        obra8: "Detalle de personaje manga a color, estilo característico de Miluarte"
      }
    },
    process: {
      title: "El Proceso Creativo",
      subtitle: "Del Boceto al Arte Final",
      hint: "Desliza la barra central para comparar el trazo de boceto y el acabado digital final de la ilustración.",
      cursorHint: "Deslizar"
    },
    services: {
      ctaBeforeAfter: "↔ Desplázate para ver antes & después",
      render3D: "Render 3D",
      realResult: "Resultado real",
      viewWorks: "Ver trabajos",
      items: {
        "diseno-grafico": {
          label: "Diseño Gráfico",
          title: "Identidad visual\ny comunicación",
          description: "Desde el logotipo hasta el catálogo completo. Banners, publicidad, retoque y composición fotográfica con Photoshop, e ilustración técnica para proyectos comerciales.",
          bullets: ["Logotipos & identidad visual", "Banners & material publicitario", "Catálogos & diseño editorial", "Composición fotográfica", "Ilustración técnica & planos"]
        },
        "3d-stands": {
          label: "3D & Stands",
          title: "Del plano\na la realidad",
          description: "Diseño y visualización 3D de stands para ferias, productos y espacios. Reconstrucciones arquitectónicas y conversión a planos técnicos listos para fabricación y construcción.",
          bullets: ["Diseño de stands para ferias", "Renders de producto fotorrealistas", "Reconstrucciones arquitectónicas", "Planos técnicos para producción", "Visualización de espacios & interiores"]
        },
        "diggin": {
          label: "Diggin'",
          title: "Diseñadora oficial\ndel sello musical",
          description: "Dirección de arte completa para el sello musical independiente Diggin'. Portadas, identidad visual, ilustraciones para campañas y videoclips animados.",
          bullets: ["Portadas de álbum & EP", "Identidad visual del sello", "Ilustraciones musicales", "Videoclips animados", "Merchandising musical"]
        },
        "ilustracion": {
          label: "Ilustraciones",
          title: "Arte personal\nsin filtros",
          description: "Obra libre y la serie Musae. Personajes femeninos, naturaleza subvertida y mundos propios en tinta y color. También muñecas personalizadas, arte en arcilla y joyería artesanal.",
          bullets: ["Serie Musae — prints firmados", "Retratos & encargos personales", "Muñecas articuladas a medida", "Arte en arcilla & escultura", "Joyería artesanal"]
        },
        "concept-art": {
          label: "Concept Art",
          title: "Del concepto\nal universo",
          description: "No solo el dibujo final: el proceso completo de construir un mundo visual desde cero. Personajes con ficha técnica, escenarios coherentes y props diseñados para funcionar en la narrativa.",
          bullets: ["Diseño de personajes & fichas técnicas", "Escenarios & worldbuilding", "Props & objetos narrativos", "Biblias visuales & guías de estilo", "Concept para videojuegos & animación"]
        }
      }
    },
    collection: {
      back: "Volver",
      interest: "¿Te interesa alguna pieza?",
      requestQuote: "Pide presupuesto",
      animasBible: {
        tagline: "Presentación · Biblia Visual Completa",
        title: "El universo Animas",
        description: "Una presentación de 31 páginas que documenta el proceso completo: desde los primeros bocetos de personajes hasta el arte final, las fichas técnicas y el elenco completo del universo."
      },
      meta: {
        ilustracion: {
          title: "Ilustración",
          label: "Obra personal",
          statement: "Obra personal que explora la tensión entre forma y vacío. Series que se construyen desde la intuición y se resuelven en el material. Cada pieza es un estado, no una conclusión."
        },
        diggin: {
          title: "Diggin'",
          label: "Sello musical · Dirección de arte",
          statement: "Portadas, identidad y dirección de arte para el sello independiente Diggin'. Graffiti, psicodelia y hip-hop en formato visual."
        },
        "concept-art": {
          title: "Concept Art",
          label: "Desarrollo visual",
          statement: "Concept art e ilustración editorial. Personajes, atmósferas y narrativa visual construidos desde la emoción."
        },
        "diseno-grafico": {
          title: "Diseño Gráfico",
          label: "Identidad visual",
          statement: "Sistemas de identidad, publicaciones y diseño editorial. La imagen al servicio del mensaje."
        },
        "3d-stands": {
          title: "3D & Stands",
          label: "Diseño de espacios · Ferias",
          statement: "Diseño y visualización 3D de stands y espacios expositivos para ferias y eventos."
        },
        animas: {
          title: "Animas",
          label: "Concept Art · Universo propio",
          statement: "Un mundo construido desde dentro: criaturas que nacen de la naturaleza, personajes con historia propia y un bestiario de formas que nunca termina de revelarse. Animas es un proyecto de concept art completo —fichas técnicas, turn-arounds, expresiones, armas y mascotas— creado como ejercicio de worldbuilding personal."
        },
        retratos: {
          title: "Retratos y más",
          label: "Estudio artístico · Obra de clase",
          statement: "El cuaderno de trabajo. Retratos de iconos que se niegan al olvido, anatomía llevada al límite del cartoon, criaturas extraídas de pesadillas elegantes y ciudades que Lovecraft hubiera firmado. Un archivo de lo que el lápiz aprende cuando no tiene miedo."
        },
        "pasta-ya": {
          title: "Pasta Ya",
          label: "Diseño de personajes · Campaña",
          statement: "Cuando la pasta italiana cobra vida propia y muy mal carácter. Bravioli, Tortastini y sus colegas son personajes de diseño para campaña: expresivos, únicos y con más personalidad por centímetro cuadrado que la mayoría de protagonistas de Hollywood."
        }
      },
      availability: {
        available: "Disponible",
        unavailable: "No disponible",
        musicalProject: "Proyecto musical"
      }
    },
    footer: {
      studio: "Estudio creativo multidisciplinar.\nIlustración, diseño y dirección de arte.\nMadrid, España.",
      work: "Trabajo",
      contact: "Contacto",
      budget: "Pide presupuesto",
      rights: "© 2024 Miluarte. Todos los derechos reservados.",
      madeWithCriteria: "Hecho con amor por @snctryjo - Josue."
    },
    notfound: {
      title: "Página no encontrada",
      back: "Volver al inicio"
    },
    resume: {
      title: "Currículum Vitae",
      subtitle: "Nerea — Artista Visual, Diseñadora 3D e Ilustradora",
      downloadPDF: "Guardar como PDF / Imprimir",
      back: "Volver al inicio",
      sections: {
        profile: "Sobre Mí",
        experience: "Experiencia Profesional",
        education: "Educación",
        skills: "Habilidades",
        languages: "Idiomas"
      },
      profileText: "Artista visual multidisciplinar con un Máster en Ilustración y Arte Digital. Especializada en la dirección de arte para proyectos musicales, diseño tridimensional de stands comerciales y modelado físico de muñecas personalizadas y joyería. Combino técnicas tradicionales con herramientas digitales de última generación para crear narrativas visuales coherentes y espacios físicos impactantes.",
      experienceItems: [
        {
          role: "Dirección de Arte & Diseño de Merchandising",
          company: "Diggin' Records (Sello independiente)",
          period: "2022 - Presente",
          description: "Dirección artística general de lanzamientos físicos y digitales. Diseño de portadas de vinilos, merchandising oficial, campañas promocionales ilustradas y dirección de videoclips animados."
        },
        {
          role: "Diseño 3D de Stands & Espacios Expositivos",
          company: "Freelance / Agencias de Eventos",
          period: "2021 - Presente",
          description: "Diseño y visualización fotorrealista en 3D de stands para ferias comerciales, exposiciones y tiendas retail. Elaboración de planos técnicos para producción y fabricación real."
        },
        {
          role: "Artista Plástica e Ilustradora Freelance",
          company: "Estudio Propio (Miluarte)",
          period: "2020 - Presente",
          description: "Creación de obra artística personal expuesta en galerías de Madrid. Realización de encargos de retratos personalizados, modelado de muñecas articuladas en arcilla polimérica y diseño de joyería artesanal."
        }
      ],
      educationItems: [
        {
          degree: "Máster en Ilustración y Arte Digital",
          school: "ESNE - Escuela Universitaria de Diseño, Innovación y Tecnología, Madrid",
          period: "2019 - 2020"
        },
        {
          degree: "Grado en Diseño Gráfico y Dirección de Arte",
          school: "Universidad de Barcelona / Escuelas de Diseño",
          period: "2015 - 2019"
        }
      ],
      skillsItems: {
        digital: "Digital: Photoshop, Illustrator, Procreate, Blender 3D, CAD (Planos Técnicos).",
        traditional: "Tradicional: Pintura al óleo, acuarela, tinta, escultura en arcilla, joyería artesanal.",
        creative: "Concepto: Dirección de arte, concept art, diseño de personajes, maquetación editorial."
      },
      languagesItems: [
        { language: "Español", level: "Nativo" },
        { language: "Inglés", level: "Fluido (C1 / Profesional)" }
      ]
    },
    booking: {
      title: "Cuéntame tu proyecto",
      subtitle: "Hablemos de tu idea. Rellena los pasos y te responderé en menos de 48 horas.",
      close: "Cerrar",
      next: "Siguiente",
      prev: "Atrás",
      submit: "Enviar solicitud",
      steps: {
        step: "Paso",
        of: "de",
        type: "Tipo de proyecto",
        details: "Detalles del encargo",
        contact: "Datos de contacto"
      },
      types: {
        commercial: {
          title: "Proyecto Comercial",
          desc: "Stands 3D, identidad visual corporativa, branding, concept art para estudios/discográficas."
        },
        personal: {
          title: "Proyecto Personal",
          desc: "Muñecas de arcilla personalizadas, joyería a medida, prints firmados, retratos digitales."
        }
      },
      fields: {
        description: "Describe tu idea (estilo, referencias, materiales...)",
        descriptionPlaceholder: "Ej: Quiero una muñeca personalizada inspirada en la temática del bosque, de unos 20 cm...",
        timeline: "¿Cuándo lo necesitas?",
        timelinePlaceholder: "Ej: Para antes del 15 de Octubre",
        name: "Nombre completo",
        email: "Correo electrónico",
        budget: "Presupuesto aproximado",
        budgetRanges: ["Menos de 300€", "300€ - 1.000€", "1.000€ - 3.000€", "Más de 3.000€"]
      },
      success: {
        title: "¡Solicitud enviada!",
        message: "Gracias por contactar. Analizaré tu propuesta de inmediato para darle vida a tu idea.",
        close: "Volver a la web"
      }
    },
    featured: {
      eyebrow: "Proyecto destacado",
      tag: "Diggin' Records",
      title: "Diggin' — identidad visual de un sello musical",
      description: "Dirección de arte completa para el sello independiente Diggin': portadas de álbum, identidad visual, ilustraciones para campañas y videoclips animados. Un proyecto largo donde el estilo de Nerea se convirtió en la cara visual del sello.",
      tags: ["Dirección de arte", "Portadas de álbum", "Branding musical", "Animación"],
      bullets: [
        "Concepto visual y moodboard inicial",
        "Portadas de álbum y EP",
        "Identidad visual del sello",
        "Adaptaciones para redes sociales"
      ],
      viewCase: "Ver caso completo →"
    },
    clients: {
      eyebrow: "Clientes & colaboraciones",
      title: "Marcas, sellos y proyectos con los que he trabajado",
      description: "He colaborado con músicos, marcas y proyectos creativos desarrollando identidades visuales e ilustraciones personalizadas."
    },
    seoServices: {
      eyebrow: "Servicios",
      title: "En qué puedo ayudarte",
      description: "Encargos artísticos a medida, desde una pieza personal hasta dirección de arte completa para una marca o un sello musical.",
      items: {
        editorial: {
          title: "Ilustración Editorial",
          description: "Creación de ilustraciones para libros, revistas y publicaciones digitales, con un estilo narrativo que refuerza el mensaje de cada página."
        },
        concept: {
          title: "Concept Art",
          description: "Diseño visual para videojuegos, proyectos audiovisuales y narrativa visual: personajes, escenarios y props pensados para un mundo coherente."
        },
        character: {
          title: "Diseño de Personajes",
          description: "Creación de personajes originales para proyectos creativos, marcas y campañas, con fichas técnicas y guías de estilo."
        },
        music: {
          title: "Portadas Musicales",
          description: "Arte para álbumes, singles y material promocional, con dirección de arte completa para sellos y artistas independientes."
        },
        graphic: {
          title: "Diseño Gráfico",
          description: "Identidad visual, banners, catálogos y diseño editorial para proyectos comerciales y culturales."
        },
        clay: {
          title: "Joyería & Arte en Arcilla",
          description: "Piezas artesanales únicas: joyería, muñecas personalizadas y esculturas en arcilla hechas a mano."
        }
      }
    }
  },
  en: {
    nav: {
      services: "Services",
      projects: "Projects",
      contact: "Contact",
      commission: "COMMISSION",
      resume: "Resume / CV",
      closeMenu: "Close menu",
      openMenu: "Open menu"
    },
    hero: {
      tagline: "Illustrator & digital artist · Madrid",
      greetingBefore: "Hello,\nI'm ",
      greetingItalic: "Nerea",
      artline: "I transform ideas into visual worlds with soul.",
      bio1: "With a Master's Degree in Illustration and Digital Art, I create everything from canvases exhibited in Madrid galleries to custom dolls, jewelry, and concept art for music projects. Each piece crafted with dedication and love for details.",
      bio2: "I take all kinds of artistic commissions. If you have an idea, I can bring it to life.",
      viewWorks: "View works",
      sendInquiry: "Send inquiry",
      skills: [
        "Illustration", 
        "Concept art", 
        "Graphic design", 
        "Character development", 
        "Clay & jewelry", 
        "Music merchandising", 
        "Canvases & gallery"
      ]
    },
    gallery: {
      title: "Gallery",
      subtitle: "Recent works.\nScroll to explore.",
      hint: "scroll to navigate",
      filters: {
        all: "All",
        ilustracion: "🎨 Illustration",
        concept: "🧠 Concept Art",
        musica: "🎵 Music Design",
        joyeria: "💍 Jewelry"
      },
      alts: {
        obra1: "Digital illustration of an anthropomorphic flower with pop typography, Musae series",
        obra2: "Illustrated portrait of a female character with blue hair and marine elements",
        obra3: "Female character enveloped in flames with a comic bubble, narrative illustration",
        obra4: "Illustrated still life of creative tools and psychedelic mushrooms for the Diggin' music label",
        obra5: "Illustrated studio scene with a book shelf and a painting easel",
        obra6: "Handcrafted jewelry piece with hand-illustrated detail",
        obra7: "Isometric landscape concept art with a cabin and vegetation",
        obra8: "Detail of a colored manga character, characteristic Miluarte style"
      }
    },
    process: {
      title: "The Creative Process",
      subtitle: "From Sketch to Final Art",
      hint: "Slide the center bar to compare the pencil sketch lines and the final digital render of the artwork.",
      cursorHint: "Slide"
    },
    services: {
      ctaBeforeAfter: "↔ Scroll to see before & after",
      render3D: "3D Render",
      realResult: "Real result",
      viewWorks: "View works",
      items: {
        "diseno-grafico": {
          label: "Graphic Design",
          title: "Visual identity\n& communication",
          description: "From logos to full catalogs. Banners, advertising, photo editing and composition with Photoshop, and technical illustration for commercial projects.",
          bullets: ["Logos & visual identity", "Banners & advertising material", "Catalogs & editorial design", "Photographic composition", "Technical illustration & drafts"]
        },
        "3d-stands": {
          label: "3D & Stands",
          title: "From blueprint\nto reality",
          description: "3D design and visualization of exhibition stands, products, and spaces. Architectural reconstructions and technical blueprints ready for manufacturing and construction.",
          bullets: ["Fair stand design", "Photorealistic product renders", "Architectural reconstructions", "Technical blueprints for production", "Space & interior visualization"]
        },
        "diggin": {
          label: "Diggin'",
          title: "Official designer\nof the music label",
          description: "Complete art direction for the independent music label Diggin'. Covers, visual identity, campaign illustrations, and animated music videos.",
          bullets: ["Album & EP covers", "Label visual identity", "Musical illustrations", "Animated music videos", "Music merchandising"]
        },
        "ilustracion": {
          label: "Illustrations",
          title: "Personal art\nwithout filters",
          description: "Free work and the Musae series. Female characters, subverted nature, and unique worlds in ink and color. Also custom art-dolls, clay art, and handmade jewelry.",
          bullets: ["Musae Series — signed prints", "Portraits & personal commissions", "Custom ball-jointed dolls", "Clay art & sculpture", "Handmade jewelry"]
        },
        "concept-art": {
          label: "Concept Art",
          title: "From concept\nto universe",
          description: "Not just the final drawing: the complete process of building a visual world from scratch. Characters with model sheets, coherent environments, and props designed for narrative function.",
          bullets: ["Character design & model sheets", "Environments & worldbuilding", "Props & narrative objects", "Visual bibles & style guides", "Concept for games & animation"]
        }
      }
    },
    collection: {
      back: "Back",
      interest: "Interested in any piece?",
      requestQuote: "Request quote",
      animasBible: {
        tagline: "Presentation · Complete Visual Bible",
        title: "The Animas Universe",
        description: "A 31-page presentation documenting the full process: from early character sketches to final art, model sheets, and the complete cast of the universe."
      },
      meta: {
        ilustracion: {
          title: "Illustration",
          label: "Personal work",
          statement: "Personal work exploring the tension between form and void. Series built from intuition and resolved in the material. Each piece is a state, not a conclusion."
        },
        diggin: {
          title: "Diggin'",
          label: "Music label · Art direction",
          statement: "Covers, identity, and art direction for the independent label Diggin'. Graffiti, psychedelia, and hip-hop in visual format."
        },
        "concept-art": {
          title: "Concept Art",
          label: "Visual development",
          statement: "Concept art and editorial illustration. Characters, atmospheres, and visual storytelling built from emotion."
        },
        "diseno-grafico": {
          title: "Graphic Design",
          label: "Visual identity",
          statement: "Identity systems, publications, and editorial design. The image at the service of the message."
        },
        "3d-stands": {
          title: "3D & Stands",
          label: "Space design · Fairs",
          statement: "3D design and visualization of stands and exhibition spaces for fairs and events."
        },
        animas: {
          title: "Animas",
          label: "Concept Art · Personal Universe",
          statement: "A world built from within: creatures born of nature, characters with their own story, and a bestiary of forms that never stops revealing itself. Animas is a complete concept art project — model sheets, turn-arounds, expressions, weapons, and companion creatures — created as a personal worldbuilding exercise."
        },
        retratos: {
          title: "Portraits & more",
          label: "Art studies · Sketchbook",
          statement: "The working sketchbook. Portraits of icons who refuse to be forgotten, anatomy pushed to the edge of cartoon, creatures pulled from elegant nightmares, and cities Lovecraft himself would have signed. An archive of what the pencil learns when it has nothing to fear."
        },
        "pasta-ya": {
          title: "Pasta Ya",
          label: "Character design · Campaign",
          statement: "When Italian pasta takes on a life of its own — and a very bad attitude. Bravioli, Tortastini, and their crew are campaign-ready character designs: expressive, unique, and packed with more personality per square centimetre than most Hollywood protagonists."
        }
      },
      availability: {
        available: "Available",
        unavailable: "Not available",
        musicalProject: "Music project"
      }
    },
    footer: {
      studio: "Multidisciplinary creative studio.\nIllustration, design, and art direction.\nBarcelona, Spain.",
      work: "Work",
      contact: "Contact",
      budget: "Request budget",
      rights: "© 2024 All rights reserved.",
      madeWithCriteria: "Made with criteria."
    },
    notfound: {
      title: "Page not found",
      back: "Back to home"
    },
    resume: {
      title: "Curriculum Vitae",
      subtitle: "Nerea — Visual Artist, 3D Designer & Illustrator",
      downloadPDF: "Save as PDF / Print",
      back: "Back to home",
      sections: {
        profile: "Profile",
        experience: "Professional Experience",
        education: "Education",
        skills: "Skills",
        languages: "Languages"
      },
      profileText: "Multidisciplinary visual artist with a Master's in Illustration and Digital Art. Specialized in art direction for music projects, 3D stand design for commercial fairs, and custom ball-jointed clay doll and jewelry creation. I combine traditional techniques with cutting-edge digital tools to create cohesive visual stories and impactful physical spaces.",
      experienceItems: [
        {
          role: "Art Direction & Merchandising Design",
          company: "Diggin' Records (Independent label)",
          period: "2022 - Present",
          description: "General art direction for physical and digital releases. Vinyl cover design, official merchandise, illustrated promotional campaigns, and art direction for animated music videos."
        },
        {
          role: "3D Stand & Exhibition Design",
          company: "Freelance / Event Agencies",
          period: "2021 - Present",
          description: "3D design and photorealistic rendering of stands for commercial fairs, exhibitions, and retail stores. Development of technical plans for production and real construction."
        },
        {
          role: "Visual Artist & Freelance Illustrator",
          company: "Own Studio (Miluarte)",
          period: "2020 - Present",
          description: "Creation of personal art pieces exhibited in galleries in Madrid. Customized portrait commissions, ball-jointed doll sculpting in polymer clay, and handmade jewelry design."
        }
      ],
      educationItems: [
        {
          degree: "Master's Degree in Illustration and Digital Art",
          school: "ESNE - University School of Design, Innovation and Technology, Madrid",
          period: "2019 - 2020"
        },
        {
          degree: "Bachelor's Degree in Graphic Design & Art Direction",
          school: "University of Barcelona / Design Schools",
          period: "2015 - 2019"
        }
      ],
      skillsItems: {
        digital: "Digital: Photoshop, Illustrator, Procreate, Blender 3D, CAD (Technical Plans).",
        traditional: "Traditional: Oil painting, watercolor, ink, clay sculpting, handmade jewelry.",
        creative: "Concept: Art direction, concept art, character design, editorial layout."
      },
      languagesItems: [
        { language: "Spanish", level: "Native" },
        { language: "English", level: "Fluent (C1 / Professional)" }
      ]
    },
    booking: {
      title: "Tell me about your project",
      subtitle: "Let's talk about your idea. Fill in the steps and I will get back to you within 48 hours.",
      close: "Close",
      next: "Next",
      prev: "Back",
      submit: "Submit request",
      steps: {
        step: "Step",
        of: "of",
        type: "Project Type",
        details: "Project Details",
        contact: "Contact Information"
      },
      types: {
        commercial: {
          title: "Commercial Project",
          desc: "3D stands, corporate visual identity, branding, concept art for studios/labels."
        },
        personal: {
          title: "Personal Project",
          desc: "Custom clay dolls, bespoke jewelry, signed prints, digital portraits."
        }
      },
      fields: {
        description: "Describe your idea (style, references, materials...)",
        descriptionPlaceholder: "E.g. I would like a custom clay doll inspired by forest themes, about 20 cm...",
        timeline: "When do you need it?",
        timelinePlaceholder: "E.g. Before October 15th",
        name: "Full Name",
        email: "Email address",
        budget: "Approximate budget",
        budgetRanges: ["Under €300", "€300 - €1,000", "€1,000 - €3,000", "Over €3,000"]
      },
      success: {
        title: "Request sent!",
        message: "Thank you for reaching out. I will analyze your proposal immediately to bring your idea to life.",
        close: "Back to website"
      }
    },
    featured: {
      eyebrow: "Featured Project",
      tag: "Diggin' Records",
      title: "Diggin' — visual identity of a music label",
      description: "Complete art direction for the independent label Diggin': album covers, visual identity, campaign illustrations, and animated music videos. A long-term project where Nerea's style became the visual face of the label.",
      tags: ["Art Direction", "Album Covers", "Music Branding", "Animation"],
      bullets: [
        "Visual concept and initial moodboard",
        "Album and EP covers",
        "Visual identity of the label",
        "Social media adaptations"
      ],
      viewCase: "View full case →"
    },
    clients: {
      eyebrow: "Clients & collaborations",
      title: "Brands, labels and projects I've worked with",
      description: "I've collaborated with musicians, brands and creative projects, developing visual identities and custom illustrations."
    },
    seoServices: {
      eyebrow: "Services",
      title: "How I can help you",
      description: "Bespoke artistic commissions, from a personal piece to full art direction for a brand or a music label.",
      items: {
        editorial: {
          title: "Editorial Illustration",
          description: "Creating illustrations for books, magazines and digital publications, with a storytelling style that reinforces the message of each page."
        },
        concept: {
          title: "Concept Art",
          description: "Visual design for video games, audiovisual projects and visual storytelling: characters, environments and props designed for a coherent world."
        },
        character: {
          title: "Character Design",
          description: "Creation of original characters for creative projects, brands and campaigns, with model sheets and style guides."
        },
        music: {
          title: "Music Covers",
          description: "Artwork for albums, singles and promotional material, with full art direction for labels and independent artists."
        },
        graphic: {
          title: "Graphic Design",
          description: "Visual identity, banners, catalogs and editorial design for commercial and cultural projects."
        },
        clay: {
          title: "Jewelry & Clay Art",
          description: "Unique handcrafted pieces: jewelry, custom art-dolls and hand-sculpted clay figures."
        }
      }
    }
  }
};
