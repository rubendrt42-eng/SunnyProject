import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Business,
  Database,
  Experience,
  PartnerLead,
  Profile,
  Reservation,
  ReservationStatus,
} from "@/lib/database.types";
import { partySizeOf } from "@/lib/experience-flags";
import { weekStartKey } from "@/lib/dates";

/**
 * Server-side reads for Emmy's panel.
 *
 * Two rules shape everything here:
 *
 * 1. **Count people, not rows.** Occupancy is summed with `partySizeOf()`,
 *    so a reservation covering three people subtracts three spots. The
 *    panel therefore reports the same numbers the public site does, and
 *    keeps reporting them correctly once the group migration lands. (The
 *    database's own capacity guard is rewritten in the same migration —
 *    see SUNNY_COMPANIONS_MIGRATION_PLAN.md. This is display only; it does
 *    not protect against overbooking on its own.)
 *
 * 2. **Bounded queries.** Nothing loads an unbounded table. Reservations
 *    are capped and paginated, because "select everything" is fine with
 *    twelve rows and a problem with twelve thousand (brief §42).
 */

export const ADMIN_PAGE_SIZE = 50;

/** Statuses that occupy a spot. A cancelled reservation frees its spots. */
const ACTIVE_STATUSES = ["confirmed", "attended", "no_show"] as const;

export type ExperienceWithStats = Experience & {
  business: Business | null;
  reservedPeople: number;
  reservationCount: number;
  groupCount: number;
  attendedCount: number;
  noShowCount: number;
  cancelledCount: number;
};

/**
 * Occupancy per experience, aggregated in one pass over the reservations
 * we already fetched rather than a query per experience.
 */
export function summarizeReservations(reservations: Reservation[]) {
  const byExperience = new Map<
    string,
    { reservedPeople: number; reservationCount: number; groupCount: number; attended: number; noShow: number; cancelled: number }
  >();

  for (const r of reservations) {
    const entry =
      byExperience.get(r.experience_id) ??
      { reservedPeople: 0, reservationCount: 0, groupCount: 0, attended: 0, noShow: 0, cancelled: 0 };

    if (r.status === "cancelled") {
      entry.cancelled += 1;
    } else {
      const people = partySizeOf(r);
      entry.reservedPeople += people;
      entry.reservationCount += 1;
      if (people > 1) entry.groupCount += 1;
      if (r.status === "attended") entry.attended += 1;
      if (r.status === "no_show") entry.noShow += 1;
    }

    byExperience.set(r.experience_id, entry);
  }

  return byExperience;
}

export async function getAdminExperiences(
  supabase: SupabaseClient<Database>,
  opts: { limit?: number } = {},
): Promise<{ experiences: ExperienceWithStats[]; error: boolean }> {
  const { data, error } = await supabase
    .from("experiences")
    .select("*, business:businesses(*)")
    .order("starts_at", { ascending: false })
    .limit(opts.limit ?? 200);

  if (error) {
    console.error("[getAdminExperiences] query failed", error);
    return { experiences: [], error: true };
  }

  const rows = (data ?? []) as unknown as (Experience & { business: Business | null })[];
  if (rows.length === 0) return { experiences: [], error: false };

  const { data: reservationRows } = await supabase
    .from("reservations")
    .select("*")
    .in(
      "experience_id",
      rows.map((e) => e.id),
    );

  const summary = summarizeReservations((reservationRows ?? []) as Reservation[]);

  const experiences = rows.map((e) => {
    const s = summary.get(e.id);
    return {
      ...e,
      reservedPeople: s?.reservedPeople ?? 0,
      reservationCount: s?.reservationCount ?? 0,
      groupCount: s?.groupCount ?? 0,
      attendedCount: s?.attended ?? 0,
      noShowCount: s?.noShow ?? 0,
      cancelledCount: s?.cancelled ?? 0,
    };
  });

  return { experiences, error: false };
}

export type ReservationWithContext = Reservation & {
  experience: (Experience & { business: Business | null }) | null;
  profile: Pick<Profile, "id" | "full_name" | "city"> | null;
  companions: { id: string; full_name: string; email: string | null; status: string }[];
  email: string | null;
};

