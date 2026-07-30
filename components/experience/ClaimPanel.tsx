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
}: {
  experienceId: string;
  experienceSlug: string;
  initialCta: ExperienceCta["type"];
  source: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialCta === "claimable" ? "confirm" : initialCta);
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [folio, setFolio] = useState<string | null>(null);

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
        body: JSON.stringify({ experienceId, source, acknowledgement: true }),
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
        <p className="mt-1 text-sm text-gray">
          Tu folio es <strong>{folio}</strong>. Te enviamos los detalles por correo.
        </p>
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
    <div id="reservar" className="rounded-2xl border border-carbon/10 bg-warm-white p-6">
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          className="mt-1"
        />
        <span>
          Entiendo que el pase es personal, no transferible y que debo cancelar con al menos 12 horas de
          anticipación.
        </span>
      </label>

      {error && (
        <p role="alert" className="mt-3 text-sm text-orange">
          {error}
        </p>
      )}

      <Button onClick={handleClaim} disabled={!acknowledged || step === "claiming"} className="mt-4">
        {step === "claiming" ? "Reservando…" : CTA_LABEL.claimable}
      </Button>
    </div>
  );
}
