import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { notifyExperienceCancelledByAdmin } from "@/lib/email/notifications";
import type { Experience } from "@/lib/database.types";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;
  const supabase = await createClient();

  const { data: experience } = await supabase.from("experiences").select("*").eq("id", id).maybeSingle();
  if (!experience) return NextResponse.json({ code: "EXPERIENCE_NOT_FOUND" }, { status: 404 });

  const { data: cancelledReservations, error } = await supabase.rpc("admin_cancel_experience", {
    p_experience_id: id,
  });

  if (error) {
    return NextResponse.json({ code: error.message }, { status: 400 });
  }

  const reservations = cancelledReservations ?? [];

  if (reservations.length > 0) {
    const userIds = reservations.map((r) => r.user_id);
    const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

    let adminClient;
    try {
      adminClient = createAdminClient();
    } catch (err) {
      console.error("[admin/experiences/cancel] SUPABASE_SERVICE_ROLE_KEY missing, cannot send cancellation emails", err);
      adminClient = null;
    }

    for (const reservation of reservations) {
      if (!adminClient) continue;
      const { data: userResult } = await adminClient.auth.admin.getUserById(reservation.user_id);
      const email = userResult?.user?.email;
      if (!email) continue;

      await notifyExperienceCancelledByAdmin({
        toEmail: email,
        fullName: profileMap.get(reservation.user_id) ?? "",
        reservation,
        experience: experience as Experience,
      });
    }
  }

  return NextResponse.json({ ok: true, cancelledCount: reservations.length });
}
