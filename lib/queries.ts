import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Experience, Business, Reservation } from "@/lib/database.types";
import { weekStartKey } from "@/lib/dates";

export type ExperienceWithBusiness = Experience & { business: Business; reserved_count: number };

async function attachReservedCounts(
  supabase: SupabaseClient<Database>,
  experiences: (Experience & { business: Business })[],
): Promise<ExperienceWithBusiness[]> {
  if (experiences.length === 0) return [];

  const { data: counts, error } = await supabase.rpc("reserved_counts_for_experiences", {
    p_experience_ids: experiences.map((e) => e.id),
  });

  if (error) {
    console.error("[attachReservedCounts] reserved_counts_for_experiences RPC failed", error);
  }

  const countMap = new Map((counts ?? []).map((c) => [c.experience_id, c.reserved_count]));

  return experiences.map((e) => ({ ...e, reserved_count: countMap.get(e.id) ?? 0 }));
}

export interface ExperiencesResult {
  data: ExperienceWithBusiness[];
  /** True when the query itself failed (connection, RLS, etc.) — distinct from a genuinely empty result. */
  error: boolean;
}

export async function getPublicExperiences(supabase: SupabaseClient<Database>): Promise<ExperiencesResult> {
  const { data, error } = await supabase
    .from("experiences")
    .select("*, business:businesses(*)")
    .neq("status", "draft")
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("[getPublicExperiences] query failed", error);
    return { data: [], error: true };
  }

  const withCounts = await attachReservedCounts(supabase, (data ?? []) as unknown as (Experience & { business: Business })[]);
  return { data: withCounts, error: false };
}

export async function getExperienceBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<ExperienceWithBusiness | null> {
  const { data, error } = await supabase
    .from("experiences")
    .select("*, business:businesses(*)")
    .eq("slug", slug)
    .neq("status", "draft")
    .maybeSingle();

  if (error || !data) return null;

  const [withCount] = await attachReservedCounts(supabase, [data as unknown as Experience & { business: Business }]);
  return withCount ?? null;
}

export async function getFeaturedExperience(
  supabase: SupabaseClient<Database>,
): Promise<ExperienceWithBusiness | null> {
  const { data: all } = await getPublicExperiences(supabase);
  const now = Date.now();
  const upcoming = all.filter((e) => e.status === "published" && new Date(e.starts_at).getTime() > now);

  const featured = upcoming.find((e) => e.featured);
  if (featured) return featured;

  return upcoming.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())[0] ?? null;
}

/** The user's active (pass-consuming) reservation for the current calendar week, if any. */
export async function getActiveWeeklyReservation(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<(Reservation & { experience: ExperienceWithBusiness }) | null> {
  const week = weekStartKey();

  const { data, error } = await supabase
    .from("reservations")
    .select("*, experience:experiences(*, business:businesses(*))")
    .eq("user_id", userId)
    .eq("week_start", week)
    .in("status", ["confirmed", "attended", "no_show"])
    .maybeSingle();

  if (error || !data) return null;

  const raw = data as unknown as Reservation & { experience: Experience & { business: Business } };
  const [experienceWithCount] = await attachReservedCounts(supabase, [raw.experience]);

  return { ...raw, experience: experienceWithCount };
}

export async function getUserReservationHistory(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<(Reservation & { experience: Experience & { business: Business } })[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select("*, experience:experiences(*, business:businesses(*))")
    .eq("user_id", userId)
    .order("reserved_at", { ascending: false });

  if (error || !data) return [];

  return data as unknown as (Reservation & { experience: Experience & { business: Business } })[];
}

export async function getExistingReservationForExperience(
  supabase: SupabaseClient<Database>,
  userId: string,
  experienceId: string,
): Promise<Reservation | null> {
  const { data } = await supabase
    .from("reservations")
    .select("*")
    .eq("user_id", userId)
    .eq("experience_id", experienceId)
    .in("status", ["confirmed", "attended", "no_show"])
    .maybeSingle();

  return (data as Reservation) ?? null;
}

export async function getActiveBusinesses(supabase: SupabaseClient<Database>): Promise<Business[]> {
  const { data } = await supabase.from("businesses").select("*").order("name");
  return (data as Business[]) ?? [];
}
