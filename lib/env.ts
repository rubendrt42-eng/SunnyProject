/**
 * La dirección pública del sitio.
 *
 * POR QUÉ NO ES UN SIMPLE `|| "http://localhost:3000"`
 *
 * Este valor arma el enlace que se manda al compartir una experiencia por
 * WhatsApp, que es el canal de crecimiento real de este producto. Si
 * `NEXT_PUBLIC_SITE_URL` falta, la versión anterior caía en `localhost:3000` y
 * **cada enlace compartido apuntaba al ordenador de quien lo compartió**. Sin
 * error, sin aviso, sin nada raro en la página: el fallo solo se ve cuando
 * alguien al otro lado abre el enlace y no llega a ningún sitio.
 *
 * Hoy la variable está bien puesta. El riesgo es el día que se cree el proyecto
 * de Vercel del dominio definitivo y alguien no la copie. Por eso, antes de
 * caer en localhost, se usa el dominio que el propio Vercel expone.
 *
 * `localhost` queda solo para desarrollo, que es donde de verdad corresponde.
 */
function resolverSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;

  const enVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (enVercel) return `https://${enVercel}`;

  return "http://localhost:3000";
}

export const env = {
  siteUrl: resolverSiteUrl(),
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
