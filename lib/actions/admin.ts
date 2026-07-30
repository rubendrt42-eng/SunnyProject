"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { businessSchema, experienceSchema } from "@/lib/validations";
import { fieldErrorsFromZod } from "@/lib/form-errors";
import type { ActionResult } from "@/lib/actions/profile";
import type { PartnerLeadStatus } from "@/lib/database.types";

function readBusinessForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: (String(formData.get("category") ?? "") || undefined) as
      | "movimiento"
      | "recovery"
      | "food_coffee"
      | "outdoor"
      | "comunidad"
      | undefined,
    logo_url: String(formData.get("logo_url") ?? ""),
    instagram_url: String(formData.get("instagram_url") ?? ""),
    maps_url: String(formData.get("maps_url") ?? ""),
    contact_name: String(formData.get("contact_name") ?? ""),
    contact_email: String(formData.get("contact_email") ?? ""),
    contact_phone: String(formData.get("contact_phone") ?? ""),
    active: formData.get("active") === "on",
  };
}

export async function createBusinessAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "No tienes permiso." };

  const parsed = businessSchema.safeParse(readBusinessForm(formData));
  if (!parsed.success) return { ok: false, error: "Revisa los campos.", fieldErrors: fieldErrorsFromZod(parsed.error) };

  const supabase = await createClient();
  const { data, error } = await supabase.from("businesses").insert(parsed.data).select().single();

  if (error) return { ok: false, error: error.message.includes("duplicate") ? "Ese slug ya existe." : "No se pudo crear el negocio." };

  revalidatePath("/admin/negocios");
  redirect(`/admin/negocios/${data.id}`);
}

