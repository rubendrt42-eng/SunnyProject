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

export interface SiteSettings {
  heroTitle: string;
  /**
   * Opcional. La frase que la portada dibuja en amarillo, en su propia línea,
   * debajo del título. Vacía significa titular entero en blanco, y eso es una
   * decisión válida — no un error.
   */
  heroTitleAccent?: string | null;
  /** Opcional. Sin ella la portada dibuja la composición de marca. */
  heroImage?: SanityImage | null;
  heroSubtitle: string;
  aboutShortText: string;
  instagramUrl?: string;
  whatsapp?: string;
  contactEmail?: string;
  faq: FaqItem[];
}
