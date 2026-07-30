import type { PartnerLeadStatus } from "@/lib/database.types";

/**
 * Partner-lead pipeline (brief §35). Deliberately a short status list plus
 * private notes — not a CRM.
 */
export const PARTNER_LEAD_STATUS_LABEL: Record<PartnerLeadStatus, string> = {
  new: "Nueva",
  contacted: "Contactada",
  meeting: "Reunión agendada",
  accepted: "Aceptada",
  rejected: "Rechazada",
  converted: "Convertida en negocio",
};

export const PARTNER_LEAD_STATUS_TONE: Record<PartnerLeadStatus, "neutral" | "sunny" | "orange" | "success" | "danger"> = {
  new: "sunny",
  contacted: "neutral",
  meeting: "orange",
  accepted: "success",
  rejected: "danger",
  converted: "success",
};

/**
 * The four statuses the database accepts today. `meeting` and `converted`
 * are only permitted once 20260201000000_experience_presentation.sql widens
 * the CHECK constraint, so the admin UI must not offer them before then —
 * doing so would hand Emmy a dropdown option that fails on save.
 */
const PRE_MIGRATION_STATUSES: PartnerLeadStatus[] = ["new", "contacted", "accepted", "rejected"];

const ALL_STATUSES: PartnerLeadStatus[] = ["new", "contacted", "meeting", "accepted", "rejected", "converted"];

/**
 * Which statuses to offer. We can't introspect the CHECK constraint from
 * the app, so migration state is inferred from a signal the migration
 * itself adds: the `internal_notes` column. If a lead row carries that key,
 * the migration has run and the full list is safe.
 */
export function partnerLeadStatusOptions(sampleLead?: { internal_notes?: string | null }): PartnerLeadStatus[] {
  const migrated = sampleLead !== undefined && "internal_notes" in sampleLead;
  return migrated ? ALL_STATUSES : PRE_MIGRATION_STATUSES;
}
