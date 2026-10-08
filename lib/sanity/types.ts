/**
 * Las formas que devuelven las consultas de `lib/sanity/queries.ts`.
 *
 * Se escriben a mano y no se generan porque son dos, son pequeñas, y tenerlas
 * aquí obliga a que cada campo nuevo del esquema pase por una decisión
 * explícita antes de aparecer en el sitio.
 *
 * Nota sobre los opcionales: todo lo que el esquema no marca como obligatorio
 * llega potencialmente `undefined`, y aquí está declarado así. El sitio tiene
 * que saber dibujarse sin dirección, sin anfitrión y sin requisitos, porque
 * Emmy puede publicar una experiencia sin ellos.
 */

/** Solo dos estados. No hay control automático de cupo en esta etapa. */
export type ExperienceStatus = "available" | "sold_out";

export interface SanityImage {
  url: string;
  alt: string;
  /** Relación de aspecto original, para reservar el espacio antes de que cargue. */
  aspectRatio: number;
  /** Miniatura difuminada en base64 para el placeholder. */
  lqip?: string;
}

/** Lo que necesita una tarjeta del listado. Menos campos = respuesta más ligera. */
export interface ExperienceCardData {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  image: SanityImage | null;
  hostName?: string;
  locationName: string;
  startDateTime: string;
  endDateTime: string;
  status: ExperienceStatus;
  featured: boolean;
}

