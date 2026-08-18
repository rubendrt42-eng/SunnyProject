/**
 * The Sunny media library: every photograph committed under
 * /public/media/sunny, with the real alt text it must be rendered with.
 *
 * Components reference these entries by name instead of hardcoding paths,
 * so a renamed or replaced file is a type error rather than a silent 404.
 *
 * Provenance warning — read SUNNY_ASSET_MANIFEST.md §0 before publishing.
 * These photographs came from the attached `PaginaWeb` folder and are
 * mood-board images saved from other brands' published content (15 of the
 * 16 are exactly 736px wide, Pinterest's canonical feed width), not
 * Sunny's own photography, and none are Monterrey. They are used here so
 * the design can be evaluated against real images instead of empty
 * states. They are NOT cleared for production, and no photo is attributed
 * to a named business as if that business had shot it.
 *
 * LA ÚNICA EXCEPCIÓN PUBLICADA: `EMMY_PHOTO`
 *
 * El MVP lean publica exactamente **una** fotografía de este archivo, y es
 * deliberado. Todas las demás se retiraron de las rutas públicas por la
 * advertencia de arriba; en su lugar va `BrandCanvas`, que dibuja la ausencia
 * de fotografía a propósito en vez de dejar un hueco.
 *
 * `EMMY_PHOTO` se queda porque su procedencia es distinta: venía en la carpeta
 * `FotoEmmy` de la propia entrega de Emmy, mide 1080×1080 —formato nativo de
 * Instagram, no los 736 px del feed de Pinterest— y el manifiesto la clasifica
 * como el «único asset plausiblemente propio». El cliente pidió expresamente
 * que apareciera en su presentación.
 *
 * **Pendiente**: esa clasificación es una inferencia, no una confirmación.
 * Falta que Emmy diga por escrito que la fotografía es suya y puede
 * publicarse. Mientras tanto se publica bajo esa presunción, que es lo que el
 * cliente pidió, y queda anotado aquí para que nadie lo dé por cerrado.
 *
 * `tests/unit/solo-fotografia-autorizada.test.ts` recorre lo que alcanzan las
 * rutas públicas y falla si alguna llega a una fotografía distinta de esta.
 * Sin esa prueba, añadir un componente de la versión avanzada a la portada
 * publicaría una imagen de terceros sin que nada fallara: compila, se ve bien,
 * y el problema es legal, no técnico.
 */

export type SunnyPhoto = { src: string; alt: string; width: number; height: number };

/** Hero — the promise is "vívelo con alguien", so the photo shows two people, not a place. */
export const HERO_TOGETHER: SunnyPhoto = {
  src: "/media/sunny/hero/hero-together-01.webp",
  alt: "Dos personas sonriendo y juntando sus palas en una cancha de pádel de arcilla",
  width: 736,
  height: 1104,
};

export const EXPERIENCE_PHOTOS = {
  "mat-pilates": {
    src: "/media/sunny/experiences/experience-mat-pilates-01.webp",
    alt: "Cuatro personas recostadas en tapetes sosteniendo pelotas de pilates durante una clase en estudio",
    width: 735,
    height: 919,
  },
  "sunset-yoga": {
    src: "/media/sunny/experiences/experience-sunset-yoga-01.webp",
    alt: "Tres personas en tapetes sobre el césped haciendo una extensión lateral de yoga entre palmeras",
    width: 735,
    height: 914,
  },
  "coffee-tasting": {
    src: "/media/sunny/experiences/experience-coffee-tasting-01.webp",
    alt: "Capuchino con arte latte y un croissant sobre una mesa de madera junto a un ventanal",
    width: 736,
    height: 1104,
  },
  "padel-mixin": {
    src: "/media/sunny/experiences/experience-padel-mixin-01.webp",
    alt: "Cuatro jugadores de pádel saludándose junto a la red de una cancha con muros de cristal",
    width: 736,
    height: 920,
  },
  "recovery-breathwork": {
    src: "/media/sunny/experiences/experience-recovery-breathwork-01.webp",
    alt: "Grupo sentado en flor de loto sobre tapetes frente a una instructora en un estudio de luz cálida",
    width: 735,
    height: 976,
  },
  "run-and-coffee": {
    src: "/media/sunny/originals/original-run-and-coffee-01.webp",
    alt: "Cinco personas en ropa deportiva conversando y riendo con bebidas después de correr",
    width: 736,
    height: 980,
  },
} as const satisfies Record<string, SunnyPhoto>;

/**
 * Shown in the Originals chapter when the flagged experience has no photo
 * of its own yet. Safe as a fallback because it depicts the Originals idea
 * generically (people staying to socialise after an activity) rather than
 * standing in for a specific experience.
 */
export const ORIGINALS_FALLBACK_PHOTO: SunnyPhoto = EXPERIENCE_PHOTOS["run-and-coffee"];

export const COMMUNITY_PHOTOS: SunnyPhoto[] = [
  {
    src: "/media/sunny/community/community-gathering-01.webp",
    alt: "Personas sentadas en bancas conversando en un encuentro, algunas con etiquetas de nombre",
    width: 736,
    height: 920,
  },
  {
    src: "/media/sunny/community/community-workshop-01.webp",
    alt: "Seis personas alrededor de una mesa pintando con acuarelas en un taller, dos de ellas riendo",
    width: 736,
    height: 920,
  },
];

/**
 * Retrato de la fundadora. La única de este archivo que sale en producción —
 * ver la nota de procedencia de arriba antes de tocarla o de imitarla.
 */
export const EMMY_PHOTO: SunnyPhoto = {
  src: "/media/sunny/emmy/emmy-founder-01.webp",
  alt: "Retrato de Emmy, fundadora de Sunny Project, apoyada en un barandal frente a una ladera de pinos",
  width: 1080,
  height: 1080,
};

export const BUSINESS_SPACE_PHOTO: SunnyPhoto = {
  src: "/media/sunny/businesses/business-coffee-bar-01.webp",
  alt: "Barra de café minimalista con isla de acero, vitrina de pastelería y estación de filtrado",
  width: 736,
  height: 920,
};
