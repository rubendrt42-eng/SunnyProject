import type { Category } from "@/lib/database.types";

export const TIMEZONE = "America/Monterrey";

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "movimiento", label: "Movimiento" },
  { value: "recovery", label: "Recovery" },
  { value: "food_coffee", label: "Food & Coffee" },
  { value: "outdoor", label: "Outdoor" },
  { value: "comunidad", label: "Comunidad" },
];

export function categoryLabel(category: Category | string | null | undefined): string {
  return CATEGORIES.find((c) => c.value === category)?.label ?? "Experiencia";
}

export const LOW_CAPACITY_THRESHOLD = 3;

export const CANCELLATION_WINDOW_HOURS = 12;

/**
 * Absolute ceiling on how many people a single reservation may cover in the
 * MVP — decision 4 / decision 15 in SUNNY_MVP_1_1_DECISIONS.md. Enforced in
 * three independent places: this clamp on read, the Zod schema on the
 * claim request, and a CHECK constraint in the migration. The database is
 * the only one that actually protects capacity.
 */
export const MAX_PARTY_SIZE_CEILING = 3;

/** Error codes raised by claim_reservation() / cancel_reservation(), mapped to user-facing copy. */
export const RESERVATION_ERROR_MESSAGES: Record<string, string> = {
  NOT_AUTHENTICATED: "Necesitas iniciar sesión para obtener tu pase.",
  PROFILE_NOT_FOUND: "No encontramos tu perfil. Intenta cerrar sesión y volver a entrar.",
  PROFILE_INCOMPLETE: "Completa tu perfil (nombre y confirmación de mayoría de edad) antes de reservar.",
  EXPERIENCE_NOT_FOUND: "Esta experiencia ya no está disponible.",
  EXPERIENCE_NOT_PUBLISHED: "Esta experiencia no está publicada.",
  CLAIM_WINDOW_CLOSED: "Las reservaciones para esta experiencia están cerradas.",
  EXPERIENCE_PAST: "Esta experiencia ya finalizó.",
  EXPERIENCE_SOLD_OUT: "Alguien más tomó el último lugar. Esta experiencia se agotó.",
  WEEKLY_PASS_ALREADY_USED: "Ya utilizaste tu pase de esta semana.",
  ALREADY_RESERVED_EXPERIENCE: "Ya reservaste esta experiencia.",
  RESERVATION_NOT_FOUND: "No encontramos esa reservación.",
  RESERVATION_NOT_CANCELLABLE: "Esta reservación ya no se puede cancelar.",
  CANCELLATION_WINDOW_CLOSED: "El periodo de cancelación terminó.",
  FORBIDDEN: "No tienes permiso para realizar esta acción.",
};

export function reservationErrorMessage(code: string): string {
  return RESERVATION_ERROR_MESSAGES[code] ?? "Ocurrió un error inesperado. Intenta de nuevo.";
}
