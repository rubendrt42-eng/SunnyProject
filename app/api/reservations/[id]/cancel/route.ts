import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyPassCancelledByUser } from "@/lib/email/notifications";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ code: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const { data: reservation, error } = await supabase.rpc("cancel_reservation", { p_reservation_id: id });

  if (error || !reservation) {
    const code = error?.message ?? "UNKNOWN_ERROR";
    const status = code === "RESERVATION_NOT_FOUND" ? 404 : code === "FORBIDDEN" ? 403 : 409;
    return NextResponse.json({ code }, { status });
  }

  const { data: experience } = await supabase
    .from("experiences")
    .select("*")
    .eq("id", reservation.experience_id)
    .maybeSingle();
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();

  if (experience) {
    await notifyPassCancelledByUser({
      toEmail: user.email ?? "",
      fullName: profile?.full_name ?? "",
      reservation,
      experience,
    });
  }

  return NextResponse.json({ reservation });
}