export async function updateBusinessAction(businessId: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "No tienes permiso." };

  const parsed = businessSchema.safeParse(readBusinessForm(formData));
  if (!parsed.success) return { ok: false, error: "Revisa los campos.", fieldErrors: fieldErrorsFromZod(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("businesses").update(parsed.data).eq("id", businessId);

  if (error) return { ok: false, error: "No se pudo guardar el negocio." };

  revalidatePath("/admin/negocios");
  revalidatePath(`/admin/negocios/${businessId}`);
  return { ok: true };
}

function readExperienceForm(formData: FormData) {
  return {
    business_id: String(formData.get("business_id") ?? ""),
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    short_description: String(formData.get("short_description") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? "") as
      | "movimiento"
      | "recovery"
      | "food_coffee"
      | "outdoor"
      | "comunidad",
    image_url: String(formData.get("image_url") ?? ""),
    location_name: String(formData.get("location_name") ?? ""),
    address: String(formData.get("address") ?? ""),
    maps_url: String(formData.get("maps_url") ?? ""),
    starts_at: String(formData.get("starts_at") ?? ""),
    ends_at: String(formData.get("ends_at") ?? ""),
    claim_opens_at: String(formData.get("claim_opens_at") ?? ""),
    claim_closes_at: String(formData.get("claim_closes_at") ?? ""),
    capacity: String(formData.get("capacity") ?? ""),
    status: (String(formData.get("status") ?? "draft") || "draft") as
      | "draft"
      | "published"
      | "cancelled"
      | "completed",
    featured: formData.get("featured") === "on",
    what_is_included: String(formData.get("what_is_included") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    requirements: String(formData.get("requirements") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    restrictions: String(formData.get("restrictions") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    instructions: String(formData.get("instructions") ?? ""),
  };
}

export async function createExperienceAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "No tienes permiso." };

  const parsed = experienceSchema.safeParse(readExperienceForm(formData));
  if (!parsed.success) return { ok: false, error: "Revisa los campos marcados.", fieldErrors: fieldErrorsFromZod(parsed.error) };

  const supabase = await createClient();
  const { data, error } = await supabase.from("experiences").insert(parsed.data).select().single();

  if (error) return { ok: false, error: error.message.includes("duplicate") ? "Ese slug ya existe." : "No se pudo crear la experiencia." };

  revalidatePath("/admin/experiencias");
  redirect(`/admin/experiencias/${data.id}`);
}

export async function updateExperienceAction(experienceId: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "No tienes permiso." };

  const parsed = experienceSchema.safeParse(readExperienceForm(formData));
  if (!parsed.success) return { ok: false, error: "Revisa los campos marcados.", fieldErrors: fieldErrorsFromZod(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("experiences").update(parsed.data).eq("id", experienceId);

  if (error) return { ok: false, error: "No se pudo guardar la experiencia." };

  revalidatePath("/admin/experiencias");
  revalidatePath(`/admin/experiencias/${experienceId}`);
  revalidatePath("/experiencias");
  return { ok: true };
}

export async function setExperienceStatusAction(experienceId: string, status: "draft" | "published" | "completed") {
  const admin = await requireAdmin();
  if (!admin) return;

  const supabase = await createClient();
  await supabase.from("experiences").update({ status }).eq("id", experienceId);

  revalidatePath("/admin/experiencias");
  revalidatePath(`/admin/experiencias/${experienceId}`);
  revalidatePath("/experiencias");
}

export async function toggleFeaturedAction(experienceId: string, featured: boolean) {
  const admin = await requireAdmin();
  if (!admin) return;

  const supabase = await createClient();
  await supabase.from("experiences").update({ featured }).eq("id", experienceId);

  revalidatePath("/admin/experiencias");
  revalidatePath("/");
}

/**
 * Duplicating an experience (decision 10 in SUNNY_MVP_1_1_DECISIONS.md).
 *
 * Copies content and configuration — business, title, description,
 * category, photo, requirements, instructions, capacity, and (once the
 * migration lands) max_party_size, social_modes, is_original, post_benefit,
 * since those arrive with the spread automatically. Never copies
 * reservations, folios, attendance or stats: those live in other tables and
 * are not touched. `featured` and `archived_at` are explicitly reset.
 *
 * DEVIATION, documented rather than silent: the decision says the copy
 * should be left with EMPTY dates. It cannot be — `starts_at`, `ends_at`
 * and `claim_closes_at` are all NOT NULL in the schema, and relaxing them
 * would ripple into every public query that orders by `starts_at`. So the
 * copy instead lands one week after the original's time of day, keeping its
 * duration, always in the future, and stays in `draft` so nothing is
 * public until Emmy sets the real date. The admin UI says so on the button.
 */
export async function duplicateExperienceAction(experienceId: string) {
  const admin = await requireAdmin();
  if (!admin) return;

  const supabase = await createClient();
  const { data: original } = await supabase.from("experiences").select("*").eq("id", experienceId).maybeSingle();
  if (!original) return;

  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, slug, ...rest } = original;
  void _id;
  void _createdAt;
  void _updatedAt;

  const originalStart = new Date(original.starts_at);
  const durationMs = new Date(original.ends_at).getTime() - originalStart.getTime();

  // Push forward in whole weeks until the copy is in the future, so
  // duplicating a long-past experience does not produce a past copy.
  const weekMs = 7 * 86_400_000;
  let start = new Date(originalStart.getTime() + weekMs);
  while (start.getTime() <= Date.now()) start = new Date(start.getTime() + weekMs);
  const end = new Date(start.getTime() + Math.max(durationMs, 0));

  const { data: copy, error } = await supabase
    .from("experiences")
    .insert({
      ...rest,
      slug: `${slug}-copia-${Date.now().toString(36)}`,
      status: "draft",
      featured: false,
      archived_at: null,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      claim_opens_at: new Date().toISOString(),
      claim_closes_at: start.toISOString(),
    })
    .select()
    .single();

  if (error || !copy) return;

  revalidatePath("/admin/experiencias");
  redirect(`/admin/experiencias/${copy.id}`);
}

/**
 * Archive / restore. Archiving keeps the row — brief §32 is explicit that
 * historical records are never deleted to tidy a list. Archived
 * experiences disappear from the public catalogue and from the dashboard,
 * but their reservations, folios and attendance stay intact.
 *
 * Depends on `experiences.archived_at`, added by the presentation
 * migration; before that runs the action fails softly and the UI keeps the
 * button hidden.
 */
export async function setExperienceArchivedAction(experienceId: string, archived: boolean) {
  const admin = await requireAdmin();
  if (!admin) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("experiences")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq("id", experienceId);

  if (error) {
    console.error("[setExperienceArchivedAction] failed (archived_at column may not exist yet)", error.message);
    return;
  }

  revalidatePath("/admin/experiencias");
  revalidatePath(`/admin/experiencias/${experienceId}`);
  revalidatePath("/experiencias");
  revalidatePath("/");
}

/** Marks an experience as curated by Sunny itself. Drives the Originals section on Home. */
export async function toggleOriginalAction(experienceId: string, isOriginal: boolean) {
  const admin = await requireAdmin();
  if (!admin) return;

  const supabase = await createClient();
  const { error } = await supabase.from("experiences").update({ is_original: isOriginal }).eq("id", experienceId);

  if (error) {
    console.error("[toggleOriginalAction] failed (is_original column may not exist yet)", error.message);
    return;
  }

  revalidatePath("/admin/experiencias");
  revalidatePath("/");
  revalidatePath("/experiencias");
}

/**
 * Shows or hides a business in the public "Espacios que forman parte de
 * Sunny" section. Separate from `active` on purpose: an operating partner
 * is not necessarily one that agreed to appear on the home page
 * (decision 9).
 */
export async function togglePartnerFeatureAction(businessId: string, featured: boolean) {
  const admin = await requireAdmin();
  if (!admin) return;

  const supabase = await createClient();
  const { error } = await supabase.from("businesses").update({ featured_as_partner: featured }).eq("id", businessId);

  if (error) {
    console.error("[togglePartnerFeatureAction] failed (featured_as_partner column may not exist yet)", error.message);
    return;
  }

  revalidatePath("/admin/negocios");
  revalidatePath("/");
}

export async function setBusinessActiveAction(businessId: string, active: boolean) {
  const admin = await requireAdmin();
  if (!admin) return;

  const supabase = await createClient();
  await supabase.from("businesses").update({ active }).eq("id", businessId);

  revalidatePath("/admin/negocios");
  revalidatePath("/");
}

export async function setPartnerLeadStatusAction(leadId: string, status: PartnerLeadStatus) {
  const admin = await requireAdmin();
  if (!admin) return;

  const supabase = await createClient();
  const { error } = await supabase.from("partner_leads").update({ status }).eq("id", leadId);

  if (error) {
    console.error("[setPartnerLeadStatusAction] failed", error.message);
    return;
  }

  revalidatePath("/admin/solicitudes");
}

/** Emmy's private notes on a lead. Never rendered on the public site. */
export async function setPartnerLeadNotesAction(leadId: string, formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;

  const notes = String(formData.get("internal_notes") ?? "").slice(0, 4000);

  const supabase = await createClient();
  const { error } = await supabase.from("partner_leads").update({ internal_notes: notes }).eq("id", leadId);

  if (error) {
    console.error("[setPartnerLeadNotesAction] failed (internal_notes column may not exist yet)", error.message);
    return;
  }

  revalidatePath("/admin/solicitudes");
}

/**
 * Turns an accepted lead into a real business row and opens it for editing,
 * carrying across everything the form already collected so Emmy doesn't
 * retype it. The lead is kept and marked `converted` — never deleted — so
 * the history of where a partner came from survives.
 *
 * If the slug is already taken the existing business is opened instead of
 * failing, which is the useful behaviour when a lead arrives twice.
 */
export async function convertLeadToBusinessAction(leadId: string) {
  const admin = await requireAdmin();
  if (!admin) return;

  const supabase = await createClient();
  const { data: lead } = await supabase.from("partner_leads").select("*").eq("id", leadId).maybeSingle();
  if (!lead) return;

  const slug = slugify(lead.business_name);

  const { data: existing } = await supabase.from("businesses").select("id").eq("slug", slug).maybeSingle();

  let businessId = existing?.id ?? null;

  if (!businessId) {
    const { data: created, error } = await supabase
      .from("businesses")
      .insert({
        name: lead.business_name,
        slug,
        category: lead.category as never,
        instagram_url: lead.instagram_url,
        contact_name: lead.contact_name,
        contact_email: lead.email,
        contact_phone: lead.phone,
        // Starts inactive: a converted lead is a conversation, not yet a
        // live partner. Emmy activates it when the details are agreed.
        active: false,
      })
      .select("id")
      .single();

    if (error || !created) {
      console.error("[convertLeadToBusinessAction] insert failed", error?.message);
      return;
    }
    businessId = created.id;
  }

  await supabase
    .from("partner_leads")
    .update({ status: "converted", converted_business_id: businessId })
    .eq("id", leadId);

  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin/negocios");
  redirect(`/admin/negocios/${businessId}`);
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

