import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

/**
 * Safe, non-sensitive diagnostics only — never a token, code, cookie, or
 * email. Added while investigating a real magic-link failure on Vercel
 * Preview: this route previously logged nothing at all, so there was no
 * way to tell from Vercel's runtime logs whether it was even being reached,
 * let alone what Supabase actually sent it. See SUNNY_MVP_1_1_DECISIONS.md /
 * the MVP 1.1 magic-link investigation for the full writeup.
 */
function logCallback(fields: {
  callbackHost: string;
  hasCode: boolean;
  hasTokenHash: boolean;
  hasErrorCode: boolean;
  exchangeSucceeded: boolean;
  sessionUserPresent: boolean;
  redirectDestination: string;
}) {
  console.log("[auth/callback]", JSON.stringify(fields));
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  // See the matching comment in app/acceso/page.tsx: also reject
  // protocol-relative URLs ("//evil.com"), not just anything starting with "/".
  const next = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/mi-pase";

  // Supabase redirects here with `error_code`/`error_description` (no `code`)
  // when the link itself is already dead — e.g. expired or already used —
  // rather than a valid code that fails on exchange. Surface that distinction
  // to /acceso instead of a single generic error.
  const errorCode = searchParams.get("error_code");
  const hasTokenHash = searchParams.has("token_hash");

  if (!code) {
    const reason = errorCode === "otp_expired" ? "expired" : errorCode ? "generic" : null;
    const destination = reason ? `${origin}/acceso?error=${reason}` : `${origin}/acceso`;
    logCallback({
      callbackHost: origin,
      hasCode: false,
      hasTokenHash,
      hasErrorCode: Boolean(errorCode),
      exchangeSucceeded: false,
      sessionUserPresent: false,
      redirectDestination: destination,
    });
    return NextResponse.redirect(destination);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    const reason = error?.code === "otp_expired" ? "expired" : "generic";
    const destination = `${origin}/acceso?error=${reason}`;
    logCallback({
      callbackHost: origin,
      hasCode: true,
      hasTokenHash,
      hasErrorCode: Boolean(errorCode),
      exchangeSucceeded: false,
      sessionUserPresent: false,
      redirectDestination: destination,
    });
    return NextResponse.redirect(destination);
  }

  await bootstrapAdminRole(data.user.id, data.user.email ?? "");

  const nextUrl = new URL(`${origin}${next}`);
  nextUrl.searchParams.set("bienvenido", "1");
  logCallback({
    callbackHost: origin,
    hasCode: true,
    hasTokenHash,
    hasErrorCode: Boolean(errorCode),
    exchangeSucceeded: true,
    sessionUserPresent: true,
    redirectDestination: nextUrl.toString(),
  });
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
