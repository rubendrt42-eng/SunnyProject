import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildIcsFile } from "@/lib/ics";
import type { Business, Experience, Reservation } from "@/lib/database.types";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ code: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const { data } = await supabase
    .from("reservations")
    .select("*, experience:experiences(*, business:businesses(*))")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ code: "RESERVATION_NOT_FOUND" }, { status: 404 });
  }

  const reservation = data as unknown as Reservation & { experience: Experience & { business: Business } };
  const { experience } = reservation;

  const ics = buildIcsFile({
    uid: reservation.id,
    title: experience.title,
    description: `Tu pase Sunny Project · Folio ${reservation.folio}${experience.instructions ? `\n${experience.instructions}` : ""}`,
    location: [experience.location_name, experience.address].filter(Boolean).join(", "),
    startsAt: experience.starts_at,
    endsAt: experience.ends_at,
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="sunny-${reservation.folio}.ics"`,
    },
  });
}
