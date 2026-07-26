import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { notifyPassConfirmed } from "@/lib/email/notifications";
import type { Business, Experience, Reservation } from "@/lib/database.types";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("reservations")
    .select("*, experience:experiences(*, business:businesses(*))")
    .eq("id", id)
    .maybeSingle();

  if (!data) return NextResponse.json({ code: "RESERVATION_NOT_FOUND" }, { status: 404 });

  const reservation = data as unknown as Reservation & { experience: Experience & { business: Business } };
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", reservation.user_id).maybeSingle();

  const adminClient = createAdminClient();
  const { data: userResult } = await adminClient.auth.admin.getUserById(reservation.user_id);
  const email = userResult?.user?.email;

  if (!email) return NextResponse.json({ code: "USER_EMAIL_NOT_FOUND" }, { status: 404 });

  const { business, ...experienceRow } = reservation.experience;
  await notifyPassConfirmed({
    toEmail: email,
    fullName: profile?.full_name ?? "",
    reservation,
    experience: experienceRow,
    business,
  });

  return NextResponse.json({ ok: true });
}
