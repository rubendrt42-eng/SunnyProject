"use client";

import { useActionState, useState } from "react";
import { updateAccountAction, type ActionResult } from "@/lib/actions/profile";
import { Button } from "@/components/ui/Button";
import type { Profile } from "@/lib/database.types";

const initialState: ActionResult = { ok: false };

export function AccountForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateAccountAction, initialState);
  const [interestsText, setInterestsText] = useState(profile.interests.join(", "));

  const interests = interestsText
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="full_name" className="text-sm font-medium">
          Nombre completo
        </label>
        <input
          id="full_name"
          name="full_name"
          required
          defaultValue={profile.full_name ?? ""}
          className="rounded-lg border border-carbon/20 bg-warm-white px-4 py-3 focus:border-carbon"
        />
        {state.fieldErrors?.full_name && <p className="text-sm text-orange">{state.fieldErrors.full_name}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium">
          WhatsApp (opcional)
        </label>
        <input
          id="phone"
          name="phone"
          defaultValue={profile.phone ?? ""}
          className="rounded-lg border border-carbon/20 bg-warm-white px-4 py-3 focus:border-carbon"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="city" className="text-sm font-medium">
          Ciudad
        </label>
        <input
          id="city"
          name="city"
          defaultValue={profile.city ?? "Monterrey"}
          className="rounded-lg border border-carbon/20 bg-warm-white px-4 py-3 focus:border-carbon"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="interests" className="text-sm font-medium">
          Intereses (opcional, separados por coma)
        </label>
        <input
          id="interests"
          value={interestsText}
          onChange={(e) => setInterestsText(e.target.value)}
          className="rounded-lg border border-carbon/20 bg-warm-white px-4 py-3 focus:border-carbon"
        />
        {interests.map((interest) => (
          <input key={interest} type="hidden" name="interests" value={interest} />
        ))}
      </div>

      {state.ok && (
        <p role="status" className="text-sm text-emerald-700">
          Guardado.
        </p>
      )}
      {state.error && !state.fieldErrors && (
        <p role="alert" className="text-sm text-orange">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
