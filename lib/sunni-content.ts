/**
 * EL CONTENIDO DE LA PORTADA DE SUN-I PROJECT®.
 *
 * Los textos vienen de la especificación de marca de Emmy, literales salvo
 * donde se indica. Viven aquí y no repartidos por la maquetación para que
 * revisar el copy sea leer un archivo, y para que pasarlos a Sanity —cuando
 * toque— sea mover datos y no reescribir componentes.
 *
 * IDIOMA
 *
 * Titulares y llamadas a la acción en inglés, cuerpo en español. Es la regla de
 * la marca, no una inconsistencia.
 */

export const MARCA = {
  nombre: "Sun-i project®",
  /** Lo que la marca promete, en una línea. Sale en el pie y en los metadatos. */
  tagline: "A little more Sun-i in your everyday.",
  /** De su prompt original. Explica la marca mejor que el tagline. */
  promesa: "Everyday wellness, made easy.",
  instagram: "https://www.instagram.com/thesuniproject/",
  correo: "hola@sun-iproject.com",
} as const;

export const HERO = {
  badge: "Everyday wellness brand",
  titulo: "A little more",
  tituloAcento: "Sun-i",
  tituloFin: "in your everyday.",
  texto:
    "Sun-i project® es una marca de everyday wellness: productos, espacios y tecnología que hacen que cuidarte " +
    "sea parte natural del día. No una tarea más — algo que ya está ahí cuando lo necesitas.",
  pills: ["snack", "hydrate", "focus", "energy", "recover", "feel good"],
  tarjeta: { titulo: "Sun-i Vending", texto: "Uno de nuestros primeros touchpoints" },
} as const;

export const MARQUEE = [
  "everyday wellness",
  "smart retail",
  "curaduría real",
  "diseño primero",
  "hábitos, no dietas",
  "comunidad",
] as const;

export const ABOUT = {
  eyebrow: "About",
  titulo: "No somos una máquina.",
  tituloAcento: "Somos un hábito.",
  p1:
    "Sun-i project® nace de una idea simple: el bienestar se volvió complicado. Planes, apps, suscripciones y " +
    "promesas que no caben en un martes cualquiera. Creemos en lo contrario — que sentirte bien debería ser lo " +
    "más fácil de tu día.",
  p2:
    "Por eso construimos un ecosistema de everyday wellness: diseño, tecnología y curaduría real que convierten " +
    "los micro-momentos cotidianos en pausas que sí suman. Sun-i vive en la ciudad, en la oficina, en el campus " +
    "y en el gym — en cada lugar donde la vida ya está pasando.",
  cierre: "Wellness shouldn't feel like another task. It should be there when you need it.",
  pilares: [
    {
      tag: "Purpose",
      titulo: "Hacer el bienestar inevitable",
      texto:
        "Que sentirse bien no dependa de tiempo, planes ni fuerza de voluntad. Ponemos lo bueno justo donde la " +
        "vida ya sucede.",
    },
    {
      tag: "Mission",
      titulo: "Everyday wellness, sin fricción",
      texto:
        "Diseñamos productos, espacios y tecnología que convierten los micro-momentos del día en pausas de " +
        "cuidado accesibles y hermosas.",
    },
    {
      tag: "Vision",
      titulo: "Un ecosistema de mejor vivir",
      texto:
        "Ser la marca que redefine cómo se vive el bienestar todos los días, a través de múltiples touchpoints " +
        "físicos y digitales.",
    },
  ],
  manifiesto: "Que cuidarte sea lo más fácil de tu día.",
} as const;

export const RECORRIDO = {
  eyebrow: "How Sun-i works",
  titulo: "Cuatro pasos, cero fricción.",
  intro: "Así funciona el ecosistema: desde lo que curamos hasta cómo se siente en tu día.",
  pasos: [
    { n: "01", tag: "Discover", texto: "Curamos marcas y productos que valen la pena: reales, funcionales y con historia." },
    { n: "02", tag: "Access", texto: "Acceso instantáneo y sin fricción, en los espacios donde ya pasas tu día." },
    { n: "03", tag: "Experience", texto: "Momentos diseñados para sentirse bien: producto, entorno y detalle." },
    { n: "04", tag: "Connect", texto: "Comunidades, marcas y espacios conectados alrededor de mejores días." },
  ],
} as const;

export const VENDING = {
  eyebrow: "Uno de nuestros primeros touchpoints",
  titulo: "Sun-i Vending",
  texto:
    "Una unidad de diseño minimalista con curaduría de bienestar, pantalla inteligente y pago sin fricción. Es " +
    "una de las primeras formas de vivir Sun-i — no la marca completa, sino la puerta de entrada al ecosistema.",
  categorias: ["Snack", "Hydrate", "Energy", "Focus", "Recover", "Essentials", "Discover"],
  frase: "Choose your good mood here.",
  cta: "Quiero una Sun-i en mi espacio",
} as const;

