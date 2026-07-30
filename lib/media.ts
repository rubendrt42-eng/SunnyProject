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

/** Category tiles. Only the two categories we actually have photography for carry an image. */
export const CATEGORY_PHOTOS: Partial<Record<string, SunnyPhoto>> = {
  food_coffee: {
    src: "/media/sunny/categories/category-food-coffee-01.webp",
    alt: "Barista preparando café en una máquina de espresso a contraluz",
    width: 736,
    height: 920,
  },
  movimiento: {
    src: "/media/sunny/categories/category-movimiento-01.webp",
    alt: "Persona riendo mientras juega pádel en una cancha al aire libre",
    width: 736,
    height: 1104,
  },
};

/**
 * Maps a demo experience slug to its committed photograph, as a safety net
 * so the six demo experiences render the right image even if someone
 * forgets to re-run supabase/demo_seed.sql (which also sets these paths
 * into `image_url` directly).
 *
 * Only the corrected slugs are listed. The older demo rows currently in
 * the database — `pilates-reformer-intro-demo`, `sunrise-paddle-demo`,
 * `recovery-contrast-session-demo` — are deliberately NOT bridged: each
 * was named for something the attached photography does not show (reformer
 * machines, paddle boarding on water, thermal contrast), and putting a mat
 * pilates or padel photo on them would be exactly the mismatch
 * SUNNY_ASSET_MANIFEST.md §3 renamed them to avoid. Those rows keep
 * ManagedPhoto's honest missing-photo state until the seed is re-run.
 *
 * Real (non-demo) experiences are unaffected: they use their own
 * `image_url`, and its absence shows the same honest empty state.
 */
const DEMO_SLUG_PHOTOS: Record<string, SunnyPhoto> = {
  "mat-pilates-intro-demo": EXPERIENCE_PHOTOS["mat-pilates"],
  "sunset-yoga-demo": EXPERIENCE_PHOTOS["sunset-yoga"],
  "coffee-tasting-demo": EXPERIENCE_PHOTOS["coffee-tasting"],
  "padel-mixin-demo": EXPERIENCE_PHOTOS["padel-mixin"],
  "recovery-breathwork-demo": EXPERIENCE_PHOTOS["recovery-breathwork"],
  "run-coffee-social-demo": EXPERIENCE_PHOTOS["run-and-coffee"],
};

export function demoPhotoForSlug(slug: string): SunnyPhoto | null {
  return DEMO_SLUG_PHOTOS[slug] ?? null;
}
