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

  const { data: copy, error } = await supabase
    .from("experiences")
    .insert({ ...rest, slug: `${slug}-copia-${Date.now().toString(36)}`, status: "draft", featured: false })
    .select()
    .single();

  if (error || !copy) return;

  revalidatePath("/admin/experiencias");
  redirect(`/admin/experiencias/${copy.id}`);
}

export async function setPartnerLeadStatusAction(leadId: string, status: PartnerLeadStatus) {
  const admin = await requireAdmin();
  if (!admin) return;

  const supabase = await createClient();
  await supabase.from("partner_leads").update({ status }).eq("id", leadId);

  revalidatePath("/admin/solicitudes");
}
