import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/database.types";

export interface CurrentUser {
  id: string;
  email: string;
  profile: Profile | null;
}

/** Reads the session from cookies. Returns null when signed out. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  return { id: user.id, email: user.email ?? "", profile: (profile as Profile) ?? null };
}

export function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) return false;
  return Boolean(profile.full_name && profile.full_name.trim().length > 0 && profile.adult_confirmed_at && profile.terms_accepted_at);
}

/** Throws-free admin guard for Route Handlers / Server Actions: returns null when the caller isn't an authenticated admin. */
export async function requireAdmin(): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  if (!user || user.profile?.role !== "admin") return null;
  return user;
}
