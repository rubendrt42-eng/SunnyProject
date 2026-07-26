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

  const { experienceId, source } = parsed.data;

  const { data: reservation, error } = await supabase.rpc("claim_reservation", {
    p_experience_id: experienceId,
    p_source: source ?? null,
  });

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
    });
  }

  return NextResponse.json({ reservation }, { status: 201 });
}
