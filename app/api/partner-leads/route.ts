import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { partnerLeadSchema } from "@/lib/validations";
import { notifyNewPartnerLead } from "@/lib/email/notifications";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = partnerLeadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ code: "INVALID_INPUT", issues: parsed.error.issues }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: lead, error } = await supabase
    .from("partner_leads")
    .insert({
      business_name: parsed.data.business_name,
      contact_name: parsed.data.contact_name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      category: parsed.data.category || null,
      instagram_url: parsed.data.instagram_url || null,
      city: parsed.data.city || "Monterrey",
      message: parsed.data.message || null,
      offered_spots: parsed.data.offered_spots ?? null,
    })
    .select()
    .single();

  if (error || !lead) {
    console.error("[partner-leads] insert failed", error);
    return NextResponse.json({ code: "INSERT_FAILED" }, { status: 500 });
  }

  await notifyNewPartnerLead(lead);

  return NextResponse.json({ ok: true }, { status: 201 });
}