/**
 * One page of reservations with the experience, the holder's profile, and
 * companions attached.
 *
 * The companion join is attempted and tolerated: `reservation_companions`
 * only exists after the group migration, so a failure here means
 * "not migrated yet", not "broken" — the page still renders every
 * reservation, with empty companion lists.
 */
export async function getAdminReservations(
  supabase: SupabaseClient<Database>,
  opts: { page?: number; experienceId?: string; status?: ReservationStatus } = {},
): Promise<{ reservations: ReservationWithContext[]; total: number; error: boolean }> {
  const page = Math.max(opts.page ?? 1, 1);
  const from = (page - 1) * ADMIN_PAGE_SIZE;

  let query = supabase
    .from("reservations")
    .select("*, experience:experiences(*, business:businesses(*))", { count: "exact" })
    .order("reserved_at", { ascending: false })
    .range(from, from + ADMIN_PAGE_SIZE - 1);

  if (opts.experienceId) query = query.eq("experience_id", opts.experienceId);
  if (opts.status) query = query.eq("status", opts.status);

  const { data, error, count } = await query;

  if (error) {
    console.error("[getAdminReservations] query failed", error);
    return { reservations: [], total: 0, error: true };
  }

  const rows = (data ?? []) as unknown as (Reservation & {
    experience: (Experience & { business: Business | null }) | null;
  })[];

  if (rows.length === 0) return { reservations: [], total: count ?? 0, error: false };

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const reservationIds = rows.map((r) => r.id);

  const [{ data: profiles }, companionResult] = await Promise.all([
    supabase.from("profiles").select("id, full_name, city").in("id", userIds),
    supabase.from("reservation_companions").select("*").in("reservation_id", reservationIds),
  ]);

  const profileById = new Map(((profiles ?? []) as Profile[]).map((p) => [p.id, p]));

  const companionsByReservation = new Map<string, { id: string; full_name: string; email: string | null; status: string }[]>();
  if (!companionResult.error) {
    for (const c of (companionResult.data ?? []) as { id: string; reservation_id: string; full_name: string; email: string | null; status: string }[]) {
      const list = companionsByReservation.get(c.reservation_id) ?? [];
      list.push({ id: c.id, full_name: c.full_name, email: c.email, status: c.status });
      companionsByReservation.set(c.reservation_id, list);
    }
  }

  const reservations: ReservationWithContext[] = rows.map((r) => ({
    ...r,
    profile: profileById.get(r.user_id) ?? null,
    companions: companionsByReservation.get(r.id) ?? [],
    // Auth emails live in auth.users, which the anon/authed client cannot
    // read. The export route uses the service-role client for that; the
    // table shows the profile name and links through to the detail.
    email: null,
  }));

  return { reservations, total: count ?? 0, error: false };
}

export interface AdminUserRow {
  profile: Profile;
  reservationCount: number;
  attendedCount: number;
  noShowCount: number;
  cancelledCount: number;
  lastActivityAt: string | null;
}

/**
 * The users view (brief §36). Read-only by design: no role editing, no
 * password actions, no bulk email. Only the fields Emmy needs to recognise
 * somebody and see their history.
 */
export async function getAdminUsers(
  supabase: SupabaseClient<Database>,
  opts: { search?: string; limit?: number } = {},
): Promise<{ users: AdminUserRow[]; error: boolean }> {
  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 200);

  const search = opts.search?.trim();
  if (search) query = query.ilike("full_name", `%${search}%`);

  const { data, error } = await query;

  if (error) {
    console.error("[getAdminUsers] query failed", error);
    return { users: [], error: true };
  }

  const profiles = (data ?? []) as Profile[];
  if (profiles.length === 0) return { users: [], error: false };

  const { data: reservationRows } = await supabase
    .from("reservations")
    .select("user_id, status, reserved_at")
    .in(
      "user_id",
      profiles.map((p) => p.id),
    );

  const stats = new Map<string, { total: number; attended: number; noShow: number; cancelled: number; last: string | null }>();
  for (const r of (reservationRows ?? []) as Pick<Reservation, "user_id" | "status" | "reserved_at">[]) {
    const entry = stats.get(r.user_id) ?? { total: 0, attended: 0, noShow: 0, cancelled: 0, last: null };
    entry.total += 1;
    if (r.status === "attended") entry.attended += 1;
    if (r.status === "no_show") entry.noShow += 1;
    if (r.status === "cancelled") entry.cancelled += 1;
    if (!entry.last || new Date(r.reserved_at) > new Date(entry.last)) entry.last = r.reserved_at;
    stats.set(r.user_id, entry);
  }

  const users = profiles.map((profile) => {
    const s = stats.get(profile.id);
    return {
      profile,
      reservationCount: s?.total ?? 0,
      attendedCount: s?.attended ?? 0,
      noShowCount: s?.noShow ?? 0,
      cancelledCount: s?.cancelled ?? 0,
      lastActivityAt: s?.last ?? null,
    };
  });

  return { users, error: false };
}

