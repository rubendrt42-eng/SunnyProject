import type { ExperienceWithBusiness } from "@/lib/queries";
import { computeExperienceState } from "@/lib/experience-status";

export type ExperienceCta =
  | { type: "cancelled" }
  | { type: "completed" }
  | { type: "sold_out" }
  | { type: "closed" }
  | { type: "login" }
  | { type: "already_reserved" }
  | { type: "pass_used_elsewhere" }
  | { type: "profile_incomplete" }
  | { type: "claimable" };

export const CTA_LABEL: Record<ExperienceCta["type"], string> = {
  cancelled: "Experiencia cancelada",
  completed: "Experiencia finalizada",
  sold_out: "Agotado",
  closed: "Reservaciones cerradas",
  login: "Inicia sesión para obtener tu pase",
  already_reserved: "Ya reservaste esta experiencia",
  pass_used_elsewhere: "Ya tienes un pase esta semana",
  profile_incomplete: "Completa tu perfil para continuar",
  claimable: "Obtener mi pase",
};

export function determineCta(params: {
  experience: ExperienceWithBusiness;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  hasReservationForThisExperience: boolean;
  hasActivePassElsewhere: boolean;
}): ExperienceCta {
  const { experience, isAuthenticated, isProfileComplete, hasReservationForThisExperience, hasActivePassElsewhere } = params;
  const state = computeExperienceState(experience, experience.reserved_count);

  if (state === "cancelled") return { type: "cancelled" };
  if (state === "completed") return { type: "completed" };
  if (state === "sold_out") return { type: "sold_out" };
  if (state === "upcoming") return { type: "closed" };
  if (new Date(experience.claim_closes_at).getTime() < Date.now()) return { type: "closed" };

  if (!isAuthenticated) return { type: "login" };
  if (hasReservationForThisExperience) return { type: "already_reserved" };
  if (hasActivePassElsewhere) return { type: "pass_used_elsewhere" };
  if (!isProfileComplete) return { type: "profile_incomplete" };

  return { type: "claimable" };
}
