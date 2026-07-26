"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, accountUpdateSchema } from "@/lib/validations";
import { fieldErrorsFromZod } from "@/lib/form-errors";

export interface ActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/** Completes a new user's profile (used inline in the reservation flow). */
export async function completeProfileAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Necesitas iniciar sesión." };

  const raw = {
    full_name: String(formData.get("full_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    city: String(formData.get("city") ?? "Monterrey"),
    interests: formData.getAll("interests").map(String),
    adult_confirmed: formData.get("adult_confirmed") === "on",
    terms_accepted: formData.get("terms_accepted") === "on",
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Revisa los campos marcados.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone || null,
      city: parsed.data.city || "Monterrey",
      interests: parsed.data.interests,
      adult_confirmed_at: now,
      terms_accepted_at: now,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: "No pudimos guardar tu perfil. Intenta de nuevo." };

  revalidatePath("/", "layout");
  return { ok: true };
}

/** Updates account fields from "Mi cuenta" — never touches role. */
export async function updateAccountAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Necesitas iniciar sesión." };

  const raw = {
    full_name: String(formData.get("full_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    city: String(formData.get("city") ?? "Monterrey"),
    interests: formData.getAll("interests").map(String),
  };

  const parsed = accountUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Revisa los campos marcados.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone || null,
      city: parsed.data.city,
      interests: parsed.data.interests,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: "No pudimos guardar los cambios." };

  revalidatePath("/mi-cuenta");
  return { ok: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