/** Lo que necesita la página de detalle: la tarjeta más el texto largo. */
export interface ExperienceDetail extends ExperienceCardData {
  fullDescription: string;
  address?: string;
  requirements: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Un capítulo de la portada, tal y como se edita en Sanity.
 *
 * Cinco de los siete capítulos tienen la misma anatomía —un titular a dos
 * voces, un párrafo y a veces una nota o una cita— así que comparten forma en
 * vez de generar veinte campos sueltos en el Studio. Emmy ve un solo apartado
 * plegable por capítulo, no una lista plana de frases sin contexto.
 *
 * Todo salvo `titulo` es opcional a propósito: un capítulo sin cita se dibuja
 * sin cita, no con un hueco.
 */
export interface BloqueDeTexto {
  /** La primera voz del titular, en Manrope. */
  titulo: string;
  /** La segunda voz, en Newsreader cursiva. Opcional: sin ella el titular es de una sola voz. */
  acento?: string | null;
  /** El párrafo de apoyo. */
  texto?: string | null;
  /** Una línea corta al margen. Cada capítulo decide qué hace con ella. */
  nota?: string | null;
  /** La frase destacada del capítulo, cuando su composición tiene una. */
  cita?: string | null;
}

/* ─────────────────────────────────────────────────────────────────────────
   LA PORTADA, EDITABLE DESDE SANITY

   Hasta ahora los textos de la portada vivían en `lib/sunni-content.ts`, en
   código: Emmy podía cambiar el pie, el SEO y las preguntas, pero no una sola
   palabra de lo que se lee al entrar.

   Cada bloque es un objeto plegable en el Studio, uno por sección y en el
   mismo orden en que se ven al bajar por la página. Lo que NO sube aquí es el
   orden de las secciones, los colores ni la maquetación: contenido de marca al
   gestor, decisiones de diseño en el código.

   Todo es opcional. Lo que Emmy deje vacío cae en el texto que hay hoy, que
   está escrito y revisado — nunca en un hueco.
   ───────────────────────────────────────────────────────────────────────── */

/** Un elemento de lista con nombre, descripción y su icono. */
export interface ItemDeLista {
  nombre: string;
  texto?: string | null;
  /** Nombre del icono. La lista válida vive en el esquema de Sanity. */
  icono?: string | null;
}

/** Los seis textos de cada formulario, tal como llegan del Studio. */
export interface ProsaFormularioSanity {
  titulo?: string | null;
  intro?: string | null;
  pie?: string | null;
  boton?: string | null;
  exito?: string | null;
  exitoTexto?: string | null;
}

/**
 * Menú, pie y formularios.
 *
 * Los enlaces llegan como `enlace1`…`enlace4` y no como una lista: en el
 * Studio son casillas fijas, porque el destino de cada una es fijo. Una lista
 * dejaría añadir un quinto enlace que no apunta a ninguna parte.
 */
export interface InterfazSunni {
  navegacion?: {
    enlace1?: string | null;
    enlace2?: string | null;
    enlace3?: string | null;
    enlace4?: string | null;
    boton?: string | null;
  } | null;
  heroBotones?: { principal?: string | null; secundario?: string | null } | null;
  pie?: {
    tituloExplora?: string | null;
    tituloAyuda?: string | null;
    tituloContacto?: string | null;
    enlace1?: string | null;
    enlace2?: string | null;
    enlace3?: string | null;
    enlace4?: string | null;
    privacidad?: string | null;
    derechos?: string | null;
  } | null;
  vending?: ProsaFormularioSanity | null;
  experiences?: ProsaFormularioSanity | null;
  brands?: ProsaFormularioSanity | null;
}

export interface PortadaSunni {
  hero?: {
    badge?: string | null;
    titulo?: string | null;
    tituloAcento?: string | null;
    tituloFin?: string | null;
    texto?: string | null;
  } | null;
  queHacemos?: {
    eyebrow?: string | null;
    titulo?: string | null;
    bloques?: {
      rotulo?: string | null;
      titulo?: string | null;
      texto?: string | null;
      enlace?: string | null;
      ancla?: string | null;
    }[] | null;
  } | null;
  vending?: {
    eyebrow?: string | null;
    titulo?: string | null;
    texto?: string | null;
    nota?: string | null;
    moodsTitulo?: string | null;
    moods?: ItemDeLista[] | null;
    frase?: string | null;
    cta?: string | null;
  } | null;
  experiencias?: {
    eyebrow?: string | null;
    titulo?: string | null;
    texto?: string | null;
    tipos?: ItemDeLista[] | null;
    cta?: string | null;
  } | null;
  espacios?: {
    eyebrow?: string | null;
    titulo?: string | null;
    items?: ItemDeLista[] | null;
    cta?: string | null;
  } | null;
  marcas?: {
    eyebrow?: string | null;
    titulo?: string | null;
    texto?: string | null;
    formas?: string[] | null;
    cta?: string | null;
  } | null;
  cierre?: {
    titulo?: string | null;
    texto?: string | null;
    condiciones?: string | null;
    cta?: string | null;
    ctaMarcas?: string | null;
  } | null;
}

export interface SiteSettings {
  /** La línea de contexto de arriba del hero. */
  heroEyebrow: string;
  heroTitle: string;
  /**
   * La frase del titular que se pinta en amarillo y en cursiva.
   *
   * Si aparece dentro de `heroTitle`, el hero parte el titular en tres líneas
   * —lo de antes, la frase, lo de después— y la resalta en su sitio. Si no
   * aparece, se dibuja debajo como una segunda línea. Vacía es una decisión
   * válida: el titular entero en blanco.
   */
  heroTitleAccent?: string | null;
  /** Opcional. Sin ella el hero es carbón plano con grano. */
  heroImage?: SanityImage | null;
  /** La nota pequeña de la esquina inferior del hero. */
  heroSubtitle: string;

  bloqueExperiencias: BloqueDeTexto;
  bloqueSunny: BloqueDeTexto;
  bloqueRecorrido: BloqueDeTexto;
  bloqueComunidad: BloqueDeTexto;
  bloqueNegocios: BloqueDeTexto;
  bloqueCierre: BloqueDeTexto;

  seoTitle: string;
  seoDescription: string;
  footerDescripcion: string;

  /** Los textos de la portada. Ver `PortadaSunni`. */
  portada?: PortadaSunni | null;

  /** Menú, pie y formularios. Ver `InterfazSunni`. */
  interfaz?: InterfazSunni | null;

  instagramUrl?: string;
  whatsapp?: string;
  contactEmail?: string;
  faq: FaqItem[];
}
