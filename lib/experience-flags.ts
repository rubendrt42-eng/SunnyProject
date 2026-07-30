import type { Experience } from "@/lib/database.types";
import { parseSocialModes, type SocialMode } from "@/lib/social-modes";
import { MAX_PARTY_SIZE_CEILING } from "@/lib/constants";

/**
 * Forward/backward-compatible readers for the columns added by the MVP 1.1
 * migrations.
 *
 * Both migrations are prepared but NOT applied (see
 * SUNNY_COMPANIONS_MIGRATION_PLAN.md — the reservation-counting rewrite
 * sits behind a deployment barrier). Every query in this app selects `*`
 * rather than an explicit column list, so against a database where these
 * columns don't exist yet the fields simply arrive `undefined` and each
 * reader below falls back to the pre-migration behaviour:
 *
 *   is_original        → false   (no experience claims to be an Original)
 *   social_modes       → []      (no modality badges render)
 *   max_party_size     → 1       (individual reservations only, as today)
 *   archived_at        → null    (nothing hidden)
 *   featured_as_partner→ false   (the allies section does not render)
 *
 * That means the site is correct before the migration and correct after
 * it, and nothing is ever invented to fill a missing column.
 */

/** The shape of an experience row that may or may not have the new columns yet. */
type MaybeExtended = Experience & {
  is_original?: boolean | null;
  social_modes?: string[] | null;
  max_party_size?: number | null;
  archived_at?: string | null;
};

export function isOriginal(experience: Experience): boolean {
  return (experience as MaybeExtended).is_original === true;
}

export function socialModesOf(experience: Experience): SocialMode[] {
  return parseSocialModes((experience as MaybeExtended).social_modes);
}

/**
 * How many people one reservation may cover. Clamped to [1, ceiling] so a
 * bad or hand-edited value can never open the door to a larger group than
 * the MVP sanctions (decision 4 in SUNNY_MVP_1_1_DECISIONS.md).
 */
export function maxPartySizeOf(experience: Experience): number {
  const raw = (experience as MaybeExtended).max_party_size;
  if (typeof raw !== "number" || !Number.isFinite(raw)) return 1;
  return Math.min(Math.max(Math.trunc(raw), 1), MAX_PARTY_SIZE_CEILING);
}

export function allowsCompanions(experience: Experience): boolean {
  return maxPartySizeOf(experience) > 1;
}

export function isArchived(experience: Experience): boolean {
  return Boolean((experience as MaybeExtended).archived_at);
}

/**
 * How many people a reservation covers. Every reservation created before
 * the group migration has no `party_size` and counts as exactly 1 person,
 * which is what those rows have always meant — so existing reservations
 * stay correct without a backfill.
 */
export function partySizeOf(reservation: { party_size?: number | null }): number {
  const raw = reservation.party_size;
  if (typeof raw !== "number" || !Number.isFinite(raw)) return 1;
  return Math.min(Math.max(Math.trunc(raw), 1), MAX_PARTY_SIZE_CEILING);
}

export function featuredAsPartner(business: { featured_as_partner?: boolean | null }): boolean {
  return business.featured_as_partner === true;
}

/**
 * The admin-facing lifecycle label (brief §32). `scheduled`, `sold_out`,
 * `completed` and `archived` are all derived rather than stored — see the
 * note in SUNNY_ADMIN_SPEC.md on why the `status` check constraint was left
 * untouched instead of migrated to hold seven values.
 */
export type AdminExperienceState =
  | "draft"
  | "scheduled"
  | "published"
  | "sold_out"
  | "completed"
  | "cancelled"
  | "archived";

export const ADMIN_STATE_LABEL: Record<AdminExperienceState, string> = {
  draft: "Borrador",
  scheduled: "Programada",
  published: "Publicada",
  sold_out: "Agotada",
  completed: "Finalizada",
  cancelled: "Cancelada",
  archived: "Archivada",
};

export const ADMIN_STATE_TONE: Record<AdminExperienceState, "neutral" | "sunny" | "orange" | "success" | "danger"> = {
  draft: "neutral",
  scheduled: "sunny",
  published: "success",
  sold_out: "orange",
  completed: "neutral",
  cancelled: "danger",
  archived: "neutral",
};

export function computeAdminState(experience: Experience, reservedCount: number): AdminExperienceState {
  if (isArchived(experience)) return "archived";
  if (experience.status === "cancelled") return "cancelled";
  if (experience.status === "draft") return "draft";
  if (experience.status === "completed" || new Date(experience.ends_at).getTime() <= Date.now()) return "completed";
  if (new Date(experience.claim_opens_at).getTime() > Date.now()) return "scheduled";
  if (reservedCount >= experience.capacity) return "sold_out";
  return "published";
}
