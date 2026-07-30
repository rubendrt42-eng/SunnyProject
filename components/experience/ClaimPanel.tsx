"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { ExperienceCta } from "@/lib/experience-cta";
import { CTA_LABEL } from "@/lib/experience-cta";
import { reservationErrorMessage } from "@/lib/constants";
import { Button, LinkButton } from "@/components/ui/Button";
import { ProfileCompletionForm } from "@/components/experience/ProfileCompletionForm";

type Step = ExperienceCta["type"] | "confirm" | "claiming" | "success" | "error";

const INFO_MESSAGES: Partial<Record<Step, string>> = {
  cancelled: "Esta experiencia fue cancelada por el equipo de Sunny Project.",
  completed: "Esta experiencia ya finalizó. Explora otras disponibles.",
  sold_out: "Se agotaron los lugares para esta experiencia.",
  closed: "Las reservaciones para esta experiencia están cerradas.",
  already_reserved: "Ya tienes una reservación para esta experiencia. Consulta tu pase.",
  pass_used_elsewhere: "Ya usaste tu pase de esta semana en otra experiencia.",
};

export function ClaimPanel({
  experienceId,
  experienceSlug,
  initialCta,
  source,
  maxPartySize = 1,
  spotsLeft,
}: {
  experienceId: string;
  experienceSlug: string;
  initialCta: ExperienceCta["type"];
  source: string | null;
  /** From the experience. 1 means individual-only, which is the default for every experience. */
  maxPartySize?: number;
  /** Real remaining spots, so the selector can't offer more places than exist. */
  spotsLeft?: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialCta === "claimable" ? "confirm" : initialCta);
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [folio, setFolio] = useState<string | null>(null);
  const [partySize, setPartySize] = useState(1);
  const [companions, setCompanions] = useState<{ full_name: string; email: string }[]>([]);

  /**
   * The selector is capped by BOTH the experience's allowance and the spots
   * actually left, so it can never offer a group the experience cannot seat.
   * The database re-checks both anyway — that is the check that counts — but
   * offering an impossible option and then rejecting it is a bad experience.
   */
  const selectableMax = Math.max(1, Math.min(maxPartySize, spotsLeft ?? maxPartySize));
  const allowsGroups = selectableMax > 1;

  function changePartySize(next: number) {
    setPartySize(next);
    setCompanions((current) => {
      const needed = next - 1;
      if (needed <= current.length) return current.slice(0, needed);
      return [...current, ...Array.from({ length: needed - current.length }, () => ({ full_name: "", email: "" }))];
    });
  }

  function updateCompanion(index: number, field: "full_name" | "email", value: string) {
    setCompanions((current) => current.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  }

  const companionsIncomplete = companions.some((c) => c.full_name.trim().length < 2);

  async function handleClaim() {
    // Guards against a double-click/double-tap firing two claims before
    // React re-renders the disabled button — the transactional RPC would
    // reject the second one anyway, but this avoids a wasted request.
    if (step === "claiming") return;

    setStep("claiming");
    setError(null);

    try {
      const res = await fetch("/api/reservations/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienceId,
          source,
          acknowledgement: true,
          partySize,
          companions: companions.map((c) => ({
            full_name: c.full_name.trim(),
            email: c.email.trim() || undefined,
          })),
        }),
      });

      const body = await res.json().catch(() => ({ code: "UNKNOWN_ERROR" }));

      if (!res.ok) {
        const code = body.code as string;
        if (code === "EXPERIENCE_SOLD_OUT") setStep("sold_out");
        else if (code === "WEEKLY_PASS_ALREADY_USED") setStep("pass_used_elsewhere");
        else if (code === "ALREADY_RESERVED_EXPERIENCE") setStep("already_reserved");
        else if (code === "NOT_AUTHENTICATED") setStep("login");
        else if (code === "PROFILE_INCOMPLETE") setStep("profile_incomplete");
        else if (code === "CLAIM_WINDOW_CLOSED" || code === "EXPERIENCE_PAST") setStep("closed");
        else {
          setStep("error");
          setError(reservationErrorMessage(code));
        }
        return;
      }

      setFolio(body.reservation.folio);
      setStep("success");
      router.refresh();
    } catch {
      // A network failure (offline, DNS, timeout) — without this, the button
      // would stay stuck on "Reservando…" forever with no way to retry.
      setStep("error");
      setError("No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.");
    }
  }

  if (step === "login") {
    return (
      <div id="reservar" className="rounded-2xl border border-carbon/10 bg-warm-white p-6">
        <p className="font-medium">Inicia sesión para obtener tu pase</p>
        <p className="mt-1 text-sm text-gray">Usamos un enlace mágico enviado a tu correo, sin contraseñas.</p>
        <LinkButton href={`/acceso?next=${encodeURIComponent(`/experiencias/${experienceSlug}`)}`} className="mt-4">
          Iniciar sesión
        </LinkButton>
      </div>
    );
  }

  if (step === "profile_incomplete") {
    return (
      <div id="reservar">
        <ProfileCompletionForm onComplete={() => setStep("confirm")} />
      </div>
    );
  }

  if (step === "success") {
    return (
      <div id="reservar" role="status" className="rounded-2xl border border-carbon/10 bg-warm-white p-6">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-sunny"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </motion.div>
        <p className="mt-4 font-medium text-carbon">¡Pase confirmado!</p>
        <p className="mt-1 text-small text-gray">
          Tu folio es <strong>{folio}</strong>. Te enviamos los detalles por correo.
        </p>
        {partySize > 1 && (
          <p className="mt-2 text-small text-gray">
            Reservaste {partySize} lugares. Presenta tu folio al llegar: incluye a{" "}
            {companions.map((c) => c.full_name.trim()).filter(Boolean).join(" y ")}.
          </p>
        )}
        <LinkButton href="/mi-pase" className="mt-4">
          Ver mi pase
        </LinkButton>
      </div>
    );
  }

  if (INFO_MESSAGES[step]) {
    return (
      <div id="reservar" className="rounded-2xl border border-carbon/10 bg-warm-white p-6">
        <p className="font-medium">{CTA_LABEL[step as ExperienceCta["type"]]}</p>
        <p className="mt-1 text-sm text-gray">{INFO_MESSAGES[step]}</p>
        {(step === "already_reserved" || step === "pass_used_elsewhere") && (
          <LinkButton href="/mi-pase" className="mt-4">
            Ver mi pase
          </LinkButton>
        )}
        {(step === "sold_out" || step === "cancelled" || step === "completed") && (
          <LinkButton href="/experiencias" className="mt-4" variant="outline">
            Ver otras experiencias
          </LinkButton>
        )}
      </div>
    );
  }

  // step === "confirm" | "claiming" | "error"
  return (
    <div id="reservar" className="rounded-lg border border-carbon/10 bg-warm-white p-6">
      {/* Group selection only appears when the experience actually allows it.
          Every experience is born individual (decision 8), so for most of
          them this whole block is absent and the flow is exactly what it was. */}
      {allowsGroups && (
        <fieldset className="mb-5">
          <legend className="text-heading">¿Cuántos lugares?</legend>
          <p className="mt-1 text-small text-gray">
            Puedes reservar hasta {selectableMax} con un solo pase. Los lugares se descuentan del cupo.
          </p>

          <div className="mt-3 flex gap-2" role="group" aria-label="Número de lugares">
            {Array.from({ length: selectableMax }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => changePartySize(n)}
                aria-pressed={partySize === n}
                className={
                  partySize === n
                    ? "min-h-11 min-w-14 rounded-md border border-carbon bg-sunny px-4 text-small font-semibold text-carbon"
                    : "min-h-11 min-w-14 rounded-md border border-carbon/20 px-4 text-small font-medium text-carbon/75 hover:border-carbon/50"
                }
              >
                {n}
              </button>
            ))}
          </div>

          {companions.length > 0 && (
            <div className="mt-4 flex flex-col gap-4">
              <p className="text-small text-gray">
                Escribe el nombre de {companions.length === 1 ? "tu acompañante" : "tus acompañantes"}. El correo es
                opcional.
              </p>
              {companions.map((companion, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-small font-medium">Acompañante {i + 1} — nombre completo</span>
                    <input
                      type="text"
                      required
                      value={companion.full_name}
                      onChange={(e) => updateCompanion(i, "full_name", e.target.value)}
                      autoComplete="off"
                      className="h-11 rounded-sm border border-carbon/20 bg-warm-white px-3 text-body focus:border-carbon"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-small text-gray">Correo (opcional)</span>
                    <input
                      type="email"
                      value={companion.email}
                      onChange={(e) => updateCompanion(i, "email", e.target.value)}
                      autoComplete="off"
                      className="h-11 rounded-sm border border-carbon/20 bg-warm-white px-3 text-body focus:border-carbon"
                    />
                  </label>
                </div>
              ))}
              <p className="text-small text-gray">
                Los nombres se registran al reservar y no se pueden cambiar después. Si cancelas, se cancelan todos los
                lugares del grupo.
              </p>
            </div>
          )}
        </fieldset>
      )}

      <label className="flex items-start gap-3 text-small">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          className="mt-1"
        />
        <span>
          {partySize > 1
            ? "Entiendo que el pase es personal, que respondo por mi grupo y que debo cancelar con al menos 12 horas de anticipación."
            : "Entiendo que el pase es personal, no transferible y que debo cancelar con al menos 12 horas de anticipación."}
        </span>
      </label>

      {error && (
        <p role="alert" className="mt-3 text-small text-orange">
          {error}
        </p>
      )}

      <Button
        onClick={handleClaim}
        disabled={!acknowledged || companionsIncomplete}
        loading={step === "claiming"}
        loadingLabel="Reservando…"
        className="mt-4 w-full"
      >
        {partySize > 1 ? `Reservar ${partySize} lugares` : CTA_LABEL.claimable}
      </Button>

      {companionsIncomplete && (
        <p className="mt-2 text-small text-gray">
          Completa el nombre de {companions.length === 1 ? "tu acompañante" : "tus acompañantes"} para continuar.
        </p>
      )}
    </div>
  );
}
