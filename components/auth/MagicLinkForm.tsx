"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { describeAuthError, type FriendlyAuthError } from "@/lib/auth-errors";

/** El host no cambia mientras la página vive, así que no hay a qué suscribirse. */
const subscribeToNothing = () => () => {};

/**
 * Se resuelve tras la hidratación porque `window` no existe al renderizar en
 * el servidor, y el valor depende del despliegue concreto que estés visitando.
 *
 * `useSyncExternalStore` y no un efecto con `setState`: es el mecanismo que
 * React ofrece justo para leer un valor del navegador que el servidor no
 * puede conocer, y evita el render extra que `react-hooks/set-state-in-effect`
 * señala con razón. Mismo patrón que `components/motion/useIsDesktop.ts`.
 */
function ReturnDomainHint() {
  const origin = useSyncExternalStore(
    subscribeToNothing,
    () => window.location.host,
    () => null,
  );
  if (!origin) return null;
  return (
    <p className="mt-1.5">
      El enlace te devolverá a <span className="font-medium text-carbon">{origin}</span>. Si al abrirlo
      apareces en otro sitio, avísanos: falta autorizar este dominio.
    </p>
  );
}

export function MagicLinkForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<FriendlyAuthError | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setError(null);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });

      if (signInError) {
        setStatus("error");
        // Every failure used to collapse into one sentence telling the person
        // to check their address and try again — wrong advice for a rate
        // limit, and irrelevant for an unauthorised domain. See
        // lib/auth-errors.ts.
        setError(describeAuthError(signInError));
        return;
      }

      setStatus("sent");
    } catch (err) {
      // A network failure here would otherwise leave the button stuck on
      // "Enviando…" forever with no way to retry.
      setStatus("error");
      setError(describeAuthError(err));
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-xl border border-carbon/10 bg-warm-white p-6">
        <p className="font-medium">Revisa tu correo</p>
        <p className="mt-1 text-sm text-gray">
          Enviamos un enlace de acceso a <strong>{email}</strong>. Ábrelo desde este mismo dispositivo para continuar.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-medium text-carbon underline decoration-carbon/30 underline-offset-4 hover:decoration-carbon"
        >
          ¿Correo incorrecto? Intenta de nuevo
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          // Only flag the field itself when the problem IS the field. A rate
          // limit or an unauthorised domain has nothing to do with what was
          // typed, and marking the input invalid sends the person hunting for
          // a typo that isn't there.
          aria-invalid={error?.kind === "invalid_email"}
          aria-describedby={error ? "email-error" : undefined}
          className="h-12 rounded-sm border border-carbon/20 bg-warm-white px-4 text-body focus:border-carbon"
          placeholder="tu@correo.com"
        />
      </div>

      {error && (
        <div
          id="email-error"
          role="alert"
          className="flex gap-3 rounded-md border border-orange/30 bg-orange/10 p-4"
        >
          <AlertTriangle aria-hidden size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-orange-ink" />
          <div className="min-w-0">
            <p className="text-small font-semibold text-carbon">{error.title}</p>
            <p className="mt-1 text-small text-carbon/80">{error.detail}</p>
            {error.code && (
              <p className="mt-2 font-mono text-label text-carbon/50">
                código: {error.code}
              </p>
            )}
          </div>
        </div>
      )}

      <Button
        type="submit"
        loading={status === "loading"}
        loadingLabel="Enviando…"
        // After a rate limit, offering a live button invites the one action
        // that makes the wait longer.
        disabled={error?.discourageRetry}
      >
        Enviar enlace de acceso
      </Button>

      {error?.discourageRetry ? (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setStatus("idle");
          }}
          className="text-small font-medium text-carbon underline decoration-carbon/30 underline-offset-4 hover:decoration-carbon"
        >
          Ya esperé — intentar otra vez
        </button>
      ) : (
        <div className="text-small text-gray">
          <p>Sin contraseñas. Te enviaremos un enlace mágico para entrar de forma segura.</p>
          {/*
           * Decir a qué dominio volverá el enlace.
           *
           * Cuando `redirect_to` no está en la lista de URLs permitidas de
           * Supabase, Supabase NO devuelve error: redirige en silencio al
           * Site URL del proyecto. El síntoma es que abres el enlace desde
           * el correo y apareces en otro despliegue —otra versión del
           * sitio— sin ninguna pista de por qué. Nos costó una sesión
           * entera diagnosticarlo mirando logs de servidor.
           *
           * Con el origen a la vista, basta comparar esta línea con la
           * barra de direcciones para detectarlo en dos segundos.
           */}
          <ReturnDomainHint />
        </div>
      )}
    </form>
  );
}
