export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  resendFromEmail: process.env.RESEND_FROM_EMAIL || "Sunny Project <onboarding@resend.dev>",
  adminEmail: (process.env.ADMIN_EMAIL || "").toLowerCase().trim(),
};

/**
 * The app must run in "demo mode" (friendly config screen instead of a
 * crash) whenever Supabase credentials are missing, e.g. a fresh clone
 * before `.env.local` is filled in.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function isEmailConfigured(): boolean {
  return Boolean(env.resendApiKey);
}
