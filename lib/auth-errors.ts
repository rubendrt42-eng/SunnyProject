/**
 * Turns a Supabase auth error into something a person can act on.
 *
 * This exists because the sign-in form used to show one sentence — "No
 * pudimos enviar el enlace. Verifica tu correo e intenta de nuevo." — for
 * every possible failure. That message is actively misleading for the two
 * failures that actually happen:
 *
 *   · a send-rate limit, where "intenta de nuevo" is the worst possible
 *     advice because each retry extends the wait; and
 *   · an unauthorised redirect domain, which has nothing to do with the
 *     address the person typed.
 *
 * Diagnosing a real incident on this project took hours of reading server
 * logs precisely because the UI hid which of these it was. Now the screen
 * says it.
 */

export type AuthErrorKind = "rate_limit" | "redirect_not_allowed" | "invalid_email" | "network" | "unknown";

export interface FriendlyAuthError {
  kind: AuthErrorKind;
  /** Shown as the headline. */
  title: string;
  /** Shown underneath. Must tell the person what to DO. */
  detail: string;
  /** True when retrying makes things worse, so the form should discourage it. */
  discourageRetry: boolean;
  /** Surfaced in small print so a report to the team is instantly diagnosable. */
  code: string | null;
}

/** Shape of what supabase-js hands back; kept loose so a shape change can't crash the form. */
interface RawAuthError {
  message?: string;
  code?: string;
  status?: number;
  name?: string;
}

export function describeAuthError(raw: unknown): FriendlyAuthError {
  const err = (raw ?? {}) as RawAuthError;
  const code = err.code ?? null;
  const status = err.status;
  const message = (err.message ?? "").toLowerCase();

  // Rate limit. Supabase reports this as `over_email_send_rate_limit` with
  // HTTP 429; the short "only request this after N seconds" variant carries
  // the same code.
  if (code === "over_email_send_rate_limit" || status === 429 || message.includes("rate limit")) {
    const seconds = message.match(/after (\d+) seconds?/)?.[1];
    return {
      kind: "rate_limit",
      title: "Demasiados envíos seguidos",
      detail: seconds
        ? `Por seguridad hay que esperar ${seconds} segundos antes de pedir otro enlace. No vuelvas a intentar antes de eso: cada intento reinicia la espera.`
        : "El servicio de correo limitó los envíos temporalmente. Espera unos minutos antes de pedir otro enlace — reintentar ahora alarga la espera en lugar de acortarla.",
      discourageRetry: true,
      code,
    };
  }

  // Unauthorised redirect. Nothing to do with the address typed, so saying
  // "verifica tu correo" would send the person down the wrong path.
  if (message.includes("redirect")) {
    return {
      kind: "redirect_not_allowed",
      title: "Este sitio no está autorizado para el acceso",
      detail:
        "La dirección desde la que estás entrando no está en la lista de URLs permitidas de Supabase, así que el enlace no podría regresarte aquí. No es algo que puedas arreglar tú: pásale este mensaje al equipo.",
      discourageRetry: true,
      code,
    };
  }

  if (message.includes("email") && (message.includes("invalid") || message.includes("valid"))) {
    return {
      kind: "invalid_email",
      title: "Revisa el correo",
      detail: "Parece que la dirección tiene un error de escritura. Corrígela e intenta de nuevo.",
      discourageRetry: false,
      code,
    };
  }

  if (err.name === "AuthRetryableFetchError" || message.includes("fetch") || message.includes("network")) {
    return {
      kind: "network",
      title: "No pudimos conectar",
      detail: "Revisa tu conexión e intenta de nuevo.",
      discourageRetry: false,
      code,
    };
  }

  return {
    kind: "unknown",
    title: "No pudimos enviar el enlace",
    detail: "Intenta de nuevo en un momento. Si vuelve a pasar, comparte el código de abajo con el equipo.",
    discourageRetry: false,
    code: code ?? (status ? `http_${status}` : null),
  };
}
