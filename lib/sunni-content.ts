/**
 * EL CONTENIDO DE LA PORTADA DE SUN-I PROJECT®.
 *
 * LA PASADA DE SIMPLIFICACIÓN
 *
 * La portada tenía doce secciones y explicaba la filosofía de la marca antes de
 * explicar el producto. Alguien que entraba —el dueño de un gym, una
 * universidad, una oficina— tenía que leer un manifiesto, tres pilares, un
 * recorrido de cuatro pasos y una promesa de métricas futuras antes de
 * entender qué se le estaba ofreciendo.
 *
 * Ahora son siete, y el orden responde las preguntas según se hacen: qué es
 * esto, qué hacen, para quién es, qué implica, qué hago ahora.
 *
 * LO QUE SE FUE, Y POR QUÉ
 *
 *   Banda en movimiento   repetía conceptos de marca sin añadir información.
 *   Purpose/Mission/Vision  tres formas de decir lo mismo, ninguna explica el
 *                           producto. Lo esencial vive en «Qué hacemos».
 *   How Sun-i Works       Discover/Access/Experience/Connect era un armazón de
 *                           marca, no el funcionamiento real.
 *   Inside Sun-i          la información SÍ servía —explica el producto— así
 *                           que se mudó dentro de Vending, que es su sitio.
 *   The Sun-i Effect      tres bloques de «coming soon». Vuelve cuando existan
 *                           métricas reales.
 *
 * LA REGLA DE ESTA VERSIÓN
 *
 * Si una frase no ayuda a entender el producto, no está. No hay frases
 * escritas para sonar bien.
 *
 * IDIOMA: titulares y llamadas a la acción en inglés, cuerpo en español. Es
 * regla de la marca, no una inconsistencia.
 */

export const MARCA = {
  nombre: "Sun‑i project®",
  tagline: "A little more Sun‑i in your everyday.",
  promesa: "Everyday wellness, made easy.",
  instagram: "https://www.instagram.com/thesuniproject/",
  correo: "hola@sun-iproject.com",
} as const;

/* ── 01 · HERO ─────────────────────────────────────────────────────────────
   Una frase. La definición prioriza PRODUCTOS + ESPACIOS + EXPERIENCIAS.

   Antes decía «productos, espacios y tecnología». La tecnología apoya al
   producto —la pantalla, el pago— pero no es una línea del negocio, y
   ponerla en la definición dejaba fuera justo la mitad de lo que Sun‑i hace.

   Se fueron las etiquetas (snack · hydrate · focus…) porque ahora viven
   dentro de Vending, donde explican el producto en vez de decorar el hero.  */
export const HERO = {
  badge: "Everyday wellness brand",
  titulo: "A little more",
  tituloAcento: "Sun‑i",
  tituloFin: "in your everyday.",
  texto:
    "Sun‑i project® es una marca de everyday wellness: productos, espacios y experiencias que hacen que cuidarte " +
    "sea parte natural de tu día.",
} as const;

/* ── 02 · QUÉ HACEMOS ──────────────────────────────────────────────────────
   La sección que hace que alguien diga «ah, ya entendí».

   No repite que el vending no es toda la marca: enseña las dos formas una al
   lado de la otra y deja que la arquitectura lo diga sola.                   */
export const QUE_HACEMOS = {
  eyebrow: "What is Sun‑i",
  titulo: "Hoy Sun‑i llega de dos maneras.",
  bloques: [
    {
      ancla: "#vending",
      rotulo: "Sun‑i Vending",
      titulo: "Productos donde ya pasas el día.",
      texto:
        "Unidades con una selección de everyday wellness dentro de gyms, oficinas, universidades, hoteles y " +
        "espacios con comunidad.",
      enlace: "Ver Sun‑i Vending",
    },
    {
      ancla: "#experiences",
      rotulo: "Sun‑i Experiences",
      titulo: "Bienestar que llevamos a tu gente.",
      texto:
        "Sesiones cortas facilitadas por expertos para oficinas, universidades, instituciones y comunidades.",
      enlace: "Ver Sun‑i Experiences",
    },
  ],
} as const;

/* ── 03 · VENDING ──────────────────────────────────────────────────────────
   Absorbe «Inside Sun‑i»: los seis moods explican el producto, así que su
   sitio es aquí y no en una sección propia.                                  */
