"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function MagicLinkForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (signInError) {
      setStatus("error");
      setError("No pudimos enviar el enlace. Verifica tu correo e intenta de nuevo.");
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-xl border border-carbon/10 bg-warm-white p-6">
        <p className="font-medium">Revisa tu correo</p>
        <p className="mt-1 text-sm text-gray">
          Enviamos un enlace de acceso a <strong>{email}</strong>. Ábrelo desde este mismo dispositivo para continuar.
        </p>
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
          aria-invalid={status === "error"}
          aria-describedby={error ? "email-error" : undefined}
          className="rounded-lg border border-carbon/20 bg-warm-white px-4 py-3 text-base focus:border-carbon"
          placeholder="tu@correo.com"
        />
        {error && (
          <p id="email-error" className="text-sm text-orange">
            {error}
          </p>
        )}
      </div>
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Enviando…" : "Enviar enlace de acceso"}
      </Button>
      <p className="text-xs text-gray">
        Sin contraseñas. Te enviaremos un enlace mágico para entrar de forma segura.
      </p>
    </form>
  );
}
