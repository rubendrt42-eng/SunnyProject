import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { claimReservationSchema } from "@/lib/validations";
import { notifyPassConfirmed } from "@/lib/email/notifications";
import type { Business, Experience } from "@/lib/database.types";

const CONFLICT_CODES = new Set([
  "EXPERIENCE_NOT_PUBLISHED",
  "CLAIM_WINDOW_CLOSED",
  "EXPERIENCE_PAST",
  "EXPERIENCE_SOLD_OUT",
  "WEEKLY_PASS_ALREADY_USED",
  "ALREADY_RESERVED_EXPERIENCE",
  "PARTY_SIZE_TOO_LARGE",
  "COMPANION_COUNT_MISMATCH",
  "COMPANION_NAME_REQUIRED",
  "INVALID_PARTY_SIZE",
]);

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ code: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = claimReservationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ code: "INVALID_INPUT", issues: parsed.error.issues }, { status: 400 });
  }

  const { experienceId, source, partySize, companions } = parsed.data;

  /**
   * Group parameters are always sent, including for a party of one.
   *
   * Before the group migration the database still has the two-argument
   * claim_reservation(uuid, text) and will reject the extra parameters with
   * PGRST202 (no matching function) — so the call falls back to the old
   * signature, but ONLY when the request is for a single person. A genuine
   * group request against an unmigrated database must fail loudly rather
   * than quietly booking one spot for three people, which is precisely the
   * overbooking the migration exists to prevent.
   */
  let reservation: Awaited<ReturnType<typeof supabase.rpc>>["data"] = null;
  let error: { message: string } | null = null;

  const grouped = await supabase.rpc("claim_reservation", {
    p_experience_id: experienceId,
    p_source: source ?? null,
    p_party_size: partySize,
    p_companions: companions,
  });

  if (grouped.error && isMissingFunctionSignature(grouped.error)) {
    if (partySize > 1) {
      return NextResponse.json({ code: "GROUPS_NOT_ENABLED" }, { status: 409 });
    }
    const legacy = await supabase.rpc("claim_reservation", {
      p_experience_id: experienceId,
      p_source: source ?? null,
    });
    reservation = legacy.data;
    error = legacy.error;
  } else {
    reservation = grouped.data;
    error = grouped.error;
  }

  if (error || !reservation) {
    const code = error?.message ?? "UNKNOWN_ERROR";
    const status = code === "NOT_AUTHENTICATED" ? 401 : code === "PROFILE_NOT_FOUND" || code.includes("NOT_FOUND") ? 404 : CONFLICT_CODES.has(code) ? 409 : 400;
    return NextResponse.json({ code }, { status });
  }

  const [{ data: experience }, { data: profile }] = await Promise.all([
    supabase.from("experiences").select("*, business:businesses(*)").eq("id", experienceId).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
  ]);

  if (experience) {
    const { business, ...experienceRow } = experience as unknown as Experience & { business: Business };
    await notifyPassConfirmed({
      toEmail: user.email ?? "",
      fullName: profile?.full_name ?? "",
      reservation,
      experience: experienceRow,
      business,
      companions: companions.map((c) => c.full_name),
    });
  }

  return NextResponse.json({ reservation }, { status: 201 });
}

/**
 * PostgREST reports "no function matches the given name and argument types"
 * as PGRST202. That is how we detect that the group migration has not been
 * applied to this database yet — distinct from any error raised *inside* the
 * function, which must be surfaced to the user as-is.
 */
function isMissingFunctionSignature(error: { code?: string; message?: string }): boolean {
  return error.code === "PGRST202" || /could not find the function|does not exist/i.test(error.message ?? "");
}
