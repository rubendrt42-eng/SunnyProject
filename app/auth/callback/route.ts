import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/mi-pase";

  // Supabase redirects here with `error_code`/`error_description` (no `code`)
  // when the link itself is already dead — e.g. expired or already used —
  // rather than a valid code that fails on exchange. Surface that distinction
  // to /acceso instead of a single generic error.
  const errorCode = searchParams.get("error_code");
  if (!code) {
    const reason = errorCode === "otp_expired" ? "expired" : errorCode ? "generic" : null;
    return NextResponse.redirect(reason ? `${origin}/acceso?error=${reason}` : `${origin}/acceso`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    const reason = error?.code === "otp_expired" ? "expired" : "generic";
    return NextResponse.redirect(`${origin}/acceso?error=${reason}`);
  }

  await bootstrapAdminRole(data.user.id, data.user.email ?? "");

  const nextUrl = new URL(`${origin}${next}`);
  nextUrl.searchParams.set("bienvenido", "1");
  return NextResponse.redirect(nextUrl);
}

/**
 * Promotes ADMIN_EMAIL to the admin role on first login. Uses the
 * service-role client server-side only — never exposed to the browser,
 * and the profiles.role column can't be changed by the client anyway
 * (see trg_prevent_role_self_update).
 */
async function bootstrapAdminRole(userId: string, email: string) {
  if (!env.adminEmail || !env.supabaseServiceRoleKey) return;
  if (email.toLowerCase().trim() !== env.adminEmail) return;

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("role").eq("id", userId).maybeSingle();

    if (profile && profile.role !== "admin") {
      await admin.from("profiles").update({ role: "admin" }).eq("id", userId);
    }
  } catch (err) {
    console.error("[auth/callback] admin bootstrap failed", err);
  }
}