export const MOODS = {
  eyebrow: "Inside Sun-i",
  titulo: "Elige por cómo quieres sentirte.",
  intro:
    "Nuestra curaduría no se organiza por categorías de supermercado, sino por moods cotidianos. Marcas reales, " +
    "ingredientes limpios, cero relleno.",
  items: [
    { icono: "ShoppingBag", nombre: "Snack", texto: "Antojos que sí nutren, sin culpas ni etiquetas raras." },
    { icono: "Droplets", nombre: "Hydrate", texto: "Bebidas limpias para volver a ti a media tarde." },
    { icono: "Zap", nombre: "Energy", texto: "Impulso funcional cuando el día pide un poco más." },
    { icono: "Target", nombre: "Focus", texto: "Claridad para estudiar, crear y sostener el ritmo." },
    { icono: "Leaf", nombre: "Recover", texto: "Lo que tu cuerpo agradece después del esfuerzo." },
    { icono: "Sparkles", nombre: "Essentials", texto: "Los básicos de self-care que siempre olvidas traer." },
  ],
} as const;

export const EXPERIENCIAS = {
  eyebrow: "Experiencias Sun-i — otro touchpoint del ecosistema",
  titulo: "Activa el día, comparte el bienestar.",
  texto:
    "Llevamos experiencias de bienestar a oficinas, instituciones, escuelas y comunidades. Sesiones cortas, " +
    "facilitadas por expertos, diseñadas para crear micro-momentos de cuidado colectivo: activar el cuerpo, " +
    "calmar la mente y reconectar equipos sin interrumpir el día.",
  tipos: [
    { icono: "Brain", nombre: "Mindfulness", texto: "Pausas guiadas para recargar la mente y bajar el ritmo del día." },
    { icono: "Flower2", nombre: "Yoga", texto: "Clases que combinan respiración, postura y presencia consciente." },
    { icono: "Move", nombre: "Movilidad", texto: "Sesiones cortas que suavizan el cuerpo después de horas sentado." },
    { icono: "Dumbbell", nombre: "Ejercicio funcional", texto: "Micro-workouts que se adaptan a cualquier nivel y espacio." },
    { icono: "Users", nombre: "Activaciones", texto: "Momentos de bienestar compartido que conectan equipos y comunidades." },
  ],
  frase: "Bienestar que se programa, se siente y se comparte.",
  cta: "Lleva una experiencia Sun-i a tu espacio",
} as const;

export const ESPACIOS = {
  eyebrow: "Where Sun-i lives",
  titulo: "Donde la vida sucede, Sun-i pertenece.",
  items: [
    { icono: "Dumbbell", nombre: "Gyms & Studios", texto: "Recarga antes y después del workout, sin salir del flow." },
    { icono: "GraduationCap", nombre: "Universidades", texto: "Energía limpia para maratones de estudio, 24/7." },
    { icono: "Building2", nombre: "Oficinas", texto: "Pausas que sí recuperan a tu equipo entre juntas." },
    { icono: "Home", nombre: "Residencial", texto: "Lo esencial, en el lobby de casa, sin ir al súper." },
    { icono: "BedDouble", nombre: "Hoteles", texto: "Un toque wellness que tus huéspedes recuerdan." },
    { icono: "HeartPulse", nombre: "Clínicas & Wellness", texto: "Opciones cuidadas para quienes cuidan a otros." },
  ],
  cta: "Bring Sun-i to your space",
} as const;

export const MARCAS = {
  eyebrow: "For brands",
  titulo: "Partner with Sun-i",
  texto:
    "Sun-i es un punto de contacto premium con comunidades que cuidan lo que consumen. Si tu marca comparte esa " +
    "filosofía, hay un lugar para ti en nuestro universo.",
  items: [
    { icono: "Package", tag: "Product placement", texto: "Tu marca dentro de la curaduría Sun-i, frente a comunidades que compran con intención." },
    { icono: "FlaskConical", tag: "Sampling", texto: "Pruebas de producto medibles, con datos reales de rotación y preferencia por espacio." },
    { icono: "Megaphone", tag: "Activations", texto: "Activaciones en pantalla y en sitio: lanza, cuenta historias y conecta donde la gente ya está." },
    { icono: "Handshake", tag: "Co-branding", texto: "Colaboraciones de largo plazo para construir rituales, no solo impresiones." },
  ],
  cta: "Let's collaborate",
} as const;

export const BRING = {
  titulo: "Bring Sun-i to your space.",
  texto:
    "¿Tienes un gym, campus, oficina, hotel o espacio con comunidad? Instalamos, surtimos y operamos por ti — sin " +
    "costo de instalación y sin contratos eternos. Solo una experiencia que tu gente va a querer usar todos los días.",
  cta: "I want Sun-i",
} as const;

export const EFECTO = {
  eyebrow: "The Sun-i effect",
  titulo: "Pequeños momentos, mejores días.",
  /**
   * Sin métricas. La especificación lo pide explícitamente y es lo correcto:
   * inventar números de impacto en una marca que apenas arranca es la clase de
   * dato que alguien acaba citando en una junta.
   */
  texto: "Estamos midiendo el impacto real de Sun-i en las comunidades donde vive. Muy pronto compartiremos aquí los resultados.",
  items: [
    { titulo: "Para las personas", texto: "Mejores decisiones cotidianas, sin esfuerzo extra." },
    { titulo: "Para los espacios", texto: "Un amenity que la comunidad usa, recuerda y agradece." },
    { titulo: "Para las marcas", texto: "Un touchpoint premium con contexto y intención real." },
  ],
} as const;

export const SEO = {
  titulo: "Sun-i project® — A little more Sun-i in your everyday",
  descripcion:
    "Sun-i project® es una marca de everyday wellness: productos, espacios y tecnología que hacen que cuidarte " +
    "sea parte natural del día.",
} as const;
