import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { notifyPassCancelledByUser } from "@/lib/email/notifications";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;
  const supabase = await createClient();

  const { data: reservation, error } = await supabase.rpc("admin_cancel_reservation", { p_reservation_id: id });

  if (error || !reservation) {
    const code = error?.message ?? "UNKNOWN_ERROR";
    return NextResponse.json({ code }, { status: code === "RESERVATION_NOT_CANCELLABLE" ? 409 : 400 });
  }

  const [{ data: experience }, { data: profile }] = await Promise.all([
    supabase.from("experiences").select("*").eq("id", reservation.experience_id).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", reservation.user_id).maybeSingle(),
  ]);

  try {
    const adminClient = createAdminClient();
    const { data: userResult } = await adminClient.auth.admin.getUserById(reservation.user_id);
    if (experience && userResult?.user?.email) {
      await notifyPassCancelledByUser({
        toEmail: userResult.user.email,
        fullName: profile?.full_name ?? "",
        reservation,
        experience,
      });
    }
  } catch (err) {
    console.error("[admin/reservations/cancel] could not send email", err);
  }

  return NextResponse.json({ reservation });
}