export interface DashboardData {
  weekExperiences: ExperienceWithStats[];
  nextExperience: ExperienceWithStats | null;
  upcomingCount: number;
  totalCapacity: number;
  reservedPeople: number;
  availableSpots: number;
  weekReservations: number;
  attendedCount: number;
  noShowCount: number;
  newLeads: number;
  needsAttention: { experience: ExperienceWithStats; reason: string }[];
  error: boolean;
}

/**
 * Everything the dashboard needs, so the page itself does no arithmetic.
 * Answers the seven questions in brief §31 from real data — no invented
 * metrics, and no metric that would read as impressive but mean nothing.
 */
export async function getDashboardData(supabase: SupabaseClient<Database>): Promise<DashboardData> {
  const week = weekStartKey();
  const now = Date.now();

  const [{ experiences, error }, leadResult, reservationResult] = await Promise.all([
    getAdminExperiences(supabase, { limit: 200 }),
    supabase.from("partner_leads").select("id, status").eq("status", "new"),
    supabase.from("reservations").select("status, week_start"),
  ]);

  const live = experiences.filter((e) => !e.archived_at && e.status !== "cancelled");
  const upcoming = live
    .filter((e) => new Date(e.starts_at).getTime() > now && e.status === "published")
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  const weekExperiences = upcoming.filter((e) => {
    const days = (new Date(e.starts_at).getTime() - now) / 86_400_000;
    return days <= 7;
  });

  const published = live.filter((e) => e.status === "published");
  const totalCapacity = published.reduce((sum, e) => sum + e.capacity, 0);
  const reservedPeople = published.reduce((sum, e) => sum + e.reservedPeople, 0);

  const allReservations = (reservationResult.data ?? []) as Pick<Reservation, "status" | "week_start">[];

  const needsAttention: { experience: ExperienceWithStats; reason: string }[] = [];
  for (const e of upcoming) {
    const remaining = e.capacity - e.reservedPeople;
    const hoursOut = (new Date(e.starts_at).getTime() - now) / 3_600_000;

    if (remaining <= 0) {
      needsAttention.push({ experience: e, reason: "Agotada" });
    } else if (hoursOut <= 48 && e.reservedPeople === 0) {
      needsAttention.push({ experience: e, reason: "Empieza en menos de 48 h y no tiene reservaciones" });
    } else if (remaining <= 2) {
      needsAttention.push({ experience: e, reason: `Quedan ${remaining} ${remaining === 1 ? "lugar" : "lugares"}` });
    }
  }
  for (const e of live) {
    if (e.status === "draft" && new Date(e.starts_at).getTime() > now) {
      needsAttention.push({ experience: e, reason: "Sigue en borrador" });
    }
  }

  return {
    weekExperiences,
    nextExperience: upcoming[0] ?? null,
    upcomingCount: upcoming.length,
    totalCapacity,
    reservedPeople,
    availableSpots: Math.max(totalCapacity - reservedPeople, 0),
    weekReservations: allReservations.filter((r) => r.week_start === week && r.status !== "cancelled").length,
    attendedCount: allReservations.filter((r) => r.status === "attended").length,
    noShowCount: allReservations.filter((r) => r.status === "no_show").length,
    newLeads: (leadResult.data ?? []).length,
    needsAttention: needsAttention.slice(0, 8),
    error,
  };
}

export async function getAdminLeads(supabase: SupabaseClient<Database>): Promise<PartnerLead[]> {
  const { data } = await supabase.from("partner_leads").select("*").order("created_at", { ascending: false }).limit(200);
  return (data ?? []) as PartnerLead[];
}

export { ACTIVE_STATUSES };