export const VENDING = {
  eyebrow: "Sun‑i Vending",
  titulo: "Una unidad en tu espacio, con lo que tu gente necesita.",
  texto:
    "Diseño minimalista, pantalla inteligente y pago sin fricción. Nosotros elegimos los productos, instalamos la " +
    "unidad, la surtimos y la operamos.",
  // Aclaración de una línea, no de un párrafo repetido cuatro veces.
  nota: "Es una de las formas de vivir Sun‑i, no la marca entera.",
  moodsTitulo: "Elige según lo que necesitas",
  moods: [
    { icono: "Droplets", nombre: "Hydrate", texto: "Bebidas limpias para volver a ti a media tarde." },
    { icono: "Zap", nombre: "Energy", texto: "Impulso funcional cuando el día pide un poco más." },
    { icono: "Target", nombre: "Focus", texto: "Claridad para estudiar, crear y sostener el ritmo." },
    { icono: "Leaf", nombre: "Recover", texto: "Lo que tu cuerpo agradece después del esfuerzo." },
    { icono: "ShoppingBag", nombre: "Snack", texto: "Antojos que sí nutren, sin etiquetas raras." },
    { icono: "Sparkles", nombre: "Essentials", texto: "Los básicos de self‑care que siempre olvidas traer." },
  ],
  frase: "Choose your good mood here.",
  cta: "Bring Sun‑i to your space",
} as const;

/* ── 04 · EXPERIENCES ──────────────────────────────────────────────────────  */
export const EXPERIENCIAS = {
  eyebrow: "Sun‑i Experiences",
  titulo: "Bienestar que llega a tu espacio.",
  texto:
    "Sesiones cortas, facilitadas por expertos, para activar el cuerpo, calmar la mente y reconectar equipos sin " +
    "interrumpir el día. Llevamos al facilitador y el material.",
  tipos: ["Mindfulness", "Yoga", "Movilidad", "Ejercicio funcional", "Activaciones"],
  espacios: "Oficinas · Instituciones · Universidades · Comunidades",
  cta: "Lleva una experiencia Sun‑i a tu espacio",
} as const;

/* ── 05 · DÓNDE VIVE SUN-I ─────────────────────────────────────────────────
   La lista hace el trabajo. Sin párrafo de introducción: quien llega aquí
   busca reconocerse en un renglón, no leer.                                  */
export const ESPACIOS = {
  eyebrow: "Where Sun‑i lives",
  titulo: "¿Reconoces tu espacio?",
  items: [
    { icono: "Dumbbell", nombre: "Gyms & Studios" },
    { icono: "GraduationCap", nombre: "Universidades" },
    { icono: "Building2", nombre: "Oficinas" },
    { icono: "Home", nombre: "Residencial" },
    { icono: "BedDouble", nombre: "Hoteles" },
    { icono: "HeartPulse", nombre: "Clínicas & Wellness" },
  ],
  cta: "Bring Sun‑i to your space",
} as const;

/* ── 06 · PARA MARCAS ──────────────────────────────────────────────────────
   Pequeña a propósito. Es una tercera puerta, no un tercer negocio.

   Sin beneficios inventados: no se promete audiencia, ni ventas, ni datos de
   rotación. Solo qué clase de colaboración existe.                           */
export const MARCAS = {
  eyebrow: "For brands",
  titulo: "Partner with Sun‑i",
  texto:
    "Trabajamos con marcas de wellness, alimentos y bebidas que quieren estar dentro de la selección de Sun‑i.",
  formas: ["Product placement", "Sampling", "Activations", "Collaborations"],
  cta: "Let's collaborate",
} as const;

/* ── 07 · CIERRE ───────────────────────────────────────────────────────────
   Absorbe el bloque «Bring Sun-i», que era una sección aparte diciendo lo
   mismo que el cierre. Un solo momento de máximo contraste.                  */
export const CIERRE = {
  titulo: "Bring Sun‑i to your space.",
  texto:
    "¿Tienes un gym, campus, oficina, hotel o espacio con comunidad? Cuéntanos y lo vemos contigo.",
  /**
   * PENDIENTE DE CONFIRMACIÓN COMERCIAL.
   *
   * «Sin costo de instalación · Sin contratos eternos» viene del contenido
   * aprobado por Emmy y por eso no se retira. Pero son condiciones
   * comerciales, no copy: hay que confirmarlas antes de publicar en un dominio
   * propio. Está señalado en el reporte de entrega.
   */
  condiciones: "Sin costo de instalación · Sin contratos eternos",
  cta: "I want Sun‑i",
  ctaMarcas: "Partner with Sun‑i",
} as const;

export const SEO = {
  titulo: "Sun‑i project® — A little more Sun‑i in your everyday",
  descripcion:
    "Sun‑i project® es una marca de everyday wellness: productos, espacios y experiencias que hacen que cuidarte " +
    "sea parte natural de tu día. Vending y experiencias de bienestar para espacios.",
} as const;
