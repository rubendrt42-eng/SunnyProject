import type { Category } from "@/lib/database.types";

/**
 * "Modalidad social": how an experience feels to attend, in human terms —
 * whether you can turn up alone, whether it suits going with friends,
 * whether you'll meet people.
 *
 * These are an explicit, admin-chosen list stored on the experience, not
 * inferred. Nothing here is derived from the category, the capacity, or
 * the description: a badge that says "conoce gente nueva" on an experience
 * where that isn't true is worse than no badge, so an experience with no
 * declared modes simply shows none (brief §15).
 */
export const SOCIAL_MODES = {
  solo: { label: "Puedes venir solo", tone: "neutral" },
  amigos: { label: "Ideal para ir con amigos", tone: "neutral" },
  conocer: { label: "Conoce gente nueva", tone: "pine" },
  acompanante: { label: "Permite acompañante", tone: "sunny" },
  grupo_pequeno: { label: "Grupo pequeño", tone: "neutral" },
  principiantes: { label: "Apto para principiantes", tone: "neutral" },
} as const;

export type SocialMode = keyof typeof SOCIAL_MODES;

export const SOCIAL_MODE_KEYS = Object.keys(SOCIAL_MODES) as SocialMode[];

export function isSocialMode(value: string): value is SocialMode {
  return value in SOCIAL_MODES;
}

/** Drops anything unrecognised, so a stale or hand-edited value can never render as a badge. */
export function parseSocialModes(value: unknown): SocialMode[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is SocialMode => typeof v === "string" && isSocialMode(v));
}

/**
 * The five human intents on the Home selector (brief §16). Technical
 * categories keep existing in the database; the public site speaks in
 * intent. The mapping is explicit — no AI, no scoring, no inference.
 */
export const INTENTS = {
  moverme: {
    label: "Moverme",
    question: "Quiero moverme",
    categories: ["movimiento"] as Category[],
    socialModes: [] as SocialMode[],
  },
  desconectarme: {
    label: "Desconectarme",
    question: "Quiero desconectarme",
    categories: ["recovery"] as Category[],
    socialModes: [] as SocialMode[],
  },
  conocer_gente: {
    label: "Conocer gente",
    question: "Quiero conocer gente",
    categories: ["comunidad"] as Category[],
    socialModes: ["conocer"] as SocialMode[],
  },
  con_amigos: {
    label: "Hacer algo con amigos",
    question: "Quiero hacer algo con amigos",
    categories: [] as Category[],
    socialModes: ["amigos", "acompanante"] as SocialMode[],
  },
  algo_nuevo: {
    label: "Probar algo nuevo",
    question: "Quiero probar algo nuevo",
    categories: ["food_coffee", "outdoor"] as Category[],
    socialModes: ["principiantes"] as SocialMode[],
  },
} as const;

export type Intent = keyof typeof INTENTS;

export const INTENT_KEYS = Object.keys(INTENTS) as Intent[];

export function isIntent(value: string | null | undefined): value is Intent {
  return typeof value === "string" && value in INTENTS;
}

/**
 * An experience matches an intent when its category is listed for that
 * intent OR it declares one of the intent's social modes. Union rather
 * than intersection, because "hacer algo con amigos" is about modality and
 * cuts across every category.
 */
export function matchesIntent(
  experience: { category: Category; socialModes: SocialMode[] },
  intent: Intent,
): boolean {
  const def = INTENTS[intent];
  if ((def.categories as readonly Category[]).includes(experience.category)) return true;
  return experience.socialModes.some((m) => (def.socialModes as readonly SocialMode[]).includes(m));
}
