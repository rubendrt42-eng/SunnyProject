/**
 * La dirección pública del sitio.
 *
 * ES EL DOMINIO, NO UNA VARIABLE DE ENTORNO.
 *
 * Antes la única fuente era `NEXT_PUBLIC_SITE_URL` y, si faltaba, el dominio
 * que el propio Vercel expone. La variable nunca se puso, así que en
 * producción el sitio se presentaba como `sunny-mvp.vercel.app`: ahí
 * apuntaban la URL canónica, la imagen de compartir y el mapa del sitio.
 *
 * Google obedeció. Indexó la dirección de Vercel en vez del dominio del
 * cliente y, como el resultado vivía en `vercel.app`, rotuló la ficha con el
 * nombre de Vercel y su logotipo. El sitio llevaba días así.
 *
 * El dominio ya está decidido y conectado, así que vive aquí, en el código,
 * donde no se puede olvidar de copiar. La variable sigue mandando por encima
 * —sirve para mover el sitio sin tocar código— pero ya no hace falta que
 * exista.
 *
 * LA VARIABLE EXISTÍA, Y TRAÍA LA DIRECCIÓN DE VERCEL
 *
 * Primero se creyó que faltaba. No faltaba: estaba puesta, para producción y
 * para previsualización, con el valor `https://sunny-mvp.vercel.app`. Por eso
 * poner el dominio en el código no cambió nada — la variable gana.
 *
 * Así que la regla no puede ser «la variable manda» a secas. En producción un
 * `*.vercel.app` NO es la dirección del sitio: es la del despliegue, un
 * detalle de dónde está alojado. Nadie quiere eso como canónica, ni en el
 * mapa del sitio, ni en el enlace que se comparte. Cuando la variable trae
 * eso en producción, se ignora.
 *
 * Fuera de producción sí vale: una previsualización vive de verdad en un
 * `vercel.app` y tiene que probarse a sí misma.
 *
 * ORDEN
 *
 *   1. `NEXT_PUBLIC_SITE_URL`, salvo que en producción apunte a vercel.app.
 *   2. En producción, el dominio oficial.
 *   3. En una previsualización, su propia URL: cada rama se prueba a sí misma
 *      y no se hace pasar por el sitio de verdad.
 *   4. `localhost`, solo en desarrollo.
 *
 * Esto arma además el enlace que se manda al compartir por WhatsApp. Con
 * `localhost` cada enlace compartido apuntaría al ordenador de quien lo
 * compartió: sin error, sin aviso, y solo visible para quien lo recibe.
 */
const DOMINIO_OFICIAL = "https://www.suniproject.com";

/** `https://algo.vercel.app/` -> true. Una dirección rota -> false. */
function esDeVercel(direccion: string): boolean {
  try {
    return /(^|\.)vercel\.app$/.test(new URL(direccion).hostname);
  } catch {
    return false;
  }
}

function resolverSiteUrl(): string {
  const enProduccion = process.env.VERCEL_ENV === "production";
  const puesta = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (puesta && !(enProduccion && esDeVercel(puesta))) return puesta;

  if (enProduccion) return DOMINIO_OFICIAL;

  const enVercel = process.env.VERCEL_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
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
