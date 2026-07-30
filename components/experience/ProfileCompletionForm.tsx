"use client";

import { useActionState, useEffect, useState } from "react";
import { completeProfileAction, type ActionResult } from "@/lib/actions/profile";
import { Button } from "@/components/ui/Button";

const initialState: ActionResult = { ok: false };

export function ProfileCompletionForm({ onComplete }: { onComplete: () => void }) {
  const [state, formAction, pending] = useActionState(completeProfileAction, initialState);
  const [interestsText, setInterestsText] = useState("");

  useEffect(() => {
    if (state.ok) onComplete();
  }, [state.ok, onComplete]);

  const interests = interestsText
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-carbon/10 bg-warm-white p-6">
      <p className="font-medium">Completa tu perfil para reservar</p>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="full_name" className="text-sm font-medium">
          Nombre completo
        </label>
        <input
          id="full_name"
          name="full_name"
          required
          aria-describedby={state.fieldErrors?.full_name ? "full_name-error" : undefined}
          className="rounded-lg border border-carbon/20 bg-warm-white px-4 py-3 focus:border-carbon"
        />
        {state.fieldErrors?.full_name && (
          <p id="full_name-error" className="text-sm text-orange-ink">
            {state.fieldErrors.full_name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium">
          WhatsApp (opcional)
        </label>
        <input id="phone" name="phone" className="rounded-lg border border-carbon/20 bg-warm-white px-4 py-3 focus:border-carbon" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="city" className="text-sm font-medium">
          Ciudad
        </label>
        <input
          id="city"
          name="city"
          defaultValue="Monterrey"
          className="rounded-lg border border-carbon/20 bg-warm-white px-4 py-3 focus:border-carbon"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="interests" className="text-sm font-medium">
          Intereses (opcional, separados por coma)
        </label>
        <input
          id="interests"
          placeholder="yoga, café, outdoor"
          value={interestsText}
          onChange={(e) => setInterestsText(e.target.value)}
          className="rounded-lg border border-carbon/20 bg-warm-white px-4 py-3 focus:border-carbon"
        />
        {interests.map((interest) => (
          <input key={interest} type="hidden" name="interests" value={interest} />
        ))}
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="adult_confirmed" required className="mt-1" />
        <span>Confirmo que tengo 18 años o más.</span>
      </label>
      {state.fieldErrors?.adult_confirmed && <p className="text-sm text-orange-ink">{state.fieldErrors.adult_confirmed}</p>}

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="terms_accepted" required className="mt-1" />
        <span>
          Acepto los{" "}
          <a href="/terminos" className="underline" target="_blank" rel="noreferrer">
            términos
          </a>{" "}
          y el{" "}
          <a href="/privacidad" className="underline" target="_blank" rel="noreferrer">
            aviso de privacidad
          </a>
          .
        </span>
      </label>
      {state.fieldErrors?.terms_accepted && <p className="text-sm text-orange-ink">{state.fieldErrors.terms_accepted}</p>}

      {state.error && !state.fieldErrors && (
        <p role="alert" className="text-sm text-orange-ink">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Continuar"}
      </Button>
    </form>
  );
}
