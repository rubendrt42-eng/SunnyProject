"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

/**
 * Cancelar una experiencia no es reversible y no afecta solo a la
 * experiencia: cancela TODAS sus reservaciones confirmadas y devuelve el pase
 * de cada persona.
 *
 * Antes se confirmaba con `window.confirm()`. Dos problemas: el diálogo nativo
 * se descarta por costumbre sin leerlo, y sobre todo **no decía a cuánta gente
 * afectaba**. «Se cancelarán 8 reservaciones» pesa distinto que una frase
 * genérica, y es justo el dato que hace dudar antes de pulsar.
 *
 * Ahora el número va delante, el diálogo es propio, y el botón destructivo
 * está separado del de cerrar para que no se pulse por inercia.
 */
export function CancelExperienceButton({
  experienceId,
  disabled,
  affectedPeople,
  title,
}: {
  experienceId: string;
  disabled?: boolean;
  /** Personas con reservación confirmada que perderán su lugar. */
  affectedPeople: number;
  title?: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/admin/experiences/${experienceId}/cancel`, { method: "POST" });
    const body = await res.json().catch(() => ({ code: "UNKNOWN_ERROR" }));

    if (!res.ok) {
      setError(body.code ?? "No se pudo cancelar.");
      setLoading(false);
      return;
    }

    setConfirming(false);
    setLoading(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div role="alertdialog" aria-labelledby="cancelar-titulo" className="rounded-md border border-red-300 bg-red-50 p-4">
        <div className="flex gap-3">
          <AlertTriangle aria-hidden size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-red-700" />
          <div className="min-w-0">
            <p id="cancelar-titulo" className="text-small font-semibold text-red-900">
              {affectedPeople === 0
                ? "¿Cancelar esta experiencia?"
                : `Vas a cancelar ${affectedPeople} ${affectedPeople === 1 ? "reservación" : "reservaciones"}`}
            </p>
            <p className="mt-1 text-small text-red-900/80">
              {affectedPeople === 0
                ? "Todavía no tiene reservaciones, así que no afecta a nadie. La experiencia dejará de aparecer como reservable."
                : `${affectedPeople === 1 ? "Esa persona recuperará su pase" : "Esas personas recuperarán su pase"} de la semana y ${affectedPeople === 1 ? "dejará" : "dejarán"} de tener lugar${affectedPeople === 1 ? "" : "es"} en ${title ? `«${title}»` : "esta experiencia"}. No se puede deshacer.`}
            </p>

            {error && (
              <p role="alert" className="mt-3 text-small font-medium text-red-700">
                {error}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {/* El botón de no hacer nada va primero: es el que se pulsa por
                  inercia, y aquí la inercia debe ser la opción segura. */}
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  setError(null);
                }}
                disabled={loading}
                className="min-h-10 rounded-md border border-neutral-300 bg-white px-4 text-small font-medium text-neutral-700 disabled:opacity-50"
              >
                Mejor no
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="min-h-10 rounded-md bg-red-700 px-4 text-small font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-50"
              >
                {loading ? "Cancelando…" : "Sí, cancelar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={disabled}
        className="min-h-10 rounded-md border border-red-300 px-4 text-small font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
      >
        Cancelar experiencia
      </button>
      {error && <p className="mt-1 text-small text-red-600">{error}</p>}
    </div>
  );
}
