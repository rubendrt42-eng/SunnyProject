import type { Experience } from "@/lib/database.types";
import { LOW_CAPACITY_THRESHOLD } from "@/lib/constants";

export type ExperienceDisplayState =
  | "available"
  | "low"
  | "sold_out"
  | "upcoming"
  | "cancelled"
  | "completed";

export const EXPERIENCE_STATE_LABEL: Record<ExperienceDisplayState, string> = {
  available: "Disponible",
  low: "Últimos lugares",
  sold_out: "Agotada",
  upcoming: "Próximamente",
  cancelled: "Cancelada",
  completed: "Finalizada",
};

export const EXPERIENCE_STATE_TONE: Record<ExperienceDisplayState, "neutral" | "sunny" | "orange" | "success" | "danger"> = {
  available: "success",
  low: "orange",
  sold_out: "neutral",
  upcoming: "sunny",
  cancelled: "danger",
  completed: "neutral",
};

/**
 * `sold_out` and `completed` are never stored on the row — they're derived
 * here from capacity/reservation counts and ends_at (PRODUCT_SPEC.md §11).
 */
export function computeExperienceState(experience: Experience, activeReservationCount: number): ExperienceDisplayState {
  const now = Date.now();

  if (experience.status === "cancelled") return "cancelled";
  if (experience.status === "completed" || new Date(experience.ends_at).getTime() <= now) return "completed";

  const spotsLeft = experience.capacity - activeReservationCount;

  if (new Date(experience.claim_opens_at).getTime() > now) return "upcoming";
  if (spotsLeft <= 0) return "sold_out";
  if (spotsLeft <= LOW_CAPACITY_THRESHOLD) return "low";
  return "available";
}

export function spotsLeft(experience: Experience, activeReservationCount: number): number {
  return Math.max(experience.capacity - activeReservationCount, 0);
}
