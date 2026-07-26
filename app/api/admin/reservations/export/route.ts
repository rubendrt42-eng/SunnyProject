import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatTime } from "@/lib/dates";
import type { Business, Experience, Reservation } from "@/lib/database.types";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const experienceId = searchParams.get("experienceId");

  const supabase = await createClient();
  let query = supabase
    .from("reservations")
    .select("*, experience:experiences(*, business:businesses(*))")
    .order("reserved_at", { ascending: false });

  if (experienceId) query = query.eq("experience_id", experienceId);

  const { data: reservations } = await query;
  const rows = (reservations ?? []) as unknown as (Reservation & { experience: Experience & { business: Business } })[];

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = await supabase.from("profiles").select("id, full_name, phone").in("id", userIds);
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const emailMap = new Map<string, string>();
  try {
    const adminClient = createAdminClient();
    let page = 1;
    for (;;) {
      const { data } = await adminClient.auth.admin.listUsers({ page, perPage: 1000 });
      (data?.users ?? []).forEach((u) => emailMap.set(u.id, u.email ?? ""));
      if (!data || data.users.length < 1000) break;
      page += 1;
    }
  } catch (err) {
    console.error("[admin/reservations/export] could not load emails", err);
  }

  const header = ["Folio", "Estado", "Nombre", "Correo", "WhatsApp", "Experiencia", "Negocio", "Fecha", "Hora", "Fuente", "Reservado el"];
  const lines = [header.join(",")];

  for (const r of rows) {
    const profile = profileMap.get(r.user_id);
    lines.push(
      [
        r.folio,
        r.status,
        profile?.full_name ?? "",
        emailMap.get(r.user_id) ?? "",
        profile?.phone ?? "",
        r.experience?.title ?? "",
        r.experience?.business?.name ?? "",
        r.experience ? formatDate(r.experience.starts_at) : "",
        r.experience ? formatTime(r.experience.starts_at) : "",
        r.source ?? "",
        formatDate(r.reserved_at),
      ]
        .map((v) => csvEscape(String(v)))
        .join(","),
    );
  }

  const csv = lines.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sunny-reservaciones-${Date.now()}.csv"`,
    },
  });
}
