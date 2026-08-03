"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Mail, UserX, X } from "lucide-react";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import type { ReservationStatus } from "@/lib/database.types";

/**
 * Acciones sobre una reservación: marcar asistencia, cancelar, reenviar correo.
 *
 * Todas pasan por la red, así que todas tienen que decir que están pasando.
 * Antes no lo decían: el estado `loading` se guardaba y no se dibujaba, y los
 * botones ni siquiera se atenuaban al desactivarse. Pulsar «Asistió» dejaba la
 * pantalla idéntica hasta que volvía la respuesta.
 */
export function ReservationRowActions({ reservationId, status }: { reservationId: string; status: ReservationStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function call(url: string, action: string, body?: object) {
    if (loading) return;
    setLoading(action);
    setError(null);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({ code: "UNKNOWN_ERROR" }));

      setLoading(null);
      if (!res.ok) {
        setError(data.code ?? "Ocurrió un error.");
        return;
      }
      router.refresh();
    } catch {
      // A network failure here would otherwise leave every button in this
      // row permanently disabled with no way to retry.
      setLoading(null);
      setError("No pudimos conectar con el servidor.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "confirmed" && (
        <>
          <AdminActionButton
            label="Asistió"
            icon={Check}
            tone="positive"
            busy={loading === "attended"}
            disabled={loading !== null}
            onClick={() => call(`/api/admin/reservations/${reservationId}/attendance`, "attended", { status: "attended" })}
          />
          <AdminActionButton
            label="No-show"
            icon={UserX}
            busy={loading === "no_show"}
            disabled={loading !== null}
            onClick={() => call(`/api/admin/reservations/${reservationId}/attendance`, "no_show", { status: "no_show" })}
          />
          <AdminActionButton
            label="Cancelar"
            icon={X}
            tone="danger"
            busy={loading === "cancel"}
            disabled={loading !== null}
            onClick={() => {
              if (confirm("¿Cancelar esta reservación?")) call(`/api/admin/reservations/${reservationId}/cancel`, "cancel");
            }}
          />
        </>
      )}
      <AdminActionButton
        label="Reenviar correo"
        busyLabel="Reenviando el correo"
        icon={Mail}
        busy={loading === "resend"}
        disabled={loading !== null}
        onClick={() => call(`/api/admin/reservations/${reservationId}/resend-email`, "resend")}
      />
      {error && (
        <span role="status" className="text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
