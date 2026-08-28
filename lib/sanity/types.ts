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

  instagramUrl?: string;
  whatsapp?: string;
  contactEmail?: string;
  faq: FaqItem[];
}
