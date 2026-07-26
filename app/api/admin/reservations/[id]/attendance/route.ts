import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

const bodySchema = z.object({ status: z.enum(["attended", "no_show"]) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ code: "INVALID_INPUT" }, { status: 400 });

  const supabase = await createClient();
  const { data: reservation, error } = await supabase.rpc("admin_set_attendance", {
    p_reservation_id: id,
    p_status: parsed.data.status,
  });

  if (error || !reservation) {
    return NextResponse.json({ code: error?.message ?? "UNKNOWN_ERROR" }, { status: 400 });
  }

  return NextResponse.json({ reservation });
}
